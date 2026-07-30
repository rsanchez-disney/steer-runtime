import { describe, it, expect, vi, beforeEach } from "vitest";
import { SonarQubeClient } from "../client.js";
import { tools, handleToolCall } from "../tools.js";

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

describe("SonarQubeClient", () => {
  let client: SonarQubeClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new SonarQubeClient({
      url: "https://sonar.example.com",
      token: "test-token",
    });
  });

  describe("authentication", () => {
    it("sends Basic auth header with token", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ status: "UP" }));

      await client.validate();

      const headers = mockFetch.mock.calls[0][1].headers;
      const expected = `Basic ${Buffer.from("test-token:").toString("base64")}`;
      expect(headers.Authorization).toBe(expected);
    });

    it("strips trailing slash from URL", async () => {
      const c = new SonarQubeClient({ url: "https://sonar.example.com/", token: "t" });
      mockFetch.mockResolvedValueOnce(jsonResponse({}));

      await c.validate();

      expect(mockFetch.mock.calls[0][0]).toContain("https://sonar.example.com/api/system/status");
    });
  });

  describe("validate", () => {
    it("calls /api/system/status", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ status: "UP" }));

      const result = await client.validate();

      expect(result.ok).toBe(true);
      expect(mockFetch.mock.calls[0][0]).toContain("/api/system/status");
    });
  });

  describe("getIssues", () => {
    it("calls /api/issues/search with project key", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ issues: [], total: 0 }));

      await client.getIssues({ projectKey: "my:project" });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain("/api/issues/search");
      expect(url).toContain("componentKeys=my%3Aproject");
    });

    it("passes severity and type filters", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ issues: [] }));

      await client.getIssues({ projectKey: "p", severities: "CRITICAL,BLOCKER", types: "BUG" });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain("severities=CRITICAL%2CBLOCKER");
      expect(url).toContain("types=BUG");
    });
  });

  describe("getMeasures", () => {
    it("calls /api/measures/component with metric keys", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ component: { measures: [] } }));

      await client.getMeasures({ component: "my:project", metricKeys: "coverage,bugs" });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain("/api/measures/component");
      expect(url).toContain("metricKeys=coverage%2Cbugs");
    });
  });

  describe("getHotspots", () => {
    it("calls /api/hotspots/search", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ hotspots: [] }));

      await client.getHotspots({ projectKey: "my:project" });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain("/api/hotspots/search");
      expect(url).toContain("projectKey=my%3Aproject");
    });
  });

  describe("listProjects", () => {
    it("calls /api/projects/search", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ components: [] }));

      await client.listProjects({ query: "payment" });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain("/api/projects/search");
      expect(url).toContain("q=payment");
    });
  });

  describe("getQualityGate", () => {
    it("calls /api/qualitygates/project_status", async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ projectStatus: { status: "OK" } }));

      await client.getQualityGate({ projectKey: "my:project" });

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain("/api/qualitygates/project_status");
      expect(url).toContain("projectKey=my%3Aproject");
    });
  });

  describe("organization param", () => {
    it("appends organization to all requests for SonarCloud", async () => {
      const cloudClient = new SonarQubeClient({
        url: "https://sonarcloud.io",
        token: "t",
        organization: "my-org",
      });
      mockFetch.mockResolvedValueOnce(jsonResponse({}));

      await cloudClient.listProjects();

      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain("organization=my-org");
    });
  });

  describe("error handling", () => {
    it("returns error on HTTP 401", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      });

      const result = await client.validate();

      expect(result.ok).toBe(false);
      expect(result.error).toContain("401");
    });

    it("handles network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("ECONNREFUSED"));

      const result = await client.validate();

      expect(result.ok).toBe(false);
      expect(result.error).toContain("ECONNREFUSED");
    });
  });
});

describe("tools", () => {
  it("exports 7 tools", () => {
    expect(tools).toHaveLength(7);
  });

  it("all tools follow sq_ prefix convention", () => {
    for (const tool of tools) {
      expect(tool.name).toMatch(/^sq_/);
    }
  });

  it("required fields are marked in schemas", () => {
    const issues = tools.find(t => t.name === "sq_get_issues");
    expect(issues?.inputSchema.required).toContain("project_key");

    const gate = tools.find(t => t.name === "sq_get_quality_gate");
    expect(gate?.inputSchema.required).toContain("project_key");
  });
});

describe("handleToolCall", () => {
  let client: SonarQubeClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new SonarQubeClient({ url: "https://sonar.test", token: "t" });
  });

  it("returns success for validate", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ status: "UP" }));

    const result = await handleToolCall(client, "sq_validate_connection", {});

    expect(result.content[0].text).toContain("successful");
  });

  it("returns JSON for list_projects", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ components: [{ key: "p1" }] }));

    const result = await handleToolCall(client, "sq_list_projects", {});

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.components[0].key).toBe("p1");
  });

  it("returns error for unknown tool", async () => {
    const result = await handleToolCall(client, "sq_unknown", {});
    expect(result.content[0].text).toContain("Unknown tool");
  });
});
