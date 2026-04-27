import { QtestApiError } from "./types.js";
import type { ToolResponse } from "./types.js";

export class QtestApiClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = process.env.QTEST_BASE_URL || "https://qtest.disney.com";
    const token = process.env.QTEST_BEARER_TOKEN ?? "";
    if (!token || !token.trim() || token.trim() !== token) {
      throw new Error(
        "QTEST_BEARER_TOKEN is missing or contains leading/trailing whitespace. " +
                "Set QTEST_BEARER_TOKEN (or QTEST_TOKEN) in ~/.kiro/env.vars or your .env file.",
      );
    }
    this.token = token;
  }

  private static readonly MAX_RETRIES = 3;
  private static readonly REQUEST_TIMEOUT_MS = 30_000;

  async request<T>(method: string, path: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let response: Response | undefined;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= QtestApiClient.MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), QtestApiClient.REQUEST_TIMEOUT_MS);

      try {
        response = await fetch(url, {
          method,
          headers: {
            "Authorization": `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
      } catch (error) {
        clearTimeout(timer);
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new QtestApiError(0, `Request timed out after ${QtestApiClient.REQUEST_TIMEOUT_MS}ms`, url);
        }
        if (error instanceof TypeError) {
          throw new QtestApiError(0, error.message, url);
        }
        throw error;
      } finally {
        clearTimeout(timer);
      }

      // Retry on 429 (rate limit) and 502/503/504 (transient server errors)
      const retryable = response.status === 429 || response.status === 502 || response.status === 503 || response.status === 504;
      if (!retryable || attempt === QtestApiClient.MAX_RETRIES) break;

      const label = response.status === 429 ? "Rate limited" : `Server error ${response.status}`;
      const delay = Math.pow(2, attempt) * 1000;
      console.error(`[qtest-mcp] ${label}, retrying in ${delay}ms (attempt ${attempt + 1}/${QtestApiClient.MAX_RETRIES})`);
      lastError = new QtestApiError(response.status, await response.text(), url);
      await new Promise(r => setTimeout(r, delay));
    }

    if (!response) {
      throw lastError ?? new QtestApiError(0, "No response received after retries", url);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      const suffix = response.status === 429 ? ` (after ${QtestApiClient.MAX_RETRIES} retries)` : "";
      throw new QtestApiError(response.status, errorBody + suffix, url);
    }

    const text = await response.text();
    if (!text) return undefined as unknown as T;
    return JSON.parse(text) as T;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T>(path: string, body: any): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async put<T>(path: string, body: any): Promise<T> {
    return this.request<T>("PUT", path, body);
  }
}

/**
 * Resolves the project ID from the provided argument or the QTEST_PROJECT_ID env var.
 * Throws if neither is available.
 */
export function resolveProjectId(argsProjectId?: number): number {
  if (argsProjectId !== undefined && argsProjectId !== null) {
    return argsProjectId;
  }
  const envId = process.env.QTEST_PROJECT_ID;
  if (envId) {
    const parsed = Number(envId);
    if (!Number.isNaN(parsed)) return parsed;
  }
  throw new Error(
    "No projectId provided and QTEST_PROJECT_ID is not configured. " +
        "Pass projectId as a parameter or set QTEST_PROJECT_ID in ~/.kiro/env.vars.",
  );
}

export function mapApiError(error: QtestApiError): string {
  if (error.statusCode === 401) {
    return "Authentication failed: bearer token is invalid or expired. Regenerate your qTest API token.";
  }
  if (error.statusCode === 403) {
    return "Permission denied: insufficient permissions for this operation. Check your qTest role.";
  }
  if (error.statusCode === 404) {
    return "Resource not found: the requested resource does not exist in qTest.";
  }
  if (error.statusCode === 0) {
    return `Connection failed: unable to reach qTest API at ${error.url}. Check network and URL.`;
  }
  return `qTest API error ${error.statusCode}: ${error.responseBody}`;
}

/**
 * Shared error-handling wrapper for all tool handlers.
 * Eliminates duplicated try/catch blocks across handlers.
 */
export async function withErrorHandling(
  fn: () => Promise<ToolResponse>,
): Promise<ToolResponse> {
  try {
    return await fn();
  } catch (error) {
    const message =
      error instanceof QtestApiError
        ? mapApiError(error)
        : `Unexpected error: ${error instanceof Error ? error.message : "Unknown"}`;
    console.error(`[qtest-mcp] ${message}`);
    return { content: [{ type: "text", text: message }], isError: true };
  }
}

// ── Module cache for MD-#### PID resolution ─────────────────────────

// Cache keyed by projectId → { index, timestamp }
const MODULE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface ModuleCacheEntry {
  index: Map<string, number>;
  timestamp: number;
}

const moduleCache = new Map<number, ModuleCacheEntry>();

/** Exported for testing — clears the module cache. */
export function clearModuleCache(): void {
  moduleCache.clear();
}

function buildModuleIndex(modules: any[], index: Map<string, number>): void {
  for (const mod of modules) {
    if (mod.pid) index.set(mod.pid.toUpperCase(), mod.id);
    const children = mod.sub_modules ?? mod.children ?? [];
    if (children.length > 0) buildModuleIndex(children, index);
  }
}

/**
 * Resolve an MD-#### PID to a numeric module ID, using a per-project cache.
 * Fetches the full modules tree on first call per project, then serves from cache.
 */
export async function resolveModulePid(
  client: QtestApiClient,
  projectId: number,
  mdPid: string,
): Promise<number | null> {
  const pid = mdPid.toUpperCase();
  const cached = moduleCache.get(projectId);
  const now = Date.now();

  let index: Map<string, number>;
  if (cached && (now - cached.timestamp) < MODULE_CACHE_TTL_MS) {
    index = cached.index;
  } else {
    const modules = await client.get<any[]>(
      `/api/v3/projects/${projectId}/modules?expand=descendants`,
    );
    index = new Map();
    buildModuleIndex(modules, index);
    moduleCache.set(projectId, { index, timestamp: now });
  }
  return index.get(pid) ?? null;
}

// ── RQ-#### PID resolution via comments endpoint ────────────────────

/**
 * Resolve an RQ-#### PID to a numeric requirement ID.
 * Uses the comments endpoint which accepts PID format, then extracts the
 * numeric ID from the self/requirement link in the response.
 *
 * Re-throws auth/permission errors so callers get accurate diagnostics
 * instead of a misleading "not found".
 */
export async function resolveRequirementPid(
  client: QtestApiClient,
  projectId: number,
  rqPid: string,
): Promise<number | null> {
  try {
    const resp = await client.get<any>(
      `/api/v3/projects/${projectId}/requirements/${rqPid.toLowerCase()}/comments`,
    );
    // Extract numeric ID from the items[].links or top-level links
    const items = resp.items ?? [];
    for (const item of items) {
      for (const link of item.links ?? []) {
        if (link.rel === "requirement" || link.rel === "self") {
          const match = link.href?.match(/\/requirements\/(\d+)/);
          if (match) return Number(match[1]);
        }
      }
    }
    // If no items but the endpoint didn't 404, try the top-level links
    for (const link of resp.links ?? []) {
      const match = link.href?.match(/\/requirements\/(\d+)/);
      if (match) return Number(match[1]);
    }
    return null;
  } catch (error) {
    // Re-throw auth/permission/network errors — only swallow 404
    if (error instanceof QtestApiError && error.statusCode !== 404) {
      throw error;
    }
    return null;
  }
}
