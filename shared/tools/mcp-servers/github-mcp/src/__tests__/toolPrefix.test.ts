import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

/**
 * Helper: dynamically import toolPrefix.ts after setting GITHUB_REMOTE.
 * Because toolPrefix.ts reads process.env.GITHUB_REMOTE at module load time,
 * we must reset modules and re-import for each env configuration.
 */
async function importToolPrefix(remote?: string) {
    vi.resetModules();
    if (remote !== undefined) {
        vi.stubEnv("GITHUB_REMOTE", remote);
    } else {
        delete process.env.GITHUB_REMOTE;
    }
    const mod = await import("../utils/toolPrefix.js");
    return mod;
}

/**
 * Arbitrary for non-empty alphanumeric remote names (matching tokens.env key pattern).
 * Remote names come from GITHUB_TOKEN_{remote} keys which are alphanumeric + underscore.
 */
const nonEmptyRemoteArb = fc.stringMatching(/^[a-z0-9_]{1,30}$/);

/** Arbitrary for base tool names (snake_case identifiers like github_get_pr) */
const toolNameArb = fc.stringMatching(/^[a-z0-9_]{1,40}$/);

// ============================================================================
// Task 1.3 — Property-Based Tests
// ============================================================================

describe("toolPrefix property tests", () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
    });

    // Feature: github-mcp-multi-instance, Property 3: Tool Name Prefixing Consistency
    // **Validates: Requirements 2.1, 2.3**
    it("Property 3: for any non-empty remote r and tool name t, prefixed name equals {r}_{t}", async () => {
        await fc.assert(
            fc.asyncProperty(nonEmptyRemoteArb, toolNameArb, async (remote, toolName) => {
                const { prefixToolName } = await importToolPrefix(remote);
                const prefixed = prefixToolName(toolName);
                expect(prefixed).toBe(`${remote}_${toolName}`);
            }),
            { numRuns: 100 },
        );
    });

    // Feature: github-mcp-multi-instance, Property 3: Tool Name Prefixing Consistency (schema/handler key match)
    // **Validates: Requirements 2.1, 2.3**
    it("Property 3: schema names and handler keys match when using the same prefix function", async () => {
        const baseToolNames = [
            "github_get_pr",
            "github_create_pr",
            "github_comment_on_pr",
            "github_get_pr_comments",
            "github_update_pr",
            "github_get_repo",
            "github_search_prs",
            "github_list_remotes",
            "github_get_file",
            "github_get_files",
        ];

        await fc.assert(
            fc.asyncProperty(nonEmptyRemoteArb, async (remote) => {
                const { prefixToolName } = await importToolPrefix(remote);

                // Simulate schema names (as index.ts does)
                const schemaNames = baseToolNames.map((name) => prefixToolName(name));

                // Simulate handler keys (as index.ts does)
                const handlerKeys = baseToolNames.map((name) => prefixToolName(name));

                // Schema names and handler keys must be identical sets
                expect(new Set(schemaNames)).toEqual(new Set(handlerKeys));

                // Each prefixed name follows the {remote}_{base} pattern
                for (const base of baseToolNames) {
                    expect(prefixToolName(base)).toBe(`${remote}_${base}`);
                }
            }),
            { numRuns: 100 },
        );
    });

    // Feature: github-mcp-multi-instance, Property 4: Server Name Derivation
    // **Validates: Requirements 2.4**
    it("Property 4: server name equals github-{r} when remote is non-empty, github-mcp when empty/unset", async () => {
        // Non-empty remote → github-{remote}
        await fc.assert(
            fc.asyncProperty(nonEmptyRemoteArb, async (remote) => {
                const { getServerName } = await importToolPrefix(remote);
                expect(getServerName()).toBe(`github-${remote}`);
            }),
            { numRuns: 100 },
        );
    });

    // Feature: github-mcp-multi-instance, Property 4: Server Name Derivation (empty/unset case)
    // **Validates: Requirements 2.4**
    it("Property 4: server name is github-mcp when GITHUB_REMOTE is empty string", async () => {
        const { getServerName } = await importToolPrefix("");
        expect(getServerName()).toBe("github-mcp");
    });

    // Feature: github-mcp-multi-instance, Property 4: Server Name Derivation (unset case)
    // **Validates: Requirements 2.4**
    it("Property 4: server name is github-mcp when GITHUB_REMOTE is unset", async () => {
        const { getServerName } = await importToolPrefix(undefined);
        expect(getServerName()).toBe("github-mcp");
    });
});

// ============================================================================
// Task 1.4 — Unit Tests (Edge Cases)
// ============================================================================

describe("toolPrefix unit tests", () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
    });

    // **Validates: Requirements 2.2, 7.3**
    it("prefixToolName with empty GITHUB_REMOTE returns original name unchanged", async () => {
        const { prefixToolName } = await importToolPrefix("");
        expect(prefixToolName("github_get_pr")).toBe("github_get_pr");
        expect(prefixToolName("github_create_pr")).toBe("github_create_pr");
    });

    // **Validates: Requirements 2.1**
    it('prefixToolName("disney") on github_get_pr returns disney_github_get_pr', async () => {
        const { prefixToolName } = await importToolPrefix("disney");
        expect(prefixToolName("github_get_pr")).toBe("disney_github_get_pr");
    });

    // **Validates: Requirements 2.4**
    it("getServerName() with no GITHUB_REMOTE env returns github-mcp", async () => {
        const { getServerName } = await importToolPrefix(undefined);
        expect(getServerName()).toBe("github-mcp");
    });

    // **Validates: Requirements 2.4**
    it('getServerName() with GITHUB_REMOTE="disney" returns github-disney', async () => {
        const { getServerName } = await importToolPrefix("disney");
        expect(getServerName()).toBe("github-disney");
    });
});
