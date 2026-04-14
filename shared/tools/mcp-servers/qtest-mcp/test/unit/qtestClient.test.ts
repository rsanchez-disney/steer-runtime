import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QtestApiClient, mapApiError } from "../../src/utils/qtestClient.js";
import { QtestApiError } from "../../src/utils/types.js";

describe("QtestApiClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      QTEST_BASE_URL: "https://qtest.example.com",
      QTEST_BEARER_TOKEN: "test-token-123",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("sends Authorization and Content-Type headers on GET", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ id: 1 }) };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as any);

    const client = new QtestApiClient();
    await client.get("/api/v3/projects");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://qtest.example.com/api/v3/projects",
      expect.objectContaining({
        method: "GET",
        headers: {
          "Authorization": "Bearer test-token-123",
          "Content-Type": "application/json",
        },
      }),
    );
  });

  it("sends body as JSON on POST", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ id: 42 }) };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as any);

    const client = new QtestApiClient();
    const body = { name: "Test Case", description: "A test" };
    await client.post("/api/v3/projects/1/test-cases", body);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://qtest.example.com/api/v3/projects/1/test-cases",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  });

  it("sends body as JSON on PUT", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ id: 42 }) };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as any);

    const client = new QtestApiClient();
    const body = { name: "Updated" };
    await client.put("/api/v3/projects/1/test-cases/5", body);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://qtest.example.com/api/v3/projects/1/test-cases/5",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(body),
      }),
    );
  });

  it("constructs URL by concatenating baseUrl and path", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({}) };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as any);

    const client = new QtestApiClient();
    await client.get("/api/v3/projects/99");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://qtest.example.com/api/v3/projects/99",
      expect.anything(),
    );
  });

  it("throws QtestApiError on non-2xx response", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as any);

    const client = new QtestApiClient();
    await expect(client.get("/api/v3/projects")).rejects.toThrow(QtestApiError);
    await expect(client.get("/api/v3/projects")).rejects.toMatchObject({
      statusCode: 500,
      responseBody: "Internal Server Error",
    });
  });

  it("throws QtestApiError with status 0 on network TypeError", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));

    const client = new QtestApiClient();
    await expect(client.get("/api/v3/projects")).rejects.toThrow(QtestApiError);
    await expect(client.get("/api/v3/projects")).rejects.toMatchObject({
      statusCode: 0,
      responseBody: "fetch failed",
    });
  });

  it("does not send body for GET requests", async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({}) };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as any);

    const client = new QtestApiClient();
    await client.get("/api/v3/projects");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ body: undefined }),
    );
  });
});

describe("mapApiError", () => {
  it("maps 401 to authentication message", () => {
    const error = new QtestApiError(401, "Unauthorized", "https://qtest.example.com/api");
    expect(mapApiError(error)).toBe(
      "Authentication failed: bearer token is invalid or expired. Regenerate your qTest API token.",
    );
  });

  it("maps 403 to permission message", () => {
    const error = new QtestApiError(403, "Forbidden", "https://qtest.example.com/api");
    expect(mapApiError(error)).toBe(
      "Permission denied: insufficient permissions for this operation. Check your qTest role.",
    );
  });

  it("maps 404 to not found message", () => {
    const error = new QtestApiError(404, "Not Found", "https://qtest.example.com/api");
    expect(mapApiError(error)).toBe(
      "Resource not found: the requested resource does not exist in qTest.",
    );
  });

  it("maps status 0 (network error) to connectivity message", () => {
    const error = new QtestApiError(0, "fetch failed", "https://qtest.example.com/api/v3/projects");
    expect(mapApiError(error)).toBe(
      "Connection failed: unable to reach qTest API at https://qtest.example.com/api/v3/projects. Check network and URL.",
    );
  });

  it("maps other status codes to generic message", () => {
    const error = new QtestApiError(502, "Bad Gateway", "https://qtest.example.com/api");
    expect(mapApiError(error)).toBe("qTest API error 502: Bad Gateway");
  });
});
