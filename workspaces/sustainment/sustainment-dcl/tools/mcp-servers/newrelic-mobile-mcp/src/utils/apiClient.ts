import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const TIMEOUT_MS = 30000;

export class NewRelicApiClient {
    private apiKey: string | null = null;
    private accountId: string | null = null;
    private region: string = "US";

    async loadConfig() {
        if (this.apiKey && this.accountId) return;

        this.apiKey = process.env.NEWRELIC_API_KEY || null;
        this.accountId = process.env.NEWRELIC_ACCOUNT_ID || null;
        this.region = process.env.NEWRELIC_REGION || "US";

        if (!this.apiKey || !this.accountId) {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = dirname(__filename);
                config({ path: resolve(__dirname, "../../.env") });
                this.apiKey = process.env.NEWRELIC_API_KEY || null;
                this.accountId = process.env.NEWRELIC_ACCOUNT_ID || null;
                this.region = process.env.NEWRELIC_REGION || "US";
            } catch (e) {
                console.error(`Failed to load .env: ${(e as Error).message}`);
            }
        }

        if (!this.apiKey || !this.accountId) {
            throw new Error("Missing NEWRELIC_API_KEY or NEWRELIC_ACCOUNT_ID");
        }
    }

    private get nerdgraphUrl(): string {
        return this.region === "EU"
            ? "https://api.eu.newrelic.com/graphql"
            : "https://api.newrelic.com/graphql";
    }

    async nrql(query: string): Promise<any> {
        await this.loadConfig();
        const gql = `{
            actor {
                account(id: ${this.accountId}) {
                    nrql(query: "${query.replace(/"/g, '\\"')}") {
                        results
                    }
                }
            }
        }`;
        return this.graphql(gql);
    }

    async graphql(query: string): Promise<any> {
        await this.loadConfig();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
            const response = await fetch(this.nerdgraphUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "API-Key": this.apiKey!,
                },
                body: JSON.stringify({ query }),
                signal: controller.signal,
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`NerdGraph error: ${response.status} - ${text}`);
            }

            const data = (await response.json()) as any;
            if (data.errors?.length) {
                throw new Error(`NerdGraph: ${data.errors.map((e: any) => e.message).join("; ")}`);
            }
            return data;
        } finally {
            clearTimeout(timeout);
        }
    }

    async validate(): Promise<void> {
        await this.loadConfig();
        console.error(`[newrelic-mcp] Account: ${this.accountId}, Region: ${this.region}`);
        const result = await this.nrql("SELECT count(*) FROM Transaction SINCE 1 hour ago");
        console.error("[newrelic-mcp] API connection validated");
    }
}

export const apiClient = new NewRelicApiClient();
