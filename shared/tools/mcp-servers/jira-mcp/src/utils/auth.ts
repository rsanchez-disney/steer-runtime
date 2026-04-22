import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const DEFAULT_JIRA_URL = "https://myjira.disney.com";

export class JiraAuth {
    private jiraPat: string | null = null;
    private jiraUrl: string | null = null;
    private jiraEmail: string | null = null;

    private loadEnv() {
        if (this.jiraPat) return;
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

    /** Returns true if configured for Jira Cloud (JIRA_EMAIL is set). */
    isCloud(): boolean {
        this.loadEnv();
        return !!this.jiraEmail;
    }

    /** Returns the correct API version path: /rest/api/3 for Cloud, /rest/api/2 for Server. */
    apiVersion(): string {
        return this.isCloud() ? "3" : "2";
    }

    /** Returns the correct Authorization header for Cloud (Basic) or Server (Bearer). */
    async getAuthHeader(): Promise<string> {
        this.loadEnv();
        const pat = await this.getJiraPat();
        if (this.jiraEmail) {
            return "Basic " + Buffer.from(this.jiraEmail + ":" + pat).toString("base64");
        }
        return "Bearer " + pat;
    }
}
