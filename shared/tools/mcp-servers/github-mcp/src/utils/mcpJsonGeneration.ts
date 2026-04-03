/**
 * MCP JSON generation utility — produces mcpServers entries for GitHub remotes.
 *
 * This is the TypeScript equivalent of the Python generation logic in setup.sh,
 * extracted here so it can be property-tested with fast-check.
 */

export interface RemoteConfig {
    name: string;
    host: string;
    token: string;
    apiPath?: string;
}

export interface McpEntry {
    command: string;
    args: string[];
    env: Record<string, string>;
}

/**
 * Generate mcpServers entries for the given GitHub remotes.
 *
 * - For N ≥ 1 remotes: returns N entries keyed as `github-{remote.name}`,
 *   each with flat env vars GITHUB_REMOTE, GITHUB_HOST, GITHUB_TOKEN,
 *   and GITHUB_API_PATH only when provided.
 * - For N = 0 remotes: returns a single `github` entry with legacy vars
 *   (GITHUB_URL + GITHUB_TOKEN).
 */
export function generateMcpGithubEntries(
    remotes: RemoteConfig[],
    homePath: string,
): Record<string, McpEntry> {
    const indexPath = `${homePath}/.kiro/tools/mcp-servers/github-mcp/dist/index.cjs`;
    const result: Record<string, McpEntry> = {};

    if (remotes.length === 0) {
        // Legacy fallback — single "github" entry
        result["github"] = {
            command: "node",
            args: [indexPath],
            env: {
                GITHUB_URL: "https://github.disney.com",
                GITHUB_TOKEN: "YOUR_TOKEN",
            },
        };
        return result;
    }

    for (const remote of remotes) {
        const env: Record<string, string> = {
            GITHUB_REMOTE: remote.name,
            GITHUB_HOST: remote.host,
            GITHUB_TOKEN: remote.token,
        };
        if (remote.apiPath) {
            env.GITHUB_API_PATH = remote.apiPath;
        }
        result[`github-${remote.name}`] = {
            command: "node",
            args: [indexPath],
            env,
        };
    }

    return result;
}
