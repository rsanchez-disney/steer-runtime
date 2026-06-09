import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const DEFAULT_TIMEOUT_MS = 30000;

const NERDGRAPH_ENDPOINTS: Record<string, string> = {
    US: "https://api.newrelic.com/graphql",
    EU: "https://api.eu.newrelic.com/graphql",
};

export class NewRelicApiClient {
    private apiKey: string | null = null;
    private accountId: string | null = null;
    private region: string = "US";
    private endpoint: string = NERDGRAPH_ENDPOINTS.US;

    async loadConfig() {
        if (!this.apiKey || !this.accountId) {
            this.apiKey = process.env.NEW_RELIC_API_KEY || null;
            this.accountId = process.env.NEW_RELIC_ACCOUNT_ID || null;
            this.region = (process.env.NEW_RELIC_REGION || "US").toUpperCase();

            if (!this.apiKey || !this.accountId) {
                try {
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = dirname(__filename);
                    const envPath = resolve(__dirname, "../../.env");
                    config({ path: envPath });
                    this.apiKey = process.env.NEW_RELIC_API_KEY || null;
                    this.accountId = process.env.NEW_RELIC_ACCOUNT_ID || null;
                    this.region = (process.env.NEW_RELIC_REGION || "US").toUpperCase();
                } catch (e) {
                    console.error(`Failed to load .env file: ${(e as Error).message}`);
                }
            }

            if (!this.apiKey || !this.accountId) {
                throw new Error(
                    "Missing required environment variables: NEW_RELIC_API_KEY, NEW_RELIC_ACCOUNT_ID",
                );
            }

            this.endpoint = NERDGRAPH_ENDPOINTS[this.region] || NERDGRAPH_ENDPOINTS.US;
        }
    }

    getAccountId(): string {
        return this.accountId!;
    }

    async nerdgraph(query: string, variables: Record<string, any> = {}): Promise<any> {
        await this.loadConfig();

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

        try {
            const response = await fetch(this.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "API-Key": this.apiKey!,
                },
                body: JSON.stringify({ query, variables }),
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`NerdGraph API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = (await response.json()) as any;

            if (data.errors && data.errors.length > 0) {
                throw new Error(`NerdGraph query error: ${JSON.stringify(data.errors)}`);
            }

            return data.data;
        } finally {
            clearTimeout(timeout);
        }
    }

    async validate(): Promise<void> {
        const missing: string[] = [];
        if (!process.env.NEW_RELIC_API_KEY) missing.push("NEW_RELIC_API_KEY");
        if (!process.env.NEW_RELIC_ACCOUNT_ID) missing.push("NEW_RELIC_ACCOUNT_ID");

        if (missing.length) {
            throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
        }

        await this.loadConfig();
        console.error(`[newrelic-mcp] Region: ${this.region}`);
        console.error(`[newrelic-mcp] Endpoint: ${this.endpoint}`);
        console.error(`[newrelic-mcp] Account ID: ${this.accountId}`);

        // Test connectivity with a simple query
        console.error("[newrelic-mcp] Testing API connectivity...");
        const result = await this.nerdgraph(`{ actor { user { name email } } }`);
        const user = result?.actor?.user;
        console.error(`[newrelic-mcp] Connected as: ${user?.name || "unknown"} (${user?.email || "unknown"})`);
    }
}

export const apiClient = new NewRelicApiClient();
