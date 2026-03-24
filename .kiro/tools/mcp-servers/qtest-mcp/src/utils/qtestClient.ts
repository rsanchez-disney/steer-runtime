import { QtestApiError } from "./types.js";

export class QtestApiClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = process.env.QTEST_BASE_URL || "https://qtest.disney.com";
    this.token = process.env.QTEST_BEARER_TOKEN!;
  }

  async request<T>(method: string, path: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let response: Response;

    try {
      response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      if (error instanceof TypeError) {
        throw new QtestApiError(0, error.message, url);
      }
      throw error;
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new QtestApiError(response.status, errorBody, url);
    }

    return response.json() as Promise<T>;
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
    "Pass projectId as a parameter or set QTEST_PROJECT_ID in your .env file.",
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

// ── Module cache for MD-#### PID resolution ─────────────────────────

// Cache keyed by projectId → Map<PID, numericId>
const moduleCache = new Map<number, Map<string, number>>();

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
  let index = moduleCache.get(projectId);
  if (!index) {
    const modules = await client.get<any[]>(
      `/api/v3/projects/${projectId}/modules?expand=descendants`,
    );
    index = new Map();
    buildModuleIndex(modules, index);
    moduleCache.set(projectId, index);
  }
  return index.get(pid) ?? null;
}

// ── RQ-#### PID resolution via comments endpoint ────────────────────

/**
 * Resolve an RQ-#### PID to a numeric requirement ID.
 * Uses the comments endpoint which accepts PID format, then extracts the
 * numeric ID from the self/requirement link in the response.
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
  } catch {
    return null;
  }
}
