import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const DEFAULT_TIMEOUT_MS = 30000;

export class ServiceNowApiClient {
    private instanceUrl: string | null = null;
    private username: string | null = null;
    private password: string | null = null;

    async loadConfig() {
        if (!this.instanceUrl || !this.username || !this.password) {
            this.instanceUrl = process.env.SNOW_INSTANCE || null;
            this.username = process.env.SNOW_API_USERNAME || null;
            this.password = process.env.SNOW_API_PASSWORD || null;

            if (!this.instanceUrl || !this.username || !this.password) {
                try {
                    const __filename = fileURLToPath(import.meta.url);
                    const __dirname = dirname(__filename);
                    const envPath = resolve(__dirname, "../../.env");
                    config({ path: envPath });
                    this.instanceUrl = process.env.SNOW_INSTANCE || null;
                    this.username = process.env.SNOW_API_USERNAME || null;
                    this.password = process.env.SNOW_API_PASSWORD || null;
                } catch (e) {
                    console.error(`Failed to load .env file: ${(e as Error).message}`);
                }
            }

            if (!this.instanceUrl || !this.username || !this.password) {
                throw new Error(
                    "Missing required environment variables: SNOW_INSTANCE, SNOW_API_USERNAME, SNOW_API_PASSWORD",
                );
            }

            this.instanceUrl = this.instanceUrl.replace(/\/+$/, "");
        }
    }

    private authHeader(): string {
        return "Basic " + Buffer.from(`${this.username}:${this.password}`).toString("base64");
    }

    async get(path: string, params: Record<string, string> = {}): Promise<any> {
        await this.loadConfig();
        const qs = new URLSearchParams(params).toString();
        const url = `${this.instanceUrl}/api/now${path}${qs ? `?${qs}` : ""}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: this.authHeader(),
                    Accept: "application/json",
                },
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`ServiceNow API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            return response.json();
        } finally {
            clearTimeout(timeout);
        }
    }

    async patch(path: string, data: Record<string, any>): Promise<any> {
        await this.loadConfig();
        const url = `${this.instanceUrl}/api/now${path}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                method: "PATCH",
                body: JSON.stringify(data),
                headers: {
                    Authorization: this.authHeader(),
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`ServiceNow API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            return response.json();
        } finally {
            clearTimeout(timeout);
        }
    }

    async post(path: string, data: Record<string, any>): Promise<any> {
        await this.loadConfig();
        const url = `${this.instanceUrl}/api/now${path}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    Authorization: this.authHeader(),
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`ServiceNow API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            return response.json();
        } finally {
            clearTimeout(timeout);
        }
    }

    async getSysId(table: string, numberField: string, numberValue: string): Promise<string> {
        const result = await this.get(`/table/${table}`, {
            sysparm_query: `${numberField}=${numberValue}`,
            sysparm_fields: "sys_id",
            sysparm_limit: "1",
        });
        const records = result?.result ?? [];
        if (!records.length) {
            throw new Error(`No ${table} record found with ${numberField}=${numberValue}`);
        }
        return records[0].sys_id;
    }

    async getSysIdByName(table: string, name: string): Promise<string> {
        const result = await this.get(`/table/${table}`, {
            sysparm_query: `name=${name}`,
            sysparm_fields: "sys_id,name",
            sysparm_limit: "1",
        });
        const records = result?.result ?? [];
        if (!records.length) {
            throw new Error(`No ${table} record found with name=${name}`);
        }
        return records[0].sys_id;
    }

    async getUserSysIdByEmail(email: string): Promise<string | null> {
        const result = await this.get("/table/sys_user", {
            sysparm_query: `email=${email}`,
            sysparm_fields: "sys_id",
            sysparm_limit: "1",
        });
        const users = result?.result ?? [];
        return users.length ? users[0].sys_id : null;
    }

    async validate(): Promise<void> {
        // 1. Check required env vars
        const missing: string[] = [];
        if (!process.env.SNOW_INSTANCE) missing.push("SNOW_INSTANCE");
        if (!process.env.SNOW_API_USERNAME) missing.push("SNOW_API_USERNAME");
        if (!process.env.SNOW_API_PASSWORD) missing.push("SNOW_API_PASSWORD");

        if (missing.length) {
            throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
        }

        // 2. Load config
        await this.loadConfig();
        console.error(`[servicenow-mcp] Instance URL: ${this.instanceUrl}`);
        console.error(`[servicenow-mcp] Username: ${this.username}`);

        // 3. Test API connectivity — query a single incident to verify auth
        console.error("[servicenow-mcp] Testing API connectivity...");
        const result = await this.get("/table/incident", {
            sysparm_limit: "1",
            sysparm_fields: "number",
        });
        const count = result?.result?.length ?? 0;
        console.error(`[servicenow-mcp] Connected — auth OK (${count} test record returned)`);
    }
}

export const apiClient = new ServiceNowApiClient();
