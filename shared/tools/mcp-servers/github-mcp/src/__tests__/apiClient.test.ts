import { describe, it, expect, vi, beforeAll } from "vitest";
import * as fc from "fast-check";

// The apiClient module runs initialization at load time that calls process.exit(1)
// when GITHUB_HOST and GITHUB_URL are both absent. We stub GITHUB_HOST before
// importing so the module loads cleanly, then test deriveBaseUrl as a pure function.
let deriveBaseUrl: (host?: string, url?: string, apiPath?: string) => string;

beforeAll(async () => {
    vi.stubEnv("GITHUB_HOST", "stub.example.com");
    vi.stubEnv("GITHUB_TOKEN", "ghp_stub");
    const mod = await import("../utils/apiClient.js");
    deriveBaseUrl = mod.deriveBaseUrl;
    vi.unstubAllEnvs();
});

/**
 * Arbitrary for valid hostnames: alphanumeric labels separated by dots.
 * Examples: "github.disney.com", "github.com", "my-host.internal"
 */
const hostnameArb = fc
    .tuple(
        fc.stringMatching(/^[a-z][a-z0-9-]{0,12}$/),
        fc.stringMatching(/^[a-z][a-z0-9-]{0,12}$/),
    )
    .map(([label1, label2]) => `${label1}.${label2}`);

/**
 * Arbitrary for API path strings: start with "/" followed by path segments.
 * Examples: "/api/v3", "/api/v4", "/graphql"
 */
const apiPathArb = fc
    .tuple(
        fc.stringMatching(/^[a-z][a-z0-9]{0,10}$/),
        fc.stringMatching(/^[a-z0-9]{1,5}$/),
    )
    .map(([seg1, seg2]) => `/${seg1}/${seg2}`);

// ============================================================================
// Task 3.2 — Property-Based Tests
// ============================================================================

describe("apiClient property tests", () => {
    // Feature: github-mcp-multi-instance, Property 1: API Base URL Derivation
    // **Validates: Requirements 1.1, 1.2, 1.4**
    it("Property 1: for any valid hostname h and API path p, base URL equals https://{h}{p}", async () => {
        await fc.assert(
            fc.asyncProperty(hostnameArb, apiPathArb, async (host, apiPath) => {
                const result = deriveBaseUrl(host, undefined, apiPath);
                expect(result).toBe(`https://${host}${apiPath}`);
            }),
            { numRuns: 100 },
        );
    });

    // Feature: github-mcp-multi-instance, Property 1: API Base URL Derivation (default path)
    // **Validates: Requirements 1.1, 1.2, 1.4**
    it("Property 1: when apiPath is absent, defaults to /api/v3", async () => {
        await fc.assert(
            fc.asyncProperty(hostnameArb, async (host) => {
                const result = deriveBaseUrl(host, undefined, undefined);
                expect(result).toBe(`https://${host}/api/v3`);
            }),
            { numRuns: 100 },
        );
    });

    // Feature: github-mcp-multi-instance, Property 2: GITHUB_HOST Priority Over GITHUB_URL
    // **Validates: Requirements 7.2**
    it("Property 2: when both host and url are set, host is used (url is ignored)", async () => {
        const urlArb = hostnameArb.map((h) => `https://${h}`);

        await fc.assert(
            fc.asyncProperty(hostnameArb, urlArb, apiPathArb, async (host, url, apiPath) => {
                const result = deriveBaseUrl(host, url, apiPath);
                // Must use host, not url
                expect(result).toBe(`https://${host}${apiPath}`);
                // Verify url is NOT used (unless host and url happen to produce the same result)
                expect(result.startsWith(`https://${host}`)).toBe(true);
            }),
            { numRuns: 100 },
        );
    });
});

// ============================================================================
// Task 3.3 — Unit Tests (Edge Cases)
// ============================================================================

describe("apiClient unit tests", () => {
    // **Validates: Requirements 1.3, 7.1**
    it("legacy mode: only GITHUB_URL set → uses that value with apiPath", () => {
        const result = deriveBaseUrl(undefined, "https://github.disney.com", "/api/v3");
        expect(result).toBe("https://github.disney.com/api/v3");
    });

    // **Validates: Requirements 1.3, 7.1**
    it("legacy mode: only GITHUB_URL set with default apiPath", () => {
        const result = deriveBaseUrl(undefined, "https://github.disney.com", undefined);
        expect(result).toBe("https://github.disney.com/api/v3");
    });

    // **Validates: Requirements 1.5**
    it("missing both GITHUB_HOST and GITHUB_URL → throws error", () => {
        expect(() => deriveBaseUrl(undefined, undefined, "/api/v3")).toThrow(
            "Missing GITHUB_HOST or GITHUB_URL",
        );
    });

    // **Validates: Requirements 1.5**
    it("empty strings for both host and url → throws error", () => {
        expect(() => deriveBaseUrl("", "", "/api/v3")).toThrow(
            "Missing GITHUB_HOST or GITHUB_URL",
        );
    });

    // **Validates: Requirements 1.2**
    it("GITHUB_API_PATH defaults to /api/v3 when absent", () => {
        const result = deriveBaseUrl("github.disney.com", undefined, undefined);
        expect(result).toBe("https://github.disney.com/api/v3");
    });

    // **Validates: Requirements 1.2**
    it("GITHUB_API_PATH defaults to /api/v3 when empty string", () => {
        const result = deriveBaseUrl("github.disney.com", undefined, "");
        expect(result).toBe("https://github.disney.com/api/v3");
    });

    // **Validates: Requirements 1.4**
    it("custom GITHUB_API_PATH is used in URL derivation", () => {
        const result = deriveBaseUrl("github.disney.com", undefined, "/api/v4");
        expect(result).toBe("https://github.disney.com/api/v4");
    });

    // **Validates: Requirements 7.2**
    it("GITHUB_HOST takes priority over GITHUB_URL", () => {
        const result = deriveBaseUrl(
            "github.disney.com",
            "https://old-github.example.com",
            "/api/v3",
        );
        expect(result).toBe("https://github.disney.com/api/v3");
    });
});
