/**
 * Agent JSON injection utility — replaces a single "github" mcpServers entry
 * with N per-remote "github-{remote}" entries containing flat env vars.
 *
 * This is the TypeScript equivalent of the injection logic in setup.sh's
 * inject_agent_tokens(), extracted here so it can be property-tested with fast-check.
 */

import type { RemoteConfig } from "./mcpJsonGeneration.js";

export interface AgentJson {
    mcpServers: Record<string, any>;
    [key: string]: any;
}

/**
 * Inject per-remote GitHub entries into an agent JSON object.
 *
 * - If agentJson has a "github" mcpServers entry and remotes.length > 0:
 *   - Removes the "github" entry
 *   - Adds N "github-{remote}" entries with flat env vars
 *   - Preserves command and args from the original github entry
 * - If no "github" entry exists, returns unchanged
 * - If remotes is empty, keeps the original "github" entry
 */
export function injectGithubRemotes(
    agentJson: AgentJson,
    remotes: RemoteConfig[],
): AgentJson {
    const original = agentJson.mcpServers["github"];

    // No "github" entry — return unchanged
    if (!original) {
        return agentJson;
    }

    // Empty remotes — keep original "github" entry
    if (remotes.length === 0) {
        return agentJson;
    }

    // Clone mcpServers without the "github" key
    const { github: _removed, ...otherServers } = agentJson.mcpServers;

    // Build per-remote entries
    const remoteEntries: Record<string, any> = {};
    for (const remote of remotes) {
        const env: Record<string, string> = {
            GITHUB_REMOTE: remote.name,
            GITHUB_HOST: remote.host,
            GITHUB_TOKEN: remote.token,
        };
        if (remote.apiPath) {
            env.GITHUB_API_PATH = remote.apiPath;
        }
        remoteEntries[`github-${remote.name}`] = {
            command: original.command,
            args: [...(original.args || [])],
            env,
        };
    }

    return {
        ...agentJson,
        mcpServers: {
            ...otherServers,
            ...remoteEntries,
        },
    };
}
