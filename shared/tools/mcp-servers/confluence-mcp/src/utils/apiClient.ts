import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const DEFAULT_CONFLUENCE_URL = "https://confluence.disney.com";
const DEFAULT_TIMEOUT_MS = 30000;
export const USER_AGENT = `ConfluenceMCP/0.1.0 (${process.env.MCP_USER_AGENT_CONTACT || "steer-runtime"}) ${process.env.MCP_USER_AGENT_ENV || "local-dev nonprod"}`;

export class ConfluenceApiClient {
    private confluenceUrl: string | null = null;
    private confluencePat: string | null = null;
    private confluenceEmail: string | null = null;
    private loaded = false;

    private loadEnv() {
        if (this.loaded) return;
        this.loaded = true;

        // First, try reading directly from process.env (set by MCP config)
        this.confluenceUrl = process.env.CONFLUENCE_URL || null;
        this.confluencePat = process.env.CONFLUENCE_PAT || null;
        this.confluenceEmail = process.env.CONFLUENCE_EMAIL || null;

        // Fallback: try loading from .env file if env vars not already set
        if (!this.confluencePat) {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = dirname(__filename);
                const envPath = resolve(__dirname, "../../.env");
                config({ path: envPath });
                this.confluencePat = process.env.CONFLUENCE_PAT || null;
                this.confluenceUrl = this.confluenceUrl || process.env.CONFLUENCE_URL || null;
                this.confluenceEmail = this.confluenceEmail || process.env.CONFLUENCE_EMAIL || null;
            } catch (e) {
                // ignore — .env is optional when env vars are set via MCP config
            }
        }
    }

    getBaseUrl(): string {
        this.loadEnv();
        let url = (this.confluenceUrl || DEFAULT_CONFLUENCE_URL).replace(/\/+$/, "");
        if (url.includes("atlassian.net") && !url.includes("/wiki")) {
            url = `${url}/wiki`;
        }
        return url;
    }

    getPat(): string {
        this.loadEnv();
        if (this.confluencePat) return this.confluencePat;
        throw new Error(
            "CONFLUENCE_PAT not found. Set CONFLUENCE_PAT environment variable or add it to .env file.",
        );
    }

    isCloud(): boolean {
        this.loadEnv();
        return !!this.confluenceEmail;
    }

    getAuthHeader(): string {
        const pat = this.getPat();
        if (this.confluenceEmail) {
            return "Basic " + Buffer.from(this.confluenceEmail + ":" + pat).toString("base64");
        }
        return "Bearer " + pat;
    }

    async makeRequest(endpoint: string, options: RequestInit = {}) {
        const url = `${this.getBaseUrl()}/rest/api/${endpoint}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    Authorization: this.getAuthHeader(),
                    "User-Agent": USER_AGENT,
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
        return this.getBaseUrl();
    }

    getConfluencePat(): string {
        return this.getPat();
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
