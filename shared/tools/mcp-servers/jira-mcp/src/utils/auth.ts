import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const DEFAULT_JIRA_URL = "https://disneyexperiences.atlassian.net";

export class JiraAuth {
    private jiraPat: string | null = null;
    private jiraUrl: string | null = null;
    private jiraEmail: string | null = null;

    private loaded = false;

    private loadEnv() {
        if (this.loaded) return;
        this.loaded = true;
        this.jiraPat = process.env.JIRA_PAT || null;
        this.jiraUrl = process.env.JIRA_URL || null;
        this.jiraEmail = process.env.JIRA_EMAIL || null;

        if (!this.jiraPat) {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = dirname(__filename);
                const envPath = resolve(__dirname, "../../.env");
                config({ path: envPath });
                this.jiraPat = process.env.JIRA_PAT || null;
                this.jiraUrl = this.jiraUrl || process.env.JIRA_URL || null;
                this.jiraEmail = this.jiraEmail || process.env.JIRA_EMAIL || null;
            } catch (e) {
                // ignore
            }
        }
    }

    async getJiraPat(): Promise<string> {
        this.loadEnv();
        if (this.jiraPat) return this.jiraPat;
        throw new Error(
            "JIRA_PAT not found. Set JIRA_PAT environment variable or add it to .env file.",
        );
    }

    getBaseUrl(): string {
        this.loadEnv();
        return (this.jiraUrl || DEFAULT_JIRA_URL).replace(/\/+$/, "");
    }

    /** Returns true if configured for Jira Cloud (JIRA_EMAIL is set or URL is *.atlassian.net). */
    isCloud(): boolean {
        this.loadEnv();
        if (this.jiraEmail) return true;
        const url = this.jiraUrl || DEFAULT_JIRA_URL;
        return url.includes(".atlassian.net");
    }

    /** Returns the correct API version path: /rest/api/3 for Cloud, /rest/api/2 for Server. */
    apiVersion(): string {
        return this.isCloud() ? "3" : "2";
    }

    /** Returns raw custom field entries from JIRA_CUSTOM_FIELDS (names or IDs, comma-separated). */
    getRawCustomFields(): string[] {
        this.loadEnv();
        const raw = process.env.JIRA_CUSTOM_FIELDS || "";
        return raw.split(",").map(f => f.trim()).filter(f => f.length > 0);
    }

    /** Returns the correct Authorization header for Cloud (Basic) or Server (Bearer). */
    async getAuthHeader(): Promise<string> {
        this.loadEnv();
        const pat = await this.getJiraPat();
        if (this.jiraEmail) {
            return "Basic " + Buffer.from(this.jiraEmail + ":" + pat).toString("base64");
        }
        // Cloud requires Basic Auth (email:token). If URL is Cloud but no email, warn and try Bearer.
        if (this.isCloud() && !this.jiraEmail) {
            console.error(
                "WARNING: Jira Cloud detected but JIRA_EMAIL is not set. " +
                "Cloud requires Basic Auth (email:api-token). Requests will likely fail with 401. " +
                "Set JIRA_EMAIL in your MCP env configuration."
            );
        }
        return "Bearer " + pat;
    }
}
