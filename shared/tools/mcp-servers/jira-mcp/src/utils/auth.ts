import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export class JiraAuth {
    private jiraPat: string | null = null;

    async getJiraPat(): Promise<string> {
        if (this.jiraPat) {
            return this.jiraPat;
        }

        // First, try reading directly from process.env (set by MCP config)
        if (process.env.JIRA_PAT) {
            this.jiraPat = process.env.JIRA_PAT;
            return this.jiraPat;
        }

        // Fallback: try loading from .env file
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = dirname(__filename);
            const envPath = resolve(__dirname, "../../.env");
            console.error(`Loading .env from: ${envPath}`);
            config({ path: envPath });

            if (process.env.JIRA_PAT) {
                this.jiraPat = process.env.JIRA_PAT;
                return this.jiraPat;
            }
        } catch (e) {
            console.error(`Failed to load .env file: ${(e as Error).message}`);
        }

        throw new Error(
            `JIRA PAT not found. Set JIRA_PAT environment variable or add JIRA_PAT=your_token to .env file.`,
        );
    }
}
