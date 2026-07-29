import { describe, it, expect, vi, beforeEach } from "vitest";
import { BlueDolphinClient } from "../client.js";
import { tools, handleToolCall } from "../tools.js";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

describe("BlueDolphinClient", () => {
  let client: BlueDolphinClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new BlueDolphinClient({
      apiKey: "test-key",
      tenant: "twdc",
      region: "eu",
      useOData: false,
      odataUsername: "",
      odataPassword: "",
      rateLimitDelay: 0, // disable rate limiting in tests
    });
  });

  describe("REST API mode", () => {
    it("sends correct headers for REST API", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ status: "ok" }));

      await client.validateConnection();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://public-api.eu.bluedolphin.app/liveness",
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-api-key": "test-key",
            tenant: "twdc",
          }),
        })
      );
    });

    it("uses US region when configured", async () => {
      const usClient = new BlueDolphinClient({
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

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("public-api.us.bluedolphin.app"),
        expect.anything()
      );
    });

    it("listObjects calls /v1/objects", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([{ id: "1", object_title: "App" }]));

      const result = await client.listObjects();

      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://public-api.eu.bluedolphin.app/v1/objects",
        expect.anything()
      );
    });

    it("getObject calls /v1/objects/:id", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ id: "abc", object_title: "Test" }));

      const result = await client.getObject("abc");

      expect(result.ok).toBe(true);
      expect(result.data).toEqual({ id: "abc", object_title: "Test" });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://public-api.eu.bluedolphin.app/v1/objects/abc",
        expect.anything()
      );
    });

    it("listWorkspaces calls /v1/workspaces", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([{ id: "ws1", name: "Main" }]));

      const result = await client.listWorkspaces();

      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://public-api.eu.bluedolphin.app/v1/workspaces",
        expect.anything()
      );
    });

    it("listObjectTypes calls /v1/object-definitions", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([{ id: "t1", name: "Application" }]));

      const result = await client.listObjectTypes();

      expect(result.ok).toBe(true);
    });

    it("listRelations passes object_id as query param", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([]));

      await client.listRelations("obj123");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://public-api.eu.bluedolphin.app/v1/relations?object_id=obj123",
        expect.anything()
      );
    });
  });

  describe("OData mode", () => {
    let odataClient: BlueDolphinClient;

    beforeEach(() => {
      odataClient = new BlueDolphinClient({
        apiKey: "",
        tenant: "twdc",
        region: "eu",
        useOData: true,
        odataUsername: "twdc",
        odataPassword: "odata-token",
        rateLimitDelay: 0,
      });
    });

    it("uses OData base URL and Basic auth", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ value: [] }));

      await odataClient.validateConnection();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://twdc.odata.bluedolphin.app/objects?$top=1",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Basic ${Buffer.from("twdc:odata-token").toString("base64")}`,
          }),
        })
      );
    });

    it("searchObjects uses $filter with contains", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ value: [] }));

      await odataClient.searchObjects({ query: "payment" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("$filter=contains(object_title,'payment')"),
        expect.anything()
      );
    });

    it("listObjects applies workspace and type filters", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ value: [] }));

      await odataClient.listObjects({ workspaceId: "ws1", objectTypeId: "t1", limit: 10 });

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("$filter=workspace_id eq 'ws1' and object_type_id eq 't1'");
      expect(url).toContain("$top=10");
    });

    it("listRelations uses OData filter syntax", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ value: [] }));

      await odataClient.listRelations("obj1");

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("source_object_id eq 'obj1'");
      expect(url).toContain("target_object_id eq 'obj1'");
    });
  });

  describe("error handling", () => {
    it("returns error on HTTP 403", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => "Forbidden - PUBLIC_API add-on not enabled",
      });

      const result = await client.validateConnection();

      expect(result.ok).toBe(false);
      expect(result.status).toBe(403);
      expect(result.error).toContain("403");
    });

    it("retries on HTTP 429 (rate limited)", async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 429, text: async () => "Too Many Requests" })
        .mockResolvedValueOnce(jsonResponse({ status: "ok" }));

      const result = await client.validateConnection();

      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("returns error after max retries on network failure", async () => {
      const netClient = new BlueDolphinClient({
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

      expect(result.ok).toBe(false);
      expect(result.error).toContain("ECONNREFUSED");
    });
  });
});

describe("tools", () => {
  it("exports 7 tools", () => {
    expect(tools).toHaveLength(7);
  });

  it("all tools have name, description, and inputSchema", () => {
    for (const tool of tools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe("object");
    }
  });

  it("tool names follow bd_ prefix convention", () => {
    for (const tool of tools) {
      expect(tool.name).toMatch(/^bd_/);
    }
  });

  it("required tools have required fields in schema", () => {
    const getObj = tools.find((t) => t.name === "bd_get_object");
    expect(getObj?.inputSchema.required).toContain("object_id");

    const relations = tools.find((t) => t.name === "bd_list_relations");
    expect(relations?.inputSchema.required).toContain("object_id");
  });
});

describe("handleToolCall", () => {
  let client: BlueDolphinClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new BlueDolphinClient({
      apiKey: "key",
      tenant: "twdc",
      region: "eu",
      useOData: false,
      odataUsername: "",
      odataPassword: "",
      rateLimitDelay: 0,
    });
  });

  it("returns success message for validate_connection", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: "ok" }));

    const result = await handleToolCall(client, "bd_validate_connection", {});

    expect(result.content[0].text).toContain("successful");
  });

  it("returns error message on failed connection", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => "Forbidden",
    });

    const result = await handleToolCall(client, "bd_validate_connection", {});

    expect(result.content[0].text).toContain("failed");
  });

  it("returns JSON data for list_objects", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse([{ id: "1", object_title: "App1" }]));

    const result = await handleToolCall(client, "bd_list_objects", {});

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed[0].object_title).toBe("App1");
  });

  it("returns error for unknown tool", async () => {
    const result = await handleToolCall(client, "bd_unknown_tool", {});

    expect(result.content[0].text).toContain("Unknown tool");
  });
});
