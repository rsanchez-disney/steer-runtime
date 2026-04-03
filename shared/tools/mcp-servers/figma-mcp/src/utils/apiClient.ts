import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const FIGMA_API = "https://api.figma.com/v1";
const TIMEOUT_MS = 30000;

class FigmaApiClient {
    private token: string | null = null;

    async loadConfig() {
        if (!this.token) {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = dirname(__filename);
            config({ path: resolve(__dirname, "../../.env") });
            this.token = process.env.FIGMA_TOKEN || null;
            if (!this.token) {
                throw new Error("Missing FIGMA_TOKEN environment variable");
            }
        }
    }

    async request(endpoint: string): Promise<any> {
        await this.loadConfig();
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
        try {
            const res = await fetch(`${FIGMA_API}${endpoint}`, {
                signal: controller.signal,
                headers: { "X-Figma-Token": this.token! },
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Figma API ${res.status}: ${text}`);
            }
            return res.json();
        } finally {
            clearTimeout(timeout);
        }
    }
}

export const figma = new FigmaApiClient();
