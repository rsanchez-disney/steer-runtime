import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const DEFAULT_TIMEOUT_MS = 30000;
const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export class SharePointApiClient {
    private tenantId: string | null = null;
    private clientId: string | null = null;
    private clientSecret: string | null = null;
    private siteUrl: string | null = null;
    private accessToken: string | null = null;
    private tokenExpiry = 0;
    private loaded = false;

    private loadEnv() {
        if (this.loaded) return;
        this.loaded = true;

        this.tenantId = process.env.SHAREPOINT_TENANT_ID || null;
        this.clientId = process.env.SHAREPOINT_CLIENT_ID || null;
        this.clientSecret = process.env.SHAREPOINT_CLIENT_SECRET || null;
        this.siteUrl = process.env.SHAREPOINT_SITE_URL || null;

        if (!this.clientId) {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = dirname(__filename);
                config({ path: resolve(__dirname, "../../.env") });
                this.tenantId = this.tenantId || process.env.SHAREPOINT_TENANT_ID || null;
                this.clientId = process.env.SHAREPOINT_CLIENT_ID || null;
                this.clientSecret = process.env.SHAREPOINT_CLIENT_SECRET || null;
                this.siteUrl = this.siteUrl || process.env.SHAREPOINT_SITE_URL || null;
            } catch { /* optional */ }
        }
    }

    private async getToken(): Promise<string> {
        this.loadEnv();
        if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;

        if (!this.tenantId || !this.clientId || !this.clientSecret) {
            throw new Error("SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, and SHAREPOINT_CLIENT_SECRET are required.");
        }

        const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
        const body = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.clientId,
            client_secret: this.clientSecret,
            scope: "https://graph.microsoft.com/.default",
        });

        const res = await fetch(tokenUrl, { method: "POST", body });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Token request failed: ${res.status} - ${err}`);
        }

        const data = await res.json();
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
        return this.accessToken!;
    }

    getSiteUrl(): string {
        this.loadEnv();
        if (!this.siteUrl) throw new Error("SHAREPOINT_SITE_URL is required.");
        return this.siteUrl;
    }

    async graphRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
        const token = await this.getToken();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

        try {
            const res = await fetch(`${GRAPH_BASE}${endpoint}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    ...options.headers,
                },
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(`Graph API error: ${res.status} ${res.statusText} - ${err}`);
            }

            return res.json();
        } finally {
            clearTimeout(timeout);
        }
    }

    /** Parse site URL into hostname and site path for Graph API */
    parseSiteUrl(): { hostname: string; sitePath: string } {
        const url = new URL(this.getSiteUrl());
        const hostname = url.hostname;
        const sitePath = url.pathname;
        return { hostname, sitePath };
    }

    async getSiteId(): Promise<string> {
        const { hostname, sitePath } = this.parseSiteUrl();
        const data = await this.graphRequest(`/sites/${hostname}:${sitePath}`);
        return data.id;
    }
}

export const apiClient = new SharePointApiClient();
