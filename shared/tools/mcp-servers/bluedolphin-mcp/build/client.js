"use strict";
/**
 * BlueDolphin API client — handles REST API and OData authentication,
 * rate limiting, and request execution.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlueDolphinClient = void 0;
class BlueDolphinClient {
    config;
    lastRequestTime = 0;
    rateLimitDelay;
    maxRetries;
    timeout;
    constructor(config) {
        this.config = config;
        this.rateLimitDelay = config.rateLimitDelay || 250;
        this.maxRetries = config.maxRetries || 3;
        this.timeout = config.timeout || 30000;
    }
    /** REST API base URL */
    get restBaseUrl() {
        return `https://public-api.${this.config.region}.bluedolphin.app`;
    }
    /** OData base URL */
    get odataBaseUrl() {
        return `https://${this.config.tenant}.odata.bluedolphin.app`;
    }
    /** Rate-limited fetch with retries */
    async request(method, path, body) {
        // Rate limiting
        const now = Date.now();
        const elapsed = now - this.lastRequestTime;
        if (elapsed < this.rateLimitDelay) {
            await sleep(this.rateLimitDelay - elapsed);
        }
        this.lastRequestTime = Date.now();
        let lastError = "";
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const url = this.config.useOData
                    ? `${this.odataBaseUrl}${path}`
                    : `${this.restBaseUrl}${path}`;
                const headers = {
                    "Content-Type": "application/json",
                };
                if (this.config.useOData) {
                    const creds = Buffer.from(`${this.config.odataUsername}:${this.config.odataPassword}`).toString("base64");
                    headers["Authorization"] = `Basic ${creds}`;
                }
                else {
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
                    console.error(`[BlueDolphin] Rate limited, retrying in ${backoff}ms...`);
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
                const data = (await response.json());
                return { ok: true, status: response.status, data };
            }
            catch (err) {
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
    async validateConnection() {
        if (this.config.useOData) {
            return this.request("GET", "/objects?$top=1");
        }
        return this.request("GET", "/liveness");
    }
    /** List objects with optional filters */
    async listObjects(params) {
        if (this.config.useOData) {
            const filters = [];
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
    async getObject(objectId) {
        if (this.config.useOData) {
            return this.request("GET", `/objects('${objectId}')`);
        }
        return this.request("GET", `/v1/objects/${objectId}`);
    }
    /** Search objects by query */
    async searchObjects(params) {
        if (this.config.useOData) {
            const filters = [];
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
    async listWorkspaces() {
        return this.request("GET", "/v1/workspaces");
    }
    /** List object type definitions */
    async listObjectTypes() {
        return this.request("GET", "/v1/object-definitions");
    }
    /** List relations for an object */
    async listRelations(objectId) {
        if (this.config.useOData) {
            return this.request("GET", `/relations?$filter=source_object_id eq '${objectId}' or target_object_id eq '${objectId}'`);
        }
        return this.request("GET", `/v1/relations?object_id=${objectId}`);
    }
}
exports.BlueDolphinClient = BlueDolphinClient;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
