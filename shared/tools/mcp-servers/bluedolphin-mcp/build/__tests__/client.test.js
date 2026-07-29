"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const client_js_1 = require("../client.js");
const tools_js_1 = require("../tools.js");
// Mock global fetch
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
(0, vitest_1.describe)("BlueDolphinClient", () => {
    let client;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        client = new client_js_1.BlueDolphinClient({
            apiKey: "test-key",
            tenant: "twdc",
            region: "eu",
            useOData: false,
            odataUsername: "",
            odataPassword: "",
            rateLimitDelay: 0, // disable rate limiting in tests
        });
    });
    (0, vitest_1.describe)("REST API mode", () => {
        (0, vitest_1.it)("sends correct headers for REST API", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ status: "ok" }));
            await client.validateConnection();
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("https://public-api.eu.bluedolphin.app/liveness", vitest_1.expect.objectContaining({
                headers: vitest_1.expect.objectContaining({
                    "x-api-key": "test-key",
                    tenant: "twdc",
                }),
            }));
        });
        (0, vitest_1.it)("uses US region when configured", async () => {
            const usClient = new client_js_1.BlueDolphinClient({
                apiKey: "key",
                tenant: "twdc",
                region: "us",
                useOData: false,
                odataUsername: "",
                odataPassword: "",
                rateLimitDelay: 0,
            });
            mockFetch.mockResolvedValueOnce(jsonResponse({}));
            await usClient.validateConnection();
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith(vitest_1.expect.stringContaining("public-api.us.bluedolphin.app"), vitest_1.expect.anything());
        });
        (0, vitest_1.it)("listObjects calls /v1/objects", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse([{ id: "1", object_title: "App" }]));
            const result = await client.listObjects();
            (0, vitest_1.expect)(result.ok).toBe(true);
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("https://public-api.eu.bluedolphin.app/v1/objects", vitest_1.expect.anything());
        });
        (0, vitest_1.it)("getObject calls /v1/objects/:id", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ id: "abc", object_title: "Test" }));
            const result = await client.getObject("abc");
            (0, vitest_1.expect)(result.ok).toBe(true);
            (0, vitest_1.expect)(result.data).toEqual({ id: "abc", object_title: "Test" });
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("https://public-api.eu.bluedolphin.app/v1/objects/abc", vitest_1.expect.anything());
        });
        (0, vitest_1.it)("listWorkspaces calls /v1/workspaces", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse([{ id: "ws1", name: "Main" }]));
            const result = await client.listWorkspaces();
            (0, vitest_1.expect)(result.ok).toBe(true);
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("https://public-api.eu.bluedolphin.app/v1/workspaces", vitest_1.expect.anything());
        });
        (0, vitest_1.it)("listObjectTypes calls /v1/object-definitions", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse([{ id: "t1", name: "Application" }]));
            const result = await client.listObjectTypes();
            (0, vitest_1.expect)(result.ok).toBe(true);
        });
        (0, vitest_1.it)("listRelations passes object_id as query param", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse([]));
            await client.listRelations("obj123");
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("https://public-api.eu.bluedolphin.app/v1/relations?object_id=obj123", vitest_1.expect.anything());
        });
    });
    (0, vitest_1.describe)("OData mode", () => {
        let odataClient;
        (0, vitest_1.beforeEach)(() => {
            odataClient = new client_js_1.BlueDolphinClient({
                apiKey: "",
                tenant: "twdc",
                region: "eu",
                useOData: true,
                odataUsername: "twdc",
                odataPassword: "odata-token",
                rateLimitDelay: 0,
            });
        });
        (0, vitest_1.it)("uses OData base URL and Basic auth", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ value: [] }));
            await odataClient.validateConnection();
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith("https://twdc.odata.bluedolphin.app/objects?$top=1", vitest_1.expect.objectContaining({
                headers: vitest_1.expect.objectContaining({
                    Authorization: `Basic ${Buffer.from("twdc:odata-token").toString("base64")}`,
                }),
            }));
        });
        (0, vitest_1.it)("searchObjects uses $filter with contains", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ value: [] }));
            await odataClient.searchObjects({ query: "payment" });
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledWith(vitest_1.expect.stringContaining("$filter=contains(object_title,'payment')"), vitest_1.expect.anything());
        });
        (0, vitest_1.it)("listObjects applies workspace and type filters", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ value: [] }));
            await odataClient.listObjects({ workspaceId: "ws1", objectTypeId: "t1", limit: 10 });
            const url = mockFetch.mock.calls[0][0];
            (0, vitest_1.expect)(url).toContain("$filter=workspace_id eq 'ws1' and object_type_id eq 't1'");
            (0, vitest_1.expect)(url).toContain("$top=10");
        });
        (0, vitest_1.it)("listRelations uses OData filter syntax", async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ value: [] }));
            await odataClient.listRelations("obj1");
            const url = mockFetch.mock.calls[0][0];
            (0, vitest_1.expect)(url).toContain("source_object_id eq 'obj1'");
            (0, vitest_1.expect)(url).toContain("target_object_id eq 'obj1'");
        });
    });
    (0, vitest_1.describe)("error handling", () => {
        (0, vitest_1.it)("returns error on HTTP 403", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                text: async () => "Forbidden - PUBLIC_API add-on not enabled",
            });
            const result = await client.validateConnection();
            (0, vitest_1.expect)(result.ok).toBe(false);
            (0, vitest_1.expect)(result.status).toBe(403);
            (0, vitest_1.expect)(result.error).toContain("403");
        });
        (0, vitest_1.it)("retries on HTTP 429 (rate limited)", async () => {
            mockFetch
                .mockResolvedValueOnce({ ok: false, status: 429, text: async () => "Too Many Requests" })
                .mockResolvedValueOnce(jsonResponse({ status: "ok" }));
            const result = await client.validateConnection();
            (0, vitest_1.expect)(result.ok).toBe(true);
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledTimes(2);
        });
        (0, vitest_1.it)("returns error after max retries on network failure", async () => {
            const netClient = new client_js_1.BlueDolphinClient({
                apiKey: "key",
                tenant: "twdc",
                region: "eu",
                useOData: false,
                odataUsername: "",
                odataPassword: "",
                rateLimitDelay: 0,
                maxRetries: 1,
            });
            mockFetch.mockRejectedValue(new Error("ECONNREFUSED"));
            const result = await netClient.validateConnection();
            (0, vitest_1.expect)(result.ok).toBe(false);
            (0, vitest_1.expect)(result.error).toContain("ECONNREFUSED");
        });
    });
});
(0, vitest_1.describe)("tools", () => {
    (0, vitest_1.it)("exports 7 tools", () => {
        (0, vitest_1.expect)(tools_js_1.tools).toHaveLength(7);
    });
    (0, vitest_1.it)("all tools have name, description, and inputSchema", () => {
        for (const tool of tools_js_1.tools) {
            (0, vitest_1.expect)(tool.name).toBeTruthy();
            (0, vitest_1.expect)(tool.description).toBeTruthy();
            (0, vitest_1.expect)(tool.inputSchema).toBeDefined();
            (0, vitest_1.expect)(tool.inputSchema.type).toBe("object");
        }
    });
    (0, vitest_1.it)("tool names follow bd_ prefix convention", () => {
        for (const tool of tools_js_1.tools) {
            (0, vitest_1.expect)(tool.name).toMatch(/^bd_/);
        }
    });
    (0, vitest_1.it)("required tools have required fields in schema", () => {
        const getObj = tools_js_1.tools.find((t) => t.name === "bd_get_object");
        (0, vitest_1.expect)(getObj?.inputSchema.required).toContain("object_id");
        const relations = tools_js_1.tools.find((t) => t.name === "bd_list_relations");
        (0, vitest_1.expect)(relations?.inputSchema.required).toContain("object_id");
    });
});
(0, vitest_1.describe)("handleToolCall", () => {
    let client;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        client = new client_js_1.BlueDolphinClient({
            apiKey: "key",
            tenant: "twdc",
            region: "eu",
            useOData: false,
            odataUsername: "",
            odataPassword: "",
            rateLimitDelay: 0,
        });
    });
    (0, vitest_1.it)("returns success message for validate_connection", async () => {
        mockFetch.mockResolvedValueOnce(jsonResponse({ status: "ok" }));
        const result = await (0, tools_js_1.handleToolCall)(client, "bd_validate_connection", {});
        (0, vitest_1.expect)(result.content[0].text).toContain("successful");
    });
    (0, vitest_1.it)("returns error message on failed connection", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 403,
            text: async () => "Forbidden",
        });
        const result = await (0, tools_js_1.handleToolCall)(client, "bd_validate_connection", {});
        (0, vitest_1.expect)(result.content[0].text).toContain("failed");
    });
    (0, vitest_1.it)("returns JSON data for list_objects", async () => {
        mockFetch.mockResolvedValueOnce(jsonResponse([{ id: "1", object_title: "App1" }]));
        const result = await (0, tools_js_1.handleToolCall)(client, "bd_list_objects", {});
        const parsed = JSON.parse(result.content[0].text);
        (0, vitest_1.expect)(parsed[0].object_title).toBe("App1");
    });
    (0, vitest_1.it)("returns error for unknown tool", async () => {
        const result = await (0, tools_js_1.handleToolCall)(client, "bd_unknown_tool", {});
        (0, vitest_1.expect)(result.content[0].text).toContain("Unknown tool");
    });
});
