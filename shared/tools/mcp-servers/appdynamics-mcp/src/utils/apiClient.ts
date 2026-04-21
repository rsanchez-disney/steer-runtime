import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const DEFAULT_TIMEOUT_MS = 30000;

interface TokenCache {
    accessToken: string | null;
    expiresAt: number;
}

export class AppDynamicsApiClient {
    private controllerUrl: string | null = null;
    private clientId: string | null = null;
    private clientSecret: string | null = null;
    private tokenCache: TokenCache = { accessToken: null, expiresAt: 0 };

    async loadConfig() {
        if (!this.controllerUrl || !this.clientId || !this.clientSecret) {
            this.controllerUrl = process.env.APPD_CONTROLLER_URL || null;
            this.clientId = process.env.APPD_CLIENT_ID || null;
            this.clientSecret = process.env.APPD_CLIENT_SECRET || null;

            if (!this.controllerUrl || !this.clientId || !this.clientSecret) {
                try {
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = dirname(__filename);
                    const envPath = resolve(__dirname, "../../.env");
                    config({ path: envPath });
                    this.controllerUrl = process.env.APPD_CONTROLLER_URL || null;
                    this.clientId = process.env.APPD_CLIENT_ID || null;
                    this.clientSecret = process.env.APPD_CLIENT_SECRET || null;
                } catch (e) {
                    console.error(`Failed to load .env file: ${(e as Error).message}`);
                }
            }

            if (!this.controllerUrl || !this.clientId || !this.clientSecret) {
                throw new Error(
                    "Missing required environment variables: APPD_CONTROLLER_URL, APPD_CLIENT_ID, APPD_CLIENT_SECRET",
                );
            }

            this.controllerUrl = this.controllerUrl.replace(/\/+$/, "");
        }
    }

    private async getOAuthToken(): Promise<string> {
        await this.loadConfig();
        const now = Date.now() / 1000;

        if (this.tokenCache.accessToken && this.tokenCache.expiresAt > now + 60) {
            return this.tokenCache.accessToken;
        }

        const tokenUrl = `${this.controllerUrl}/controller/api/oauth/access_token`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

        try {
            const body = new URLSearchParams({
                grant_type: "client_credentials",
                client_id: this.clientId!,
                client_secret: this.clientSecret!,
            });

            const response = await fetch(tokenUrl, {
                method: "POST",
                body,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OAuth token error: ${response.status} - ${errorText}`);
            }

            const data = (await response.json()) as any;
            this.tokenCache.accessToken = data.access_token;
            this.tokenCache.expiresAt = now + (data.expires_in || 300);
            return data.access_token;
        } finally {
            clearTimeout(timeout);
        }
    }

    async restGet(path: string, params: Record<string, string> = {}): Promise<any> {
        const token = await this.getOAuthToken();
        params.output = "JSON";
        const qs = new URLSearchParams(params).toString();
        const url = `${this.controllerUrl}/controller/rest${path}${qs ? `?${qs}` : ""}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`AppDynamics API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            return response.json();
        } finally {
            clearTimeout(timeout);
        }
    }

    async rawGet(urlPath: string, params: Record<string, string> = {}): Promise<any> {
        const token = await this.getOAuthToken();
        const qs = new URLSearchParams(params).toString();
        const url = `${this.controllerUrl}${urlPath}${qs ? `?${qs}` : ""}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`AppDynamics API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            return response.json();
        } finally {
            clearTimeout(timeout);
        }
    }

    async resolveAppId(appName: string): Promise<number> {
        const apps = await this.restGet("/applications");
        if (Array.isArray(apps)) {
            const app = apps.find((a: any) => a.name === appName);
            if (app) return app.id;
        }
        throw new Error(`Application '${appName}' not found in AppDynamics`);
    }

    async validate(): Promise<void> {
        // 1. Check required env vars
        const missing: string[] = [];
        if (!process.env.APPD_CONTROLLER_URL) missing.push("APPD_CONTROLLER_URL");
        if (!process.env.APPD_CLIENT_ID) missing.push("APPD_CLIENT_ID");
        if (!process.env.APPD_CLIENT_SECRET) missing.push("APPD_CLIENT_SECRET");

        if (missing.length) {
            throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
        }

        // 2. Load config
        await this.loadConfig();
        console.error(`[appdynamics-mcp] Controller URL: ${this.controllerUrl}`);
        console.error(`[appdynamics-mcp] Client ID: ${this.clientId}`);

        // 3. Test OAuth token acquisition
        console.error("[appdynamics-mcp] Testing OAuth authentication...");
        const token = await this.getOAuthToken();
        console.error(`[appdynamics-mcp] OAuth token acquired (${token.substring(0, 8)}...)`);

        // 4. Test API connectivity — list applications
        console.error("[appdynamics-mcp] Testing API connectivity...");
        const apps = await this.restGet("/applications");
        const count = Array.isArray(apps) ? apps.length : 0;
        console.error(`[appdynamics-mcp] Connected — ${count} application(s) found`);
    }
}

export const apiClient = new AppDynamicsApiClient();
