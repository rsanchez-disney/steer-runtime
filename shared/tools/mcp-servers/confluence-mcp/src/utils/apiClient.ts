import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const DEFAULT_TIMEOUT_MS = 30000;

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

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
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
        } finally {
            clearTimeout(timeout);
        }
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

/**
 * Strip Confluence storage format HTML to plain text.
 * Preserves structure with newlines for headings, lists, and paragraphs.
 */
export function stripHtmlToText(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/?(p|div|tr|li|h[1-6])[^>]*>/gi, "\n")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

/**
 * Truncate text to maxLength, appending a notice if truncated.
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + `\n\n[... truncated at ${maxLength} chars — use outputDir to get full content]`;
}
