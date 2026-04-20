import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
    injectGithubRemotes,
    type AgentJson,
} from "../utils/agentInjection.js";
import type { RemoteConfig } from "../utils/mcpJsonGeneration.js";

// Feature: github-mcp-multi-instance, Property 6: Agent JSON Injection Transforms GitHub Entries

/**
 * Arbitrary for a valid remote name — alphanumeric + underscore, 1-20 chars.
 */
const remoteNameArb = fc.stringMatching(/^[a-z][a-z0-9_]{0,19}$/);

/** Arbitrary for a valid hostname */
const hostnameArb = fc
    .tuple(
        fc.stringMatching(/^[a-z][a-z0-9]{0,10}$/),
        fc.stringMatching(/^[a-z][a-z0-9]{0,10}$/),
    )
    .map(([a, b]) => `${a}.${b}`);

/** Arbitrary for a GitHub token */
const tokenArb = fc.stringMatching(/^ghp_[a-zA-Z0-9]{4,20}$/);

/** Arbitrary for an optional API path */
const apiPathArb = fc.option(
    fc.stringMatching(/^\/[a-z]{1,8}\/v[0-9]$/).filter((p) => p.length > 0),
    { nil: undefined },
);

/**
 * Arbitrary for a single RemoteConfig.
 */
const remoteConfigArb = fc
    .tuple(remoteNameArb, hostnameArb, tokenArb, apiPathArb)
    .map(([name, host, token, apiPath]): RemoteConfig => ({
        name,
        host,
        token,
        ...(apiPath !== undefined ? { apiPath } : {}),
    }));

/**
 * Arbitrary for an array of 1+ RemoteConfigs with unique names.
 */
const remotesArb = (minLength: number, maxLength: number) =>
    fc.uniqueArray(remoteConfigArb, {
        minLength,
        maxLength,
        selector: (r) => r.name,
    });


/** Arbitrary for other (non-github) mcpServers entries */
const otherServerNameArb = fc.constantFrom("jira", "confluence", "mermaid");

const otherServerEntryArb = fc.record({
    command: fc.constant("node"),
    args: fc.constant(["/path/to/server.js"]),
    env: fc.record({
        TOKEN: tokenArb,
    }),
});

/**
 * Arbitrary for a base agent JSON with a "github" entry and 0-3 other servers.
 */
const agentJsonWithGithubArb = fc
    .tuple(
        fc.constant("node"),
        fc.constant(["/home/user/.kiro/tools/mcp-servers/github-mcp/dist/index.cjs"]),
        fc.uniqueArray(
            fc.tuple(otherServerNameArb, otherServerEntryArb),
            { minLength: 0, maxLength: 3, selector: ([name]) => name },
        ),
    )
    .map(([command, args, others]): AgentJson => {
        const mcpServers: Record<string, any> = {
            github: {
                command,
                args,
                env: { GITHUB_TOKEN: "placeholder" },
            },
        };
        for (const [name, entry] of others) {
            mcpServers[name] = entry;
        }
        return { mcpServers };
    });

/**
 * Arbitrary for an agent JSON WITHOUT a "github" entry.
 */
const agentJsonWithoutGithubArb = fc
    .uniqueArray(
        fc.tuple(otherServerNameArb, otherServerEntryArb),
        { minLength: 1, maxLength: 3, selector: ([name]) => name },
    )
    .map((others): AgentJson => {
        const mcpServers: Record<string, any> = {};
        for (const [name, entry] of others) {
            mcpServers[name] = entry;
        }
        return { mcpServers };
    });

// ============================================================================
// Property-Based Tests — Property 6
// ============================================================================

describe("Agent JSON injection property tests", () => {
    // **Validates: Requirements 6.2**
    it("Property 6: for N ≥ 1 remotes, 'github' is replaced with N 'github-{remote}' entries with flat env vars", () => {
        fc.assert(
            fc.property(
                agentJsonWithGithubArb,
                remotesArb(1, 6),
                (agentJson, remotes) => {
                    const result = injectGithubRemotes(agentJson, remotes);

                    // No bare "github" entry when N ≥ 1
                    expect(result.mcpServers).not.toHaveProperty("github");

                    // Exactly N github-{remote} entries
                    const githubKeys = Object.keys(result.mcpServers).filter((k) =>
                        k.startsWith("github-"),
                    );
                    expect(githubKeys).toHaveLength(remotes.length);

                    // Each entry has correct flat env vars
                    for (const remote of remotes) {
                        const key = `github-${remote.name}`;
                        expect(result.mcpServers).toHaveProperty(key);

                        const entry = result.mcpServers[key];
                        expect(entry.env.GITHUB_REMOTE).toBe(remote.name);
                        expect(entry.env.GITHUB_HOST).toBe(remote.host);
                        expect(entry.env.GITHUB_TOKEN).toBe(remote.token);

                        // GITHUB_API_PATH present only when provided
                        if (remote.apiPath) {
                            expect(entry.env.GITHUB_API_PATH).toBe(remote.apiPath);
                        } else {
                            expect(entry.env).not.toHaveProperty("GITHUB_API_PATH");
                        }

                        // Preserves command and args from original github entry
                        expect(entry.command).toBe(agentJson.mcpServers["github"].command);
                        expect(entry.args).toEqual(agentJson.mcpServers["github"].args);
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    // **Validates: Requirements 6.2**
    it("Property 6: other mcpServers entries (jira, confluence, etc.) are preserved", () => {
        fc.assert(
            fc.property(
                agentJsonWithGithubArb,
                remotesArb(1, 6),
                (agentJson, remotes) => {
                    const result = injectGithubRemotes(agentJson, remotes);

                    // Every non-github key from the original should still be present
                    const originalOtherKeys = Object.keys(agentJson.mcpServers).filter(
                        (k) => k !== "github",
                    );
                    for (const key of originalOtherKeys) {
                        expect(result.mcpServers).toHaveProperty(key);
                        expect(result.mcpServers[key]).toEqual(agentJson.mcpServers[key]);
                    }
                },
            ),
            { numRuns: 100 },
        );
    });

    // **Validates: Requirements 6.2**
    it("Property 6: when no 'github' entry exists, agent JSON is unchanged", () => {
        fc.assert(
            fc.property(
                agentJsonWithoutGithubArb,
                remotesArb(1, 6),
                (agentJson, remotes) => {
                    const result = injectGithubRemotes(agentJson, remotes);

                    // Result should be identical to input
                    expect(result.mcpServers).toEqual(agentJson.mcpServers);
                },
            ),
            { numRuns: 100 },
        );
    });

    // **Validates: Requirements 6.2**
    it("Property 6: when remotes is empty, original 'github' entry is kept", () => {
        fc.assert(
            fc.property(agentJsonWithGithubArb, (agentJson) => {
                const result = injectGithubRemotes(agentJson, []);

                // "github" entry should still be present
                expect(result.mcpServers).toHaveProperty("github");
                expect(result.mcpServers["github"]).toEqual(
                    agentJson.mcpServers["github"],
                );
            }),
            { numRuns: 100 },
        );
    });
});
