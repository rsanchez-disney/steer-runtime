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

// Load .env for backward compatibility (legacy local dev)
// Requirements: 7.1, 7.4
config({ path: path.join(scriptDir, "..", "..", ".env") });

/**
 * Pure function for URL derivation logic — exported for isolated testing.
 *
 * Priority:
 *   1. host is provided → https://{host}{apiPath}
 *   2. url is provided  → {url}{apiPath}
 *   3. Neither          → throw Error
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 7.2
 */
export function deriveBaseUrl(
    host?: string,
    url?: string,
    apiPath?: string,
): string {
    const resolvedApiPath = apiPath || "/api/v3";

    if (host && host.length > 0) {
        return `https://${host}${resolvedApiPath}`;
    }

    if (url && url.length > 0) {
        return `${url}${resolvedApiPath}`;
    }

    throw new Error(
        "Missing GITHUB_HOST or GITHUB_URL. Set GITHUB_HOST in the MCP env block or GITHUB_URL in .env",
    );
}

// --- Module-level initialization ---
// Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.1, 7.2

const githubHost = process.env.GITHUB_HOST;
const githubToken = process.env.GITHUB_TOKEN || "";
const apiPath = process.env.GITHUB_API_PATH || "/api/v3";

let apiBaseUrl: string;
try {
    apiBaseUrl = deriveBaseUrl(githubHost, process.env.GITHUB_URL, apiPath);
} catch (err) {
    console.error(
        "Missing GITHUB_HOST or GITHUB_URL. Set GITHUB_HOST in the MCP env block or GITHUB_URL in .env",
    );
    process.exit(1);
}

// Derive the host-level URL for getGitHubUrl() export
const githubUrl = githubHost
    ? `https://${githubHost}`
    : process.env.GITHUB_URL || "";

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
