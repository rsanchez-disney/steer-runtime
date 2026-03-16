import { Octokit } from "@octokit/rest";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, "..", "..", ".env") });

interface RemoteConfig {
    token: string;
    apiUrl: string;
}

interface RemoteClients {
    [remoteName: string]: RemoteConfig;
}

// Load remotes from environment variables
function loadRemotesFromEnv(): RemoteClients {
    const remotes: RemoteClients = {};
    const envKeys = Object.keys(process.env);

    envKeys.forEach((key) => {
        const match = key.match(/^GITHUB_TOKEN_(.+)$/);
        if (match) {
            const remoteName = match[1];
            const token = process.env[key];
            const host = process.env[`GITHUB_HOST_${remoteName}`];
            const path = process.env[`GITHUB_PATH_${remoteName}`] || "/api/v3";

            if (token && host) {
                const apiUrl = `https://${host}${path}`;
                remotes[remoteName] = { token, apiUrl };
            }
        }
    });

    return remotes;
}

export const remotes = loadRemotesFromEnv();
export const defaultRemote =
    process.env.GITHUB_DEFAULT_REMOTE || Object.keys(remotes)[0];

if (Object.keys(remotes).length === 0) {
    console.error(
        "No GitHub remotes configured. Please set GITHUB_TOKEN_* and GITHUB_API_URL_* environment variables.",
    );
    process.exit(1);
}

// Get Octokit client for specific remote
export function getClient(remote: string): Octokit {
    const config = remotes[remote];
    if (!config) {
        throw new Error(
            `Unknown remote: ${remote}. Available: ${Object.keys(remotes).join(", ")}`,
        );
    }
    return new Octokit({
        auth: config.token,
        baseUrl: config.apiUrl,
    });
}

// Extract remote from repo URL or use explicit remote parameter
export function getRemoteFromRepo(
    repo: string,
    explicitRemote?: string,
): { remote: string; owner: string; repo: string } {
    if (explicitRemote) {
        const [owner, repoName] = repo.split("/");
        return { remote: explicitRemote, owner, repo: repoName };
    }

    if (repo.startsWith("http://") || repo.startsWith("https://")) {
        const url = new URL(repo);
        const hostname = url.hostname;
        const pathParts = url.pathname.split("/").filter(Boolean);

        // Find matching remote by checking if hostname matches any configured host
        for (const [remoteName, config] of Object.entries(remotes)) {
            if (config.apiUrl.includes(hostname)) {
                return {
                    remote: remoteName,
                    owner: pathParts[0],
                    repo: pathParts[1],
                };
            }
        }

        throw new Error(
            `No remote configured for hostname: ${hostname}. Available remotes: ${Object.keys(remotes).join(", ")}`,
        );
    }

    const [owner, repoName] = repo.split("/");
    return { remote: defaultRemote, owner, repo: repoName };
}
