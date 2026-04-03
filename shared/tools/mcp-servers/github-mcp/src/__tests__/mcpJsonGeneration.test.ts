import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
    generateMcpGithubEntries,
    type RemoteConfig,
} from "../utils/mcpJsonGeneration.js";

// Feature: github-mcp-multi-instance, Property 5: MCP JSON Generation from tokens.env

/**
 * Arbitrary for a valid remote name — alphanumeric + underscore, 1-20 chars.
 * Matches the pattern from GITHUB_TOKEN_{remote} keys in tokens.env.
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

/** Arbitrary for a home path */
const homePathArb = fc.constant("/home/testuser");

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
 * Uses uniqueArray to guarantee no duplicate remote names.
 */
const remotesArb = (minLength: number, maxLength: number) =>
    fc
        .uniqueArray(remoteConfigArb, {
            minLength,
            maxLength,
            selector: (r) => r.name,
        });

// ============================================================================
// Property-Based Tests — Property 5
// ============================================================================

describe("MCP JSON generation property tests", () => {
    // **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 8.2, 8.3**
    it("Property 5: for N ≥ 1 remotes, exactly N github-{remote} entries with correct flat env vars", () => {
        fc.assert(
            fc.property(remotesArb(1, 8), homePathArb, (remotes, homePath) => {
                const result = generateMcpGithubEntries(remotes, homePath);
                const keys = Object.keys(result);

                // Exactly N entries
                expect(keys).toHaveLength(remotes.length);

                // Each entry keyed as github-{remote.name}
                for (const remote of remotes) {
                    const key = `github-${remote.name}`;
                    expect(result).toHaveProperty(key);

                    const entry = result[key];

                    // Flat env vars present
                    expect(entry.env.GITHUB_REMOTE).toBe(remote.name);
                    expect(entry.env.GITHUB_HOST).toBe(remote.host);
                    expect(entry.env.GITHUB_TOKEN).toBe(remote.token);

                    // GITHUB_API_PATH present only when provided
                    if (remote.apiPath) {
                        expect(entry.env.GITHUB_API_PATH).toBe(remote.apiPath);
                    } else {
                        expect(entry.env).not.toHaveProperty("GITHUB_API_PATH");
                    }

                    // No suffixed keys in env (e.g., no GITHUB_TOKEN_disney)
                    for (const envKey of Object.keys(entry.env)) {
                        expect(envKey).not.toMatch(/_[a-z][a-z0-9_]*$/);
                    }

                    // command and args structure
                    expect(entry.command).toBe("node");
                    expect(entry.args).toHaveLength(1);
                    expect(entry.args[0]).toContain("github-mcp/dist/index.cjs");
                }
            }),
            { numRuns: 100 },
        );
    });

    // **Validates: Requirements 8.2**
    it("Property 5: when N ≥ 2, no bare 'github' entry exists", () => {
        fc.assert(
            fc.property(remotesArb(2, 8), homePathArb, (remotes, homePath) => {
                const result = generateMcpGithubEntries(remotes, homePath);
                expect(result).not.toHaveProperty("github");
            }),
            { numRuns: 100 },
        );
    });

    // **Validates: Requirements 3.5**
    it("Property 5: when N = 0, returns single 'github' entry with legacy vars", () => {
        const result = generateMcpGithubEntries([], "/home/testuser");

        expect(Object.keys(result)).toEqual(["github"]);
        expect(result.github.env).toHaveProperty("GITHUB_URL");
        expect(result.github.env).toHaveProperty("GITHUB_TOKEN");
        expect(result.github.env).not.toHaveProperty("GITHUB_REMOTE");
        expect(result.github.env).not.toHaveProperty("GITHUB_HOST");
        expect(result.github.command).toBe("node");
        expect(result.github.args).toHaveLength(1);
        expect(result.github.args[0]).toContain("github-mcp/dist/index.cjs");
    });

    // **Validates: Requirements 3.3**
    it("Property 5: GITHUB_REMOTE value matches the remote name for every entry", () => {
        fc.assert(
            fc.property(remotesArb(1, 8), homePathArb, (remotes, homePath) => {
                const result = generateMcpGithubEntries(remotes, homePath);
                for (const remote of remotes) {
                    const entry = result[`github-${remote.name}`];
                    expect(entry.env.GITHUB_REMOTE).toBe(remote.name);
                }
            }),
            { numRuns: 100 },
        );
    });

    // **Validates: Requirements 3.2, 4.2**
    it("Property 5: env blocks contain only allowed flat keys", () => {
        const allowedKeys = new Set([
            "GITHUB_REMOTE",
            "GITHUB_HOST",
            "GITHUB_TOKEN",
            "GITHUB_API_PATH",
        ]);

        fc.assert(
            fc.property(remotesArb(1, 8), homePathArb, (remotes, homePath) => {
                const result = generateMcpGithubEntries(remotes, homePath);
                for (const key of Object.keys(result)) {
                    const envKeys = Object.keys(result[key].env);
                    for (const envKey of envKeys) {
                        expect(allowedKeys).toContain(envKey);
                    }
                }
            }),
            { numRuns: 100 },
        );
    });
});
