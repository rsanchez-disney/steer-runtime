import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const DEFAULT_TIMEOUT_MS = 60000; // Splunk searches can take longer

interface TokenCache {
    sessionKey: string | null;
    expiresAt: number;
}

export class SplunkApiClient {
    private baseUrl: string | null = null;
    private username: string | null = null;
    private password: string | null = null;
    private tokenCache: TokenCache = { sessionKey: null, expiresAt: 0 };

    async loadConfig() {
        if (!this.baseUrl || !this.username || !this.password) {
            this.baseUrl = process.env.SPLUNK_BASE_URL || null;
            this.username = process.env.SPLUNK_USERNAME || null;
            this.password = process.env.SPLUNK_PASSWORD || null;

            if (!this.baseUrl || !this.username || !this.password) {
                try {
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = dirname(__filename);
                    const envPath = resolve(__dirname, "../../.env");
                    config({ path: envPath });
                    this.baseUrl = process.env.SPLUNK_BASE_URL || null;
                    this.username = process.env.SPLUNK_USERNAME || null;
                    this.password = process.env.SPLUNK_PASSWORD || null;
                } catch (e) {
                    console.error(`Failed to load .env file: ${(e as Error).message}`);
                }
            }

            if (!this.baseUrl || !this.username || !this.password) {
                throw new Error(
                    "Missing required environment variables: SPLUNK_BASE_URL, SPLUNK_USERNAME, SPLUNK_PASSWORD",
                );
            }

            this.baseUrl = this.baseUrl.replace(/\/+$/, "");
        }
    }

    private async getSessionKey(): Promise<string> {
        await this.loadConfig();
        const now = Date.now() / 1000;

        if (this.tokenCache.sessionKey && this.tokenCache.expiresAt > now + 60) {
            return this.tokenCache.sessionKey;
        }

        const url = `${this.baseUrl}/services/auth/login`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
            const body = new URLSearchParams({
                username: this.username!,
                password: this.password!,
                output_mode: "json",
            });

            const response = await fetch(url, {
                method: "POST",
                body,
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Splunk auth error: ${response.status} - ${errorText}`);
            }

            const data = (await response.json()) as any;
            this.tokenCache.sessionKey = data.sessionKey;
            // Splunk session keys last ~1 hour by default
            this.tokenCache.expiresAt = now + 3600;
            return data.sessionKey;
        } finally {
            clearTimeout(timeout);
        }
    }

    async get(path: string, params: Record<string, string> = {}): Promise<any> {
        const sessionKey = await this.getSessionKey();
        params.output_mode = "json";
        const qs = new URLSearchParams(params).toString();
        const url = `${this.baseUrl}${path}${qs ? `?${qs}` : ""}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                headers: { Authorization: `Splunk ${sessionKey}` },
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Splunk API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            return response.json();
        } finally {
            clearTimeout(timeout);
        }
    }

    async post(path: string, params: Record<string, string> = {}): Promise<any> {
        const sessionKey = await this.getSessionKey();
        params.output_mode = "json";
        const url = `${this.baseUrl}${path}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                method: "POST",
                body: new URLSearchParams(params),
                headers: { Authorization: `Splunk ${sessionKey}` },
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Splunk API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            return response.json();
        } finally {
            clearTimeout(timeout);
        }
    }

    async createSearch(query: string, params: Record<string, string> = {}): Promise<string> {
        const result = await this.post("/services/search/jobs", {
            search: query.startsWith("search") ? query : `search ${query}`,
            ...params,
        });
        return result.sid;
    }

    async getSearchStatus(sid: string): Promise<any> {
        return this.get(`/services/search/jobs/${sid}`);
    }

    async getSearchResults(sid: string, count: number = 100, offset: number = 0): Promise<any> {
        return this.get(`/services/search/jobs/${sid}/results`, {
            count: String(count),
            offset: String(offset),
        });
    }

    async waitForSearch(sid: string, maxWaitMs: number = 60000): Promise<boolean> {
        const start = Date.now();
        while (Date.now() - start < maxWaitMs) {
            const status = await this.getSearchStatus(sid);
            const entry = status?.entry?.[0]?.content;
            if (entry?.isDone) return true;
            if (entry?.isFailed) throw new Error(`Search failed: ${entry.messages?.[0]?.text || "unknown error"}`);
            await new Promise((r) => setTimeout(r, 1000));
        }
        throw new Error(`Search timed out after ${maxWaitMs}ms`);
    }

    async validate(): Promise<void> {
        const missing: string[] = [];
        if (!process.env.SPLUNK_BASE_URL) missing.push("SPLUNK_BASE_URL");
        if (!process.env.SPLUNK_USERNAME) missing.push("SPLUNK_USERNAME");
        if (!process.env.SPLUNK_PASSWORD) missing.push("SPLUNK_PASSWORD");

        if (missing.length) {
            throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
        }

        await this.loadConfig();
        console.error(`[splunk-mcp] Base URL: ${this.baseUrl}`);
        console.error(`[splunk-mcp] Username: ${this.username}`);

        console.error("[splunk-mcp] Testing authentication...");
        const sessionKey = await this.getSessionKey();
        console.error(`[splunk-mcp] Session key acquired (${sessionKey.substring(0, 8)}...)`);

        console.error("[splunk-mcp] Testing API connectivity...");
        const info = await this.get("/services/server/info");
        const serverName = info?.entry?.[0]?.content?.serverName || "unknown";
        console.error(`[splunk-mcp] Connected — server: ${serverName}`);
    }
}

export const apiClient = new SplunkApiClient();
