/**
 * SonarQube API client — handles authentication, rate limiting, and request execution.
 */

export interface SonarQubeConfig {
  url: string;
  token: string;
  organization?: string;
  timeout?: number;
}

interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export class SonarQubeClient {
  private config: SonarQubeConfig;
  private timeout: number;

  constructor(config: SonarQubeConfig) {
    this.config = {
      ...config,
      url: config.url.replace(/\/+$/, ""),
    };
    this.timeout = config.timeout || 30000;
  }

  private get baseUrl(): string {
    return this.config.url;
  }

  private get authHeader(): string {
    return `Basic ${Buffer.from(`${this.config.token}:`).toString("base64")}`;
  }

  async request<T = unknown>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(path, this.baseUrl);
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          if (value) url.searchParams.set(key, value);
        }
      }
      if (this.config.organization) {
        url.searchParams.set("organization", this.config.organization);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: this.authHeader,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(this.timeout),
      });

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
      return { ok: false, status: 0, error: `Request failed: ${err.message}` };
    }
  }

  // === API Methods ===

  /** Validate connection */
  async validate(): Promise<ApiResponse> {
    return this.request("/api/system/status");
  }

  /** Search issues (bugs, vulnerabilities, code smells) */
  async getIssues(params: {
    projectKey?: string;
    componentKeys?: string;
    severities?: string;
    types?: string;
    statuses?: string;
    pageSize?: number;
    page?: number;
  }): Promise<ApiResponse> {
    return this.request("/api/issues/search", {
      componentKeys: params.componentKeys || params.projectKey || "",
      severities: params.severities || "",
      types: params.types || "",
      statuses: params.statuses || "",
      ps: String(params.pageSize || 25),
      p: String(params.page || 1),
    });
  }

  /** Get component measures (coverage, bugs, debt, etc.) */
  async getMeasures(params: {
    component: string;
    metricKeys: string;
  }): Promise<ApiResponse> {
    return this.request("/api/measures/component", {
      component: params.component,
      metricKeys: params.metricKeys,
    });
  }

  /** Search security hotspots */
  async getHotspots(params: {
    projectKey: string;
    status?: string;
    pageSize?: number;
  }): Promise<ApiResponse> {
    return this.request("/api/hotspots/search", {
      projectKey: params.projectKey,
      status: params.status || "",
      ps: String(params.pageSize || 25),
    });
  }

  /** List projects */
  async listProjects(params?: {
    query?: string;
    pageSize?: number;
  }): Promise<ApiResponse> {
    return this.request("/api/projects/search", {
      q: params?.query || "",
      ps: String(params?.pageSize || 25),
    });
  }

  /** Get quality gate status */
  async getQualityGate(params: {
    projectKey: string;
  }): Promise<ApiResponse> {
    return this.request("/api/qualitygates/project_status", {
      projectKey: params.projectKey,
    });
  }

  /** Get source code with annotations */
  async getSource(params: {
    key: string;
    from?: number;
    to?: number;
  }): Promise<ApiResponse> {
    return this.request("/api/sources/lines", {
      key: params.key,
      from: params.from ? String(params.from) : "",
      to: params.to ? String(params.to) : "",
    });
  }
}
