import { Octokit } from "@octokit/rest";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve script directory (works in both ESM and CJS bundles)
const scriptDir = (() => {
    try {
        return path.dirname(fileURLToPath(import.meta.url));
    } catch {
        return __dirname;
    }
})();

config({ path: path.join(scriptDir, "..", "..", ".env") });

const githubUrl = process.env.GITHUB_URL || "";
const githubToken = process.env.GITHUB_TOKEN || "";

if (!githubUrl || !githubToken) {
    console.error(
        "Missing required environment variables: GITHUB_URL, GITHUB_TOKEN",
    );
    process.exit(1);
}

// Derive API base URL from the GitHub URL
const apiPath = process.env.GITHUB_API_PATH || "/api/v3";
const apiBaseUrl = `${githubUrl}${apiPath}`;

const octokit = new Octokit({
    auth: githubToken,
    baseUrl: apiBaseUrl,
});

export function getClient(): Octokit {
    return octokit;
}

export function parseRepo(repo: string): { owner: string; repo: string } {
    // Handle full URLs: https://github.disney.com/owner/repo
    if (repo.startsWith("http://") || repo.startsWith("https://")) {
        const url = new URL(repo);
        const parts = url.pathname.split("/").filter(Boolean);
        return { owner: parts[0], repo: parts[1] };
    }
    // Handle owner/repo format
    const [owner, repoName] = repo.split("/");
    return { owner, repo: repoName };
}

export function getGitHubUrl(): string {
    return githubUrl;
}
