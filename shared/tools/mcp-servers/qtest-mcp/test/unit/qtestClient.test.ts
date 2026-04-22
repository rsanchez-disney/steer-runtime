import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QtestApiClient, mapApiError, resolveProjectId, resolveModulePid, resolveRequirementPid, clearModuleCache, withErrorHandling } from "../../src/utils/qtestClient.js";
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
    const mockResponse = { ok: true, text: () => Promise.resolve('{"id":1}') };
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
    const mockResponse = { ok: true, text: () => Promise.resolve('{"id":42}') };
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
    const mockResponse = { ok: true, text: () => Promise.resolve('{"id":42}') };
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
    const mockResponse = { ok: true, text: () => Promise.resolve('{}') };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as any);

    const client = new QtestApiClient();
    await client.get("/api/v3/projects");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ body: undefined }),
    );
  });

  it("handles empty response body (204-like)", async () => {
    const mockResponse = { ok: true, text: () => Promise.resolve("") };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as any);

    const client = new QtestApiClient();
    const result = await client.get("/api/v3/projects/1/something");
    expect(result).toBeUndefined();
  });

  it("throws timeout error when request exceeds timeout", async () => {
    const abortError = new DOMException("The operation was aborted", "AbortError");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(abortError);

    const client = new QtestApiClient();
    await expect(client.get("/api/v3/projects")).rejects.toThrow(QtestApiError);
    await expect(client.get("/api/v3/projects")).rejects.toMatchObject({
      statusCode: 0,
    });
    try {
      await client.get("/api/v3/projects");
    } catch (e: any) {
      expect(e.responseBody).toContain("timed out");
    }
  });
});

describe("Rate limit and transient error retries", () => {
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

  it("retries on 429 and succeeds on subsequent attempt", async () => {
    vi.useFakeTimers();
    const rateLimited = { ok: false, status: 429, text: () => Promise.resolve("Too Many Requests") };
    const success = { ok: true, text: () => Promise.resolve('{"id":1}') };
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(rateLimited as any)
      .mockResolvedValueOnce(success as any);

    const client = new QtestApiClient();
    const promise = client.get("/api/v3/projects");
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    expect(result).toEqual({ id: 1 });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("retries on 502/503/504 and succeeds", async () => {
    vi.useFakeTimers();
    const serverError = { ok: false, status: 502, text: () => Promise.resolve("Bad Gateway") };
    const success = { ok: true, text: () => Promise.resolve('{"ok":true}') };
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(serverError as any)
      .mockResolvedValueOnce(success as any);

    const client = new QtestApiClient();
    const promise = client.get("/api/v3/projects");
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    expect(result).toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("throws after exhausting retries on 429 with retry indicator", async () => {
    vi.useFakeTimers();
    const rateLimited = { ok: false, status: 429, text: () => Promise.resolve("Too Many Requests") };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(rateLimited as any);

    const client = new QtestApiClient();
    // Attach catch immediately to prevent unhandled rejection
    const promise = client.get("/api/v3/projects").catch((e: any) => e);

    // Advance through all retry delays
    for (let i = 0; i < 3; i++) {
      await vi.advanceTimersByTimeAsync(Math.pow(2, i) * 1000);
    }

    const error = await promise;
    expect(error).toBeInstanceOf(QtestApiError);
    expect(error.statusCode).toBe(429);
    expect(error.responseBody).toContain("retries");
    vi.useRealTimers();
  });

  it("does not retry on non-retryable errors like 400", async () => {
    const badRequest = { ok: false, status: 400, text: () => Promise.resolve("Bad Request") };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(badRequest as any);

    const client = new QtestApiClient();
    await expect(client.get("/api/v3/projects")).rejects.toThrow(QtestApiError);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
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

describe("resolveProjectId", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns the provided argument when given", () => {
    expect(resolveProjectId(42)).toBe(42);
  });

  it("falls back to QTEST_PROJECT_ID env var", () => {
    process.env = { ...originalEnv, QTEST_PROJECT_ID: "99" };
    expect(resolveProjectId()).toBe(99);
  });

  it("prefers argument over env var", () => {
    process.env = { ...originalEnv, QTEST_PROJECT_ID: "99" };
    expect(resolveProjectId(7)).toBe(7);
  });

  it("throws when neither argument nor env var is set", () => {
    process.env = { ...originalEnv };
    delete process.env.QTEST_PROJECT_ID;
    expect(() => resolveProjectId()).toThrow("No projectId provided");
  });

  it("throws when env var is non-numeric", () => {
    process.env = { ...originalEnv, QTEST_PROJECT_ID: "abc" };
    expect(() => resolveProjectId()).toThrow("No projectId provided");
  });
});

describe("resolveModulePid", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      QTEST_BASE_URL: "https://qtest.example.com",
      QTEST_BEARER_TOKEN: "test-token-123",
    };
    clearModuleCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("resolves MD-#### PID to numeric ID", async () => {
    const modules = [
      { pid: "MD-1", id: 100, sub_modules: [{ pid: "MD-2", id: 200 }] },
    ];
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true, text: () => Promise.resolve(JSON.stringify(modules)),
    } as any);

    const client = new QtestApiClient();
    expect(await resolveModulePid(client, 1, "MD-2")).toBe(200);
  });

  it("returns null for unknown PID", async () => {
    const modules = [{ pid: "MD-1", id: 100 }];
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true, text: () => Promise.resolve(JSON.stringify(modules)),
    } as any);

    const client = new QtestApiClient();
    expect(await resolveModulePid(client, 1, "MD-999")).toBeNull();
  });

  it("uses cache on second call", async () => {
    const modules = [{ pid: "MD-1", id: 100 }];
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true, text: () => Promise.resolve(JSON.stringify(modules)),
    } as any);

    const client = new QtestApiClient();
    await resolveModulePid(client, 1, "MD-1");
    await resolveModulePid(client, 1, "MD-1");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("is case-insensitive", async () => {
    const modules = [{ pid: "MD-5", id: 500 }];
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true, text: () => Promise.resolve(JSON.stringify(modules)),
    } as any);

    const client = new QtestApiClient();
    expect(await resolveModulePid(client, 1, "md-5")).toBe(500);
  });
});

describe("resolveRequirementPid", () => {
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

  it("resolves RQ-#### PID from item links", async () => {
    const resp = {
      items: [{ links: [{ rel: "requirement", href: "/api/v3/projects/1/requirements/42" }] }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true, text: () => Promise.resolve(JSON.stringify(resp)),
    } as any);

    const client = new QtestApiClient();
    expect(await resolveRequirementPid(client, 1, "RQ-100")).toBe(42);
  });

  it("resolves from top-level links when items are empty", async () => {
    const resp = {
      items: [],
      links: [{ href: "/api/v3/projects/1/requirements/77" }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true, text: () => Promise.resolve(JSON.stringify(resp)),
    } as any);

    const client = new QtestApiClient();
    expect(await resolveRequirementPid(client, 1, "RQ-50")).toBe(77);
  });

  it("returns null on 404", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false, status: 404, text: () => Promise.resolve("Not Found"),
    } as any);

    const client = new QtestApiClient();
    expect(await resolveRequirementPid(client, 1, "RQ-999")).toBeNull();
  });

  it("re-throws 401 auth errors instead of swallowing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false, status: 401, text: () => Promise.resolve("Unauthorized"),
    } as any);

    const client = new QtestApiClient();
    await expect(resolveRequirementPid(client, 1, "RQ-1")).rejects.toThrow(QtestApiError);
  });

  it("re-throws 403 permission errors instead of swallowing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false, status: 403, text: () => Promise.resolve("Forbidden"),
    } as any);

    const client = new QtestApiClient();
    await expect(resolveRequirementPid(client, 1, "RQ-1")).rejects.toThrow(QtestApiError);
  });
});

describe("QtestApiClient constructor validation", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws when QTEST_BEARER_TOKEN is missing", () => {
    process.env = { ...originalEnv };
    delete process.env.QTEST_BEARER_TOKEN;
    expect(() => new QtestApiClient()).toThrow("QTEST_BEARER_TOKEN is missing");
  });

  it("throws when QTEST_BEARER_TOKEN is empty string", () => {
    process.env = { ...originalEnv, QTEST_BEARER_TOKEN: "" };
    expect(() => new QtestApiClient()).toThrow("QTEST_BEARER_TOKEN is missing");
  });

  it("throws when QTEST_BEARER_TOKEN has leading whitespace", () => {
    process.env = { ...originalEnv, QTEST_BEARER_TOKEN: " token123" };
    expect(() => new QtestApiClient()).toThrow("whitespace");
  });

  it("throws when QTEST_BEARER_TOKEN has trailing whitespace", () => {
    process.env = { ...originalEnv, QTEST_BEARER_TOKEN: "token123 " };
    expect(() => new QtestApiClient()).toThrow("whitespace");
  });

  it("accepts a valid token", () => {
    process.env = { ...originalEnv, QTEST_BEARER_TOKEN: "valid-token-123" };
    expect(() => new QtestApiClient()).not.toThrow();
  });
});

describe("withErrorHandling", () => {
  it("returns the result on success", async () => {
    const result = await withErrorHandling(async () => ({
      content: [{ type: "text" as const, text: "ok" }],
    }));
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toBe("ok");
  });

  it("maps QtestApiError to user-friendly message", async () => {
    const result = await withErrorHandling(async () => {
      throw new QtestApiError(401, "Unauthorized", "https://example.com");
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Authentication failed");
  });

  it("maps generic Error to unexpected error message", async () => {
    const result = await withErrorHandling(async () => {
      throw new Error("something broke");
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unexpected error: something broke");
  });

  it("handles non-Error throws", async () => {
    const result = await withErrorHandling(async () => {
      throw "string error";
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unexpected error: Unknown");
  });
});
