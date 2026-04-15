import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const DEFAULT_JIRA_URL = "https://myjira.disney.com";

export class JiraAuth {
    private jiraPat: string | null = null;
    private jiraUrl: string | null = null;

    private loadEnv() {
        if (this.jiraPat) return;
        // Try env vars first (set by MCP config)
        this.jiraPat = process.env.JIRA_PAT || null;
        this.jiraUrl = process.env.JIRA_URL || null;

        // Fallback: load .env file
        if (!this.jiraPat) {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = dirname(__filename);
                const envPath = resolve(__dirname, "../../.env");
                config({ path: envPath });
                this.jiraPat = process.env.JIRA_PAT || null;
                this.jiraUrl = this.jiraUrl || process.env.JIRA_URL || null;
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
}
