"use strict";
/**
 * SonarQube API client — handles authentication, rate limiting, and request execution.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SonarQubeClient = void 0;
class SonarQubeClient {
    config;
    timeout;
    constructor(config) {
        this.config = {
            ...config,
            url: config.url.replace(/\/+$/, ""),
        };
        this.timeout = config.timeout || 30000;
    }
    get baseUrl() {
        return this.config.url;
    }
    get authHeader() {
        return `Basic ${Buffer.from(`${this.config.token}:`).toString("base64")}`;
    }
    async request(path, params) {
        try {
            const url = new URL(path, this.baseUrl);
            if (params) {
                for (const [key, value] of Object.entries(params)) {
                    if (value)
                        url.searchParams.set(key, value);
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
            const data = (await response.json());
            return { ok: true, status: response.status, data };
        }
        catch (err) {
            return { ok: false, status: 0, error: `Request failed: ${err.message}` };
        }
    }
    // === API Methods ===
    /** Validate connection */
    async validate() {
        return this.request("/api/system/status");
    }
    /** Search issues (bugs, vulnerabilities, code smells) */
    async getIssues(params) {
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
    async getMeasures(params) {
        return this.request("/api/measures/component", {
            component: params.component,
            metricKeys: params.metricKeys,
        });
    }
    /** Search security hotspots */
    async getHotspots(params) {
        return this.request("/api/hotspots/search", {
            projectKey: params.projectKey,
            status: params.status || "",
            ps: String(params.pageSize || 25),
        });
    }
    /** List projects */
    async listProjects(params) {
        return this.request("/api/projects/search", {
            q: params?.query || "",
            ps: String(params?.pageSize || 25),
        });
    }
    /** Get quality gate status */
    async getQualityGate(params) {
        return this.request("/api/qualitygates/project_status", {
            projectKey: params.projectKey,
        });
    }
    /** Get source code with annotations */
    async getSource(params) {
        return this.request("/api/sources/lines", {
            key: params.key,
            from: params.from ? String(params.from) : "",
            to: params.to ? String(params.to) : "",
        });
    }
}
exports.SonarQubeClient = SonarQubeClient;
