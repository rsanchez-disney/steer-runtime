"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const client_js_1 = require("../client.js");
const tools_js_1 = require("../tools.js");
const mockFetch = vitest_1.vi.fn();
vitest_1.vi.stubGlobal("fetch", mockFetch);
function jsonResponse(data, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => data,
        text: async () => JSON.stringify(data),
    };
}
(0, vitest_1.describe)("SonarQubeClient", () => {
    let client;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        client = new client_js_1.SonarQubeClient({
            url: "https://sonar.example.com",
            token: "test-token",
        });
    });
    (0, vitest_1.describe)("authentication", () => {
        (0, vitest_1.it)("sends Basic auth header with token", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ status: "UP" }));
            await client.validate();
            const headers = mockFetch.mock.calls[0][1].headers;
            const expected = `Basic ${Buffer.from("test-token:").toString("base64")}`;
            (0, vitest_1.expect)(headers.Authorization).toBe(expected);
        });
        (0, vitest_1.it)("strips trailing slash from URL", async () => {
            const c = new client_js_1.SonarQubeClient({ url: "https://sonar.example.com/", token: "t" });
            mockFetch.mockResolvedValueOnce(jsonResponse({}));
            await c.validate();
            (0, vitest_1.expect)(mockFetch.mock.calls[0][0]).toContain("https://sonar.example.com/api/system/status");
        });
    });
    (0, vitest_1.describe)("validate", () => {
        (0, vitest_1.it)("calls /api/system/status", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ status: "UP" }));
            const result = await client.validate();
            (0, vitest_1.expect)(result.ok).toBe(true);
            (0, vitest_1.expect)(mockFetch.mock.calls[0][0]).toContain("/api/system/status");
        });
    });
    (0, vitest_1.describe)("getIssues", () => {
        (0, vitest_1.it)("calls /api/issues/search with project key", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ issues: [], total: 0 }));
            await client.getIssues({ projectKey: "my:project" });
            const url = mockFetch.mock.calls[0][0];
            (0, vitest_1.expect)(url).toContain("/api/issues/search");
            (0, vitest_1.expect)(url).toContain("componentKeys=my%3Aproject");
        });
        (0, vitest_1.it)("passes severity and type filters", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ issues: [] }));
            await client.getIssues({ projectKey: "p", severities: "CRITICAL,BLOCKER", types: "BUG" });
            const url = mockFetch.mock.calls[0][0];
            (0, vitest_1.expect)(url).toContain("severities=CRITICAL%2CBLOCKER");
            (0, vitest_1.expect)(url).toContain("types=BUG");
        });
    });
    (0, vitest_1.describe)("getMeasures", () => {
        (0, vitest_1.it)("calls /api/measures/component with metric keys", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ component: { measures: [] } }));
            await client.getMeasures({ component: "my:project", metricKeys: "coverage,bugs" });
            const url = mockFetch.mock.calls[0][0];
            (0, vitest_1.expect)(url).toContain("/api/measures/component");
            (0, vitest_1.expect)(url).toContain("metricKeys=coverage%2Cbugs");
        });
    });
    (0, vitest_1.describe)("getHotspots", () => {
        (0, vitest_1.it)("calls /api/hotspots/search", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ hotspots: [] }));
            await client.getHotspots({ projectKey: "my:project" });
            const url = mockFetch.mock.calls[0][0];
            (0, vitest_1.expect)(url).toContain("/api/hotspots/search");
            (0, vitest_1.expect)(url).toContain("projectKey=my%3Aproject");
        });
    });
    (0, vitest_1.describe)("listProjects", () => {
        (0, vitest_1.it)("calls /api/projects/search", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ components: [] }));
            await client.listProjects({ query: "payment" });
            const url = mockFetch.mock.calls[0][0];
            (0, vitest_1.expect)(url).toContain("/api/projects/search");
            (0, vitest_1.expect)(url).toContain("q=payment");
        });
    });
    (0, vitest_1.describe)("getQualityGate", () => {
        (0, vitest_1.it)("calls /api/qualitygates/project_status", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ projectStatus: { status: "OK" } }));
            await client.getQualityGate({ projectKey: "my:project" });
            const url = mockFetch.mock.calls[0][0];
            (0, vitest_1.expect)(url).toContain("/api/qualitygates/project_status");
            (0, vitest_1.expect)(url).toContain("projectKey=my%3Aproject");
        });
    });
    (0, vitest_1.describe)("organization param", () => {
        (0, vitest_1.it)("appends organization to all requests for SonarCloud", async () => {
            const cloudClient = new client_js_1.SonarQubeClient({
                url: "https://sonarcloud.io",
                token: "t",
                organization: "my-org",
            });
            mockFetch.mockResolvedValueOnce(jsonResponse({}));
            await cloudClient.listProjects();
            const url = mockFetch.mock.calls[0][0];
            (0, vitest_1.expect)(url).toContain("organization=my-org");
        });
    });
    (0, vitest_1.describe)("error handling", () => {
        (0, vitest_1.it)("returns error on HTTP 401", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                text: async () => "Unauthorized",
            });
            const result = await client.validate();
            (0, vitest_1.expect)(result.ok).toBe(false);
            (0, vitest_1.expect)(result.error).toContain("401");
        });
        (0, vitest_1.it)("handles network errors", async () => {
            mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));
            const result = await client.validate();
            (0, vitest_1.expect)(result.ok).toBe(false);
            (0, vitest_1.expect)(result.error).toContain("ECONNREFUSED");
        });
    });
});
(0, vitest_1.describe)("tools", () => {
    (0, vitest_1.it)("exports 7 tools", () => {
        (0, vitest_1.expect)(tools_js_1.tools).toHaveLength(7);
    });
    (0, vitest_1.it)("all tools follow sq_ prefix convention", () => {
        for (const tool of tools_js_1.tools) {
            (0, vitest_1.expect)(tool.name).toMatch(/^sq_/);
        }
    });
    (0, vitest_1.it)("required fields are marked in schemas", () => {
        const issues = tools_js_1.tools.find(t => t.name === "sq_get_issues");
        (0, vitest_1.expect)(issues?.inputSchema.required).toContain("project_key");
        const gate = tools_js_1.tools.find(t => t.name === "sq_get_quality_gate");
        (0, vitest_1.expect)(gate?.inputSchema.required).toContain("project_key");
    });
});
(0, vitest_1.describe)("handleToolCall", () => {
    let client;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        client = new client_js_1.SonarQubeClient({ url: "https://sonar.test", token: "t" });
    });
    (0, vitest_1.it)("returns success for validate", async () => {
        mockFetch.mockResolvedValueOnce(jsonResponse({ status: "UP" }));
        const result = await (0, tools_js_1.handleToolCall)(client, "sq_validate_connection", {});
        (0, vitest_1.expect)(result.content[0].text).toContain("successful");
    });
    (0, vitest_1.it)("returns JSON for list_projects", async () => {
        mockFetch.mockResolvedValueOnce(jsonResponse({ components: [{ key: "p1" }] }));
        const result = await (0, tools_js_1.handleToolCall)(client, "sq_list_projects", {});
        const parsed = JSON.parse(result.content[0].text);
        (0, vitest_1.expect)(parsed.components[0].key).toBe("p1");
    });
    (0, vitest_1.it)("returns error for unknown tool", async () => {
        const result = await (0, tools_js_1.handleToolCall)(client, "sq_unknown", {});
        (0, vitest_1.expect)(result.content[0].text).toContain("Unknown tool");
    });
});
