import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { saveData } from "../../src/utils/fileUtils.js";
import { readFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

describe("fileUtils - saveData", () => {
  const testDir = join(tmpdir(), `qtest-mcp-test-${Date.now()}`);

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  // Requirement 10.3: outputDir false or null skips saving
  it("returns null when outputDir is false", async () => {
    const result = await saveData(false, "tool", "id", {}, "summary");
    expect(result).toBeNull();
  });

  it("returns null when outputDir is null", async () => {
    const result = await saveData(null, "tool", "id", {}, "summary");
    expect(result).toBeNull();
  });

  // Requirement 10.2: custom outputDir saves to specified directory
  it("saves file to specified outputDir", async () => {
    const result = await saveData(testDir, "qtest_get_projects", "proj-1", { id: 1 }, "Project 1");
    expect(result).not.toBeNull();
    expect(result!.startsWith(testDir)).toBe(true);

    const content = JSON.parse(await readFile(result!, "utf-8"));
    expect(content.rawData).toEqual({ id: 1 });
    expect(content.formattedSummary).toBe("Project 1");
  });

  // Requirement 10.1: defaults to /tmp/qtest-mcp/ when undefined
  it("defaults to /tmp/qtest-mcp/ when outputDir is undefined", async () => {
    const result = await saveData(undefined, "qtest_get_project", "42", { id: 42 }, "Project 42");
    expect(result).not.toBeNull();
    expect(result!.startsWith("/tmp/qtest-mcp")).toBe(true);

    // Clean up
    const { unlink } = await import("fs/promises");
    await unlink(result!);
  });

  // Requirement 10.4: filename pattern
  it("generates filename matching <toolName>-<identifier>-<timestamp>.json pattern", async () => {
    const result = await saveData(testDir, "qtest_get_test_case", "TC-123", {}, "summary");
    expect(result).not.toBeNull();
    const filename = result!.split("/").pop()!;
    // Pattern: toolName-identifier-ISO-timestamp.json (colons and dots replaced with dashes)
    expect(filename).toMatch(/^qtest_get_test_case-TC-123-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.json$/);
  });

  // Requirement 10.5: saved JSON structure
  it("saves JSON with fetchedAt, rawData, and formattedSummary fields", async () => {
    const rawData = { id: 5, name: "Test Case" };
    const summary = "Test case details";
    const result = await saveData(testDir, "tool", "id", rawData, summary);

    const content = JSON.parse(await readFile(result!, "utf-8"));
    expect(Object.keys(content).sort()).toEqual(["fetchedAt", "formattedSummary", "rawData"]);
    expect(content.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(content.rawData).toEqual(rawData);
    expect(content.formattedSummary).toBe(summary);
  });

  // Requirement 10.6: creates directory recursively
  it("creates nested directory recursively if it does not exist", async () => {
    const nestedDir = join(testDir, "nested", "deep");
    const result = await saveData(nestedDir, "tool", "id", {}, "summary");
    expect(result).not.toBeNull();
    expect(result!.startsWith(nestedDir)).toBe(true);
  });
});
