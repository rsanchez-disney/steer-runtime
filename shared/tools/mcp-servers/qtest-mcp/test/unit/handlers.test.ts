import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleQtestGetProjects } from "../../src/tools/qtestGetProjects.js";
import { handleQtestGetTestCase } from "../../src/tools/qtestTestCases.js";
import { handleQtestCreateRequirement } from "../../src/tools/qtestRequirements.js";
import { handleQtestGetDefects } from "../../src/tools/qtestDefects.js";

describe("Handler integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      QTEST_BASE_URL: "https://qtest.example.com",
      QTEST_BEARER_TOKEN: "test-token-123",
      QTEST_PROJECT_ID: "1",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("handleQtestGetProjects returns formatted project list", async () => {
    const projects = [{ id: 1, name: "Alpha", description: "First" }];
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true, text: () => Promise.resolve(JSON.stringify(projects)),
    } as any);

    const result = await handleQtestGetProjects({ outputDir: false });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Alpha");
    expect(result.content[0].text).toContain("**Total Projects:** 1");
  });

  it("handleQtestGetTestCase returns formatted test case with steps", async () => {
    const tc = {
      id: 10, pid: "TC-10", name: "Login Test",
      description: "Verify login", precondition: "User exists",
      test_steps: [{ order: 1, description: "Enter creds", expected: "OK" }],
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true, text: () => Promise.resolve(JSON.stringify(tc)),
    } as any);

    const result = await handleQtestGetTestCase({ testCaseId: 10, outputDir: false });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("TC-10");
    expect(result.content[0].text).toContain("Login Test");
  });

  it("handler returns isError on API failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false, status: 401, text: () => Promise.resolve("Unauthorized"),
    } as any);

    const result = await handleQtestGetProjects({ outputDir: false });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Authentication failed");
  });

  it("handler returns isError on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));

    const result = await handleQtestGetDefects({ testRunId: 1, outputDir: false });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Connection failed");
  });

  it("handler returns isError when projectId is missing", async () => {
    delete process.env.QTEST_PROJECT_ID;

    const result = await handleQtestGetDefects({ testRunId: 1, outputDir: false });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("No projectId provided");
  });

  it("handleQtestGetTestCase surfaces warning when test steps fetch fails", async () => {
    const tc = {
      id: 10, pid: "TC-10", name: "Login Test",
      description: "Verify login", precondition: "User exists",
      test_steps: [], test_case_version_id: 1,
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(JSON.stringify(tc)) } as any)
      .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve("Internal Server Error") } as any);

    const result = await handleQtestGetTestCase({ testCaseId: 10, outputDir: false });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("TC-10");
    expect(result.content[0].text).toContain("Warning");
    expect(result.content[0].text).toContain("Test steps could not be loaded");
  });

  it("handleQtestCreateRequirement surfaces description update failure in response", async () => {
    const created = {
      id: 50, pid: "RQ-50", name: "New Req",
      properties: [{ field_name: "Description", field_id: 1 }],
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      // POST create requirement
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(JSON.stringify(created)) } as any)
      // PUT description update fails
      .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve("Internal Server Error") } as any)
      // POST auto-comment succeeds
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve('{}') } as any);

    const result = await handleQtestCreateRequirement({
      name: "New Req", description: "Some desc", parentId: 123, outputDir: false,
    });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Requirement Created");
    expect(result.content[0].text).toContain("Warning");
    expect(result.content[0].text).toContain("Description update failed");
  });

  it("handleQtestCreateRequirement surfaces auto-comment failure in response", async () => {
    const created = { id: 51, pid: "RQ-51", name: "Another Req" };
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      // POST create requirement
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(JSON.stringify(created)) } as any)
      // POST auto-comment fails
      .mockResolvedValueOnce({ ok: false, status: 403, text: () => Promise.resolve("Forbidden") } as any);

    const result = await handleQtestCreateRequirement({
      name: "Another Req", parentId: 123, outputDir: false,
    });
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain("Requirement Created");
    expect(result.content[0].text).toContain("Warning");
    expect(result.content[0].text).toContain("Auto-comment failed");
  });
});
