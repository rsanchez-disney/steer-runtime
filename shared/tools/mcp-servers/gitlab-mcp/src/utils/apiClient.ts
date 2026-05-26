import { Gitlab } from "@gitbeaker/rest";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = (() => {
    try {
        return path.dirname(fileURLToPath(import.meta.url));
    } catch {
        return __dirname;
    }
})();

config({ path: path.join(scriptDir, "..", "..", ".env") });

export function deriveBaseUrl(
    host?: string,
    url?: string,
    apiPath?: string,
): string {
    if (host && host.length > 0) {
        if (host === "gitlab.com") {
            return "https://gitlab.com";
        }
        return `https://${host}`;
    }

    if (url && url.length > 0) {
        return url;
    }

    throw new Error(
        "Missing GITLAB_HOST or GITLAB_URL. Set GITLAB_HOST in the MCP env block or GITLAB_URL in .env",
    );
}

const gitlabHost = process.env.GITLAB_HOST;
const gitlabToken = process.env.GITLAB_TOKEN || "";

let apiBaseUrl: string;
try {
    apiBaseUrl = deriveBaseUrl(gitlabHost, process.env.GITLAB_URL);
} catch (err) {
    console.error(
        "Missing GITLAB_HOST or GITLAB_URL. Set GITLAB_HOST in the MCP env block or GITLAB_URL in .env",
    );
    process.exit(1);
}

const gitlab = new Gitlab({
    host: apiBaseUrl,
    token: gitlabToken,
});

export function getClient(): InstanceType<typeof Gitlab> {
    return gitlab;
}

export function parseProject(project: string): string {
    if (project.startsWith("http://") || project.startsWith("https://")) {
        const url = new URL(project);
        return url.pathname.slice(1).replace(/\.git$/, "");
    }
    return project;
}

export function getGitLabUrl(): string {
    return apiBaseUrl;
}
