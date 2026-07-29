/**
 * BlueDolphin API client — handles REST API and OData authentication,
 * rate limiting, and request execution.
 */

export interface BlueDolphinConfig {
  apiKey: string;
  tenant: string;
  region: "eu" | "us";
  useOData: boolean;
  odataUsername: string;
  odataPassword: string;
  rateLimitDelay?: number;
  maxRetries?: number;
  timeout?: number;
}

interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export class BlueDolphinClient {
  private config: BlueDolphinConfig;
  private lastRequestTime = 0;
  private rateLimitDelay: number;
  private maxRetries: number;
  private timeout: number;

  constructor(config: BlueDolphinConfig) {
    this.config = config;
    this.rateLimitDelay = config.rateLimitDelay || 250;
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 30000;
  }

  /** REST API base URL */
  private get restBaseUrl(): string {
    return `https://public-api.${this.config.region}.bluedolphin.app`;
  }

  /** OData base URL */
  private get odataBaseUrl(): string {
    return `https://${this.config.tenant}.odata.bluedolphin.app`;
  }

  /** Rate-limited fetch with retries */
  async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    // Rate limiting
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.rateLimitDelay) {
      await sleep(this.rateLimitDelay - elapsed);
    }
    this.lastRequestTime = Date.now();

    let lastError: string = "";
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const url = this.config.useOData
          ? `${this.odataBaseUrl}${path}`
          : `${this.restBaseUrl}${path}`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (this.config.useOData) {
          const creds = Buffer.from(
            `${this.config.odataUsername}:${this.config.odataPassword}`
          ).toString("base64");
          headers["Authorization"] = `Basic ${creds}`;
        } else {
          headers["x-api-key"] = this.config.apiKey;
          headers["tenant"] = this.config.tenant;
        }

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(this.timeout),
        });

        if (response.status === 429) {
          // Rate limited — exponential backoff
          const backoff = this.rateLimitDelay * Math.pow(2, attempt + 1);
          console.error(
            `[BlueDolphin] Rate limited, retrying in ${backoff}ms...`
          );
          await sleep(backoff);
          continue;
        }

        if (!response.ok) {
          const text = await response.text();
          return {
            ok: false,
            status: response.status,
            error: `HTTP ${response.status}: ${text.slice(0, 200)}`,
          };
        }

        const data = (await response.json()) as T;
        return { ok: true, status: response.status, data };
      } catch (err: any) {
        lastError = err.message || String(err);
        if (attempt < this.maxRetries) {
          await sleep(this.rateLimitDelay * Math.pow(2, attempt));
        }
      }
    }

    return { ok: false, status: 0, error: `Request failed: ${lastError}` };
  }

  // === API Methods (read-only) ===

  /** Validate connection by hitting the liveness endpoint */
  async validateConnection(): Promise<ApiResponse> {
    if (this.config.useOData) {
      return this.request("GET", "/objects?$top=1");
    }
    return this.request("GET", "/liveness");
  }

  /** List objects with optional filters */
  async listObjects(params?: {
    workspaceId?: string;
    objectTypeId?: string;
    limit?: number;
  }): Promise<ApiResponse> {
    if (this.config.useOData) {
      const filters: string[] = [];
      if (params?.workspaceId)
        filters.push(`workspace_id eq '${params.workspaceId}'`);
      if (params?.objectTypeId)
        filters.push(`object_type_id eq '${params.objectTypeId}'`);
      const top = params?.limit || 25;
      const query = filters.length
        ? `?$filter=${filters.join(" and ")}&$top=${top}`
        : `?$top=${top}`;
      return this.request("GET", `/objects${query}`);
    }
    return this.request("GET", "/v1/objects");
  }

  /** Get a specific object by ID */
  async getObject(objectId: string): Promise<ApiResponse> {
    if (this.config.useOData) {
      return this.request("GET", `/objects('${objectId}')`);
    }
    return this.request("GET", `/v1/objects/${objectId}`);
  }

  /** Search objects by query */
  async searchObjects(params: {
    query?: string;
    workspaceId?: string;
    objectTypeId?: string;
  }): Promise<ApiResponse> {
    if (this.config.useOData) {
      const filters: string[] = [];
      if (params.query)
        filters.push(`contains(object_title,'${params.query}')`);
      if (params.workspaceId)
        filters.push(`workspace_id eq '${params.workspaceId}'`);
      if (params.objectTypeId)
        filters.push(`object_type_id eq '${params.objectTypeId}'`);
      const query = filters.length
        ? `?$filter=${filters.join(" and ")}`
        : "";
      return this.request("GET", `/objects${query}`);
    }
    // REST API doesn't have a search endpoint — use list with filters
    return this.request("GET", "/v1/objects");
  }

  /** List available workspaces */
  async listWorkspaces(): Promise<ApiResponse> {
    return this.request("GET", "/v1/workspaces");
  }

  /** List object type definitions */
  async listObjectTypes(): Promise<ApiResponse> {
    return this.request("GET", "/v1/object-definitions");
  }

  /** List relations for an object */
  async listRelations(objectId: string): Promise<ApiResponse> {
    if (this.config.useOData) {
      return this.request(
        "GET",
        `/relations?$filter=source_object_id eq '${objectId}' or target_object_id eq '${objectId}'`
      );
    }
    return this.request("GET", `/v1/relations?object_id=${objectId}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
