import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export class JiraAuth {
    private jiraPat: string | null = null;

    async getJiraPat(): Promise<string> {
        if (this.jiraPat) {
            return this.jiraPat;
        }

        // Load .env file from the jira-mcp directory
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const envPath = resolve(__dirname, "../../.env");
        console.error(`Loading .env from: ${envPath}`);
        config({ path: envPath });

        // Try environment variable (from system or .env file)
        if (process.env.JIRA_PAT) {
            this.jiraPat = process.env.JIRA_PAT;
            return this.jiraPat;
        }

        throw new Error(
            `JIRA PAT not found. Set JIRA_PAT environment variable or add JIRA_PAT=your_token to .env file. Tried loading from: ${envPath}`,
        );
    }
}
