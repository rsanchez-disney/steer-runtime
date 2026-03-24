import { describe, it, expect } from "vitest";
import {
  formatProjects,
  formatTestCase,
  formatTestRun,
  formatTestCycles,
  formatTestSuites,
  formatRequirements,
  formatDefects,
} from "../../src/utils/formatting.js";

describe("formatProjects", () => {
  it("formats an empty project list", () => {
    const result = formatProjects([]);
    expect(result).toBe("**qTest Projects**\n\n**Total Projects:** 0\n\n");
  });

  it("formats a list of projects with ID, name, description", () => {
    const projects = [
      { id: 1, name: "Alpha", description: "First project", start_date: "", end_date: "" },
      { id: 2, name: "Beta", description: "Second project", start_date: "", end_date: "" },
    ];
    const result = formatProjects(projects);
    expect(result).toContain("**Total Projects:** 2");
    expect(result).toContain("**1. [1] Alpha**");
    expect(result).toContain("- Description: First project");
    expect(result).toContain("**2. [2] Beta**");
    expect(result).toContain("- Description: Second project");
  });
});

describe("formatTestCase", () => {
  it("formats a test case with steps", () => {
    const tc = {
      id: 10, name: "Login Test", description: "Verify login", precondition: "User exists",
      test_steps: [
        { order: 1, description: "Enter credentials", expected: "Fields populated" },
        { order: 2, description: "Click submit", expected: "Redirected to dashboard" },
      ],
      parent_id: 0, pid: "TC-10", web_url: "https://example.com",
    };
    const result = formatTestCase(tc);
    expect(result).toContain("**Test Case: [TC-10] Login Test**");
    expect(result).toContain("- ID: 10");
    expect(result).toContain("- Description: Verify login");
    expect(result).toContain("- Precondition: User exists");
    expect(result).toContain("**Test Steps:**");
    expect(result).toContain("  1. Enter credentials → Expected: Fields populated");
    expect(result).toContain("  2. Click submit → Expected: Redirected to dashboard");
  });

  it("formats a test case without steps", () => {
    const tc = {
      id: 11, name: "Empty", description: "No steps", precondition: "None",
      test_steps: [], parent_id: 0, pid: "TC-11", web_url: "",
    };
    const result = formatTestCase(tc);
    expect(result).not.toContain("**Test Steps:**");
  });
});

describe("formatTestRun", () => {
  it("formats a test run with all fields", () => {
    const tr = {
      id: 5, name: "Sprint 1 Run", status: "passed", assigned_to: "Jane",
      test_case: { id: 10, name: "Login Test" }, parent_id: 1,
    };
    const result = formatTestRun(tr);
    expect(result).toContain("**Test Run: Sprint 1 Run**");
    expect(result).toContain("- ID: 5");
    expect(result).toContain("- Status: passed");
    expect(result).toContain("- Assigned To: Jane");
    expect(result).toContain("- Test Case: [10] Login Test");
  });
});

describe("formatTestCycles", () => {
  it("formats an empty cycle list", () => {
    const result = formatTestCycles([]);
    expect(result).toBe("**Test Cycles** (0)\n\n");
  });

  it("formats cycles with pid, name, id, description", () => {
    const cycles = [
      { id: 1, name: "Regression", description: "Full regression", parent_id: 0, pid: "CY-1" },
    ];
    const result = formatTestCycles(cycles);
    expect(result).toContain("**Test Cycles** (1)");
    expect(result).toContain("**[CY-1] Regression**");
    expect(result).toContain("- ID: 1");
    expect(result).toContain("- Description: Full regression");
  });
});

describe("formatTestSuites", () => {
  it("formats suites with name, id, description, test_cycle_id", () => {
    const suites = [
      { id: 3, name: "Smoke Suite", description: "Quick checks", test_cycle_id: 1 },
    ];
    const result = formatTestSuites(suites);
    expect(result).toContain("**Test Suites** (1)");
    expect(result).toContain("**Smoke Suite**");
    expect(result).toContain("- ID: 3");
    expect(result).toContain("- Description: Quick checks");
    expect(result).toContain("- Test Cycle ID: 1");
  });
});

describe("formatRequirements", () => {
  it("formats requirements without linked test cases", () => {
    const reqs = [
      { id: 7, name: "Auth Req", description: "Must authenticate", pid: "RQ-7" },
    ];
    const result = formatRequirements(reqs);
    expect(result).toContain("**Requirements** (1)");
    expect(result).toContain("**[RQ-7] Auth Req**");
    expect(result).not.toContain("Linked Test Cases");
  });

  it("formats requirements with linked test cases", () => {
    const reqs = [
      {
        id: 7, name: "Auth Req", description: "Must authenticate", pid: "RQ-7",
        linked_test_cases: [
          { id: 10, name: "Login Test" },
          { id: 11, name: "Logout Test" },
        ],
      },
    ];
    const result = formatRequirements(reqs);
    expect(result).toContain("- Linked Test Cases (2): 10: Login Test, 11: Logout Test");
  });
});

describe("formatDefects", () => {
  it("formats defects with all fields", () => {
    const defects = [
      { id: 99, summary: "Login broken", description: "500 error on login", status: "Open", linked_test_run_id: 5 },
    ];
    const result = formatDefects(defects);
    expect(result).toContain("**Defects** (1)");
    expect(result).toContain("**Login broken**");
    expect(result).toContain("- ID: 99");
    expect(result).toContain("- Status: Open");
    expect(result).toContain("- Description: 500 error on login");
    expect(result).toContain("- Linked Test Run: 5");
  });
});
