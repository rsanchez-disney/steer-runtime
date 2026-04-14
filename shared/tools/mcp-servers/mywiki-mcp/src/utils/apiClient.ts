import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export class ConfluenceApiClient {
    private confluenceUrl: string | null = null;
    private confluencePat: string | null = null;

    async loadConfig() {
        if (!this.confluenceUrl || !this.confluencePat) {
            // First, try reading directly from process.env (set by MCP config)
            this.confluenceUrl = process.env.CONFLUENCE_URL || null;
            this.confluencePat = process.env.CONFLUENCE_PAT || null;

            // Fallback: try loading from .env file if env vars not already set
            if (!this.confluenceUrl || !this.confluencePat) {
                try {
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = dirname(__filename);
                    const envPath = resolve(__dirname, "../../.env");
                    console.error(`Loading .env from: ${envPath}`);
                    config({ path: envPath });
                    this.confluenceUrl = process.env.CONFLUENCE_URL || null;
                    this.confluencePat = process.env.CONFLUENCE_PAT || null;
                } catch (e) {
                    console.error(`Failed to load .env file: ${(e as Error).message}`);
                }
            }

            if (!this.confluenceUrl || !this.confluencePat) {
                throw new Error(
                    `Missing required environment variables: CONFLUENCE_URL, CONFLUENCE_PAT.`,
                );
            }

            if (
                this.confluenceUrl.includes("atlassian.net") &&
                !this.confluenceUrl.includes("/wiki")
            ) {
                this.confluenceUrl = `${this.confluenceUrl}/wiki`;
            }
        }
    }

    async makeRequest(endpoint: string, options: RequestInit = {}) {
        await this.loadConfig();
        const url = `${this.confluenceUrl}/rest/api/${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.confluencePat}`,
                Accept: "application/json",
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Confluence API error: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return response.json();
    }

    getConfluenceUrl(): string {
        if (!this.confluenceUrl) {
            throw new Error("Configuration not loaded");
        }
        return this.confluenceUrl;
    }

    getConfluencePat(): string {
        if (!this.confluencePat) {
            throw new Error("Configuration not loaded");
        }
        return this.confluencePat;
    }
}

export const apiClient = new ConfluenceApiClient();
