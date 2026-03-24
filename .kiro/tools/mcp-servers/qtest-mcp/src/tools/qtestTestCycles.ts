import { QtestApiClient, mapApiError, resolveProjectId } from "../utils/qtestClient.js";
import { saveData } from "../utils/fileUtils.js";
import { formatTestCycles, formatTestSuites } from "../utils/formatting.js";
import { QtestApiError } from "../utils/types.js";
import type { QtestTestCycle, QtestTestSuite, ToolResponse } from "../utils/types.js";

// ── qtest_get_test_cycles ───────────────────────────────────────────

export const qtestGetTestCyclesSchema = {
  name: "qtest_get_test_cycles",
  description: "List test cycles for a qTest project",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the test cycles data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: [],
  },
};

export async function handleQtestGetTestCycles(args: any): Promise<ToolResponse> {
  try {
    const { projectId: rawProjectId, outputDir } = args as {
      projectId?: number;
      outputDir?: string | boolean | null;
    };

    const projectId = resolveProjectId(rawProjectId);

    const client = new QtestApiClient();
    const cycles = await client.get<QtestTestCycle[]>(
      `/api/v3/projects/${projectId}/test-cycles`,
    );

    const summary = formatTestCycles(cycles);

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_get_test_cycles",
      String(projectId),
      cycles,
      summary,
    );

    const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

    return {
      content: [{ type: "text", text: `${summary}${savedInfo}` }],
    };
  } catch (error) {
    const message =
      error instanceof QtestApiError
        ? mapApiError(error)
        : `Unexpected error: ${error instanceof Error ? error.message : "Unknown"}`;
    console.error(`[qtest-mcp] ${message}`);
    return { content: [{ type: "text", text: message }], isError: true };
  }
}


// ── qtest_create_test_cycle ─────────────────────────────────────────

export const qtestCreateTestCycleSchema = {
  name: "qtest_create_test_cycle",
  description: "Create a new test cycle in qTest",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      name: {
        type: "string",
        description: "The test cycle name",
      },
      description: {
        type: "string",
        description: "The test cycle description (optional)",
      },
      parentId: {
        type: "number",
        description: "Parent test cycle ID for nesting (optional)",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the test cycle data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["name"],
  },
};

export async function handleQtestCreateTestCycle(args: any): Promise<ToolResponse> {
  try {
    const { projectId: rawProjectId, name, description, parentId, outputDir } = args as {
      projectId?: number;
      name: string;
      description?: string;
      parentId?: number;
      outputDir?: string | boolean | null;
    };

    const projectId = resolveProjectId(rawProjectId);

    const body: Record<string, any> = {
      name,
      description,
      parent_id: parentId,
    };

    const client = new QtestApiClient();
    const created = await client.post<QtestTestCycle>(
      `/api/v3/projects/${projectId}/test-cycles`,
      body,
    );

    const summary = `**Test Cycle Created**\n- ID: ${created.id}\n- Name: ${created.name}`;

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_create_test_cycle",
      String(created.id),
      created,
      summary,
    );

    const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

    return {
      content: [{ type: "text", text: `${summary}${savedInfo}` }],
    };
  } catch (error) {
    const message =
      error instanceof QtestApiError
        ? mapApiError(error)
        : `Unexpected error: ${error instanceof Error ? error.message : "Unknown"}`;
    console.error(`[qtest-mcp] ${message}`);
    return { content: [{ type: "text", text: message }], isError: true };
  }
}


// ── qtest_get_test_suites ───────────────────────────────────────────

export const qtestGetTestSuitesSchema = {
  name: "qtest_get_test_suites",
  description: "List test suites within a test cycle in qTest",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      testCycleId: {
        type: "number",
        description: "The qTest test cycle ID",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the test suites data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["testCycleId"],
  },
};

export async function handleQtestGetTestSuites(args: any): Promise<ToolResponse> {
  try {
    const { projectId: rawProjectId, testCycleId, outputDir } = args as {
      projectId?: number;
      testCycleId: number;
      outputDir?: string | boolean | null;
    };

    const projectId = resolveProjectId(rawProjectId);

    const client = new QtestApiClient();
    const suites = await client.get<QtestTestSuite[]>(
      `/api/v3/projects/${projectId}/test-cycles/${testCycleId}/test-suites`,
    );

    const summary = formatTestSuites(suites);

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_get_test_suites",
      String(testCycleId),
      suites,
      summary,
    );

    const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

    return {
      content: [{ type: "text", text: `${summary}${savedInfo}` }],
    };
  } catch (error) {
    const message =
      error instanceof QtestApiError
        ? mapApiError(error)
        : `Unexpected error: ${error instanceof Error ? error.message : "Unknown"}`;
    console.error(`[qtest-mcp] ${message}`);
    return { content: [{ type: "text", text: message }], isError: true };
  }
}


// ── qtest_create_test_suite ─────────────────────────────────────────

export const qtestCreateTestSuiteSchema = {
  name: "qtest_create_test_suite",
  description: "Create a new test suite in qTest",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      testCycleId: {
        type: "number",
        description: "The qTest test cycle ID to create the suite in",
      },
      name: {
        type: "string",
        description: "The test suite name",
      },
      description: {
        type: "string",
        description: "The test suite description (optional)",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the test suite data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["testCycleId", "name"],
  },
};

export async function handleQtestCreateTestSuite(args: any): Promise<ToolResponse> {
  try {
    const { projectId: rawProjectId, testCycleId, name, description, outputDir } = args as {
      projectId?: number;
      testCycleId: number;
      name: string;
      description?: string;
      outputDir?: string | boolean | null;
    };

    const projectId = resolveProjectId(rawProjectId);

    const body: Record<string, any> = {
      name,
      description,
      test_cycle_id: testCycleId,
    };

    const client = new QtestApiClient();
    const created = await client.post<QtestTestSuite>(
      `/api/v3/projects/${projectId}/test-suites`,
      body,
    );

    const summary = `**Test Suite Created**\n- ID: ${created.id}\n- Name: ${created.name}`;

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_create_test_suite",
      String(created.id),
      created,
      summary,
    );

    const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

    return {
      content: [{ type: "text", text: `${summary}${savedInfo}` }],
    };
  } catch (error) {
    const message =
      error instanceof QtestApiError
        ? mapApiError(error)
        : `Unexpected error: ${error instanceof Error ? error.message : "Unknown"}`;
    console.error(`[qtest-mcp] ${message}`);
    return { content: [{ type: "text", text: message }], isError: true };
  }
}
