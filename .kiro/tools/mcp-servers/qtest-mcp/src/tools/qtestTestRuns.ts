import { QtestApiClient, mapApiError, resolveProjectId } from "../utils/qtestClient.js";
import { saveData } from "../utils/fileUtils.js";
import { formatTestRun } from "../utils/formatting.js";
import { QtestApiError } from "../utils/types.js";
import type { QtestTestRun, ToolResponse } from "../utils/types.js";

// ── qtest_get_test_run ──────────────────────────────────────────────

export const qtestGetTestRunSchema = {
  name: "qtest_get_test_run",
  description: "Retrieve test run details from qTest",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      testRunId: {
        type: "number",
        description: "The qTest test run ID",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the test run data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["testRunId"],
  },
};

export async function handleQtestGetTestRun(args: any): Promise<ToolResponse> {
  try {
    const { projectId: rawProjectId, testRunId, outputDir } = args as {
      projectId?: number;
      testRunId: number;
      outputDir?: string | boolean | null;
    };

    const projectId = resolveProjectId(rawProjectId);

    const client = new QtestApiClient();
    const testRun = await client.get<QtestTestRun>(
      `/api/v3/projects/${projectId}/test-runs/${testRunId}`,
    );

    const summary = formatTestRun(testRun);

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_get_test_run",
      String(testRunId),
      testRun,
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


// ── qtest_create_test_run ───────────────────────────────────────────

export const qtestCreateTestRunSchema = {
  name: "qtest_create_test_run",
  description: "Create a new test run in qTest",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      testCaseId: {
        type: "number",
        description: "The qTest test case ID to create a run for",
      },
      parentId: {
        type: "number",
        description: "Parent test cycle or test suite ID",
      },
      name: {
        type: "string",
        description: "The test run name (optional)",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the test run data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["testCaseId", "parentId"],
  },
};

export async function handleQtestCreateTestRun(args: any): Promise<ToolResponse> {
  try {
    const { projectId: rawProjectId, testCaseId, parentId, name, outputDir } = args as {
      projectId?: number;
      testCaseId: number;
      parentId: number;
      name?: string;
      outputDir?: string | boolean | null;
    };

    const projectId = resolveProjectId(rawProjectId);

    const body: Record<string, any> = {
      name,
      test_case: { id: testCaseId },
      parent_id: parentId,
    };

    const client = new QtestApiClient();
    const created = await client.post<QtestTestRun>(
      `/api/v3/projects/${projectId}/test-runs`,
      body,
    );

    const summary = `**Test Run Created**\n- ID: ${created.id}\n- Name: ${created.name}\n- Test Case ID: ${testCaseId}\n- Parent ID: ${parentId}`;

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_create_test_run",
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


// ── qtest_update_test_run_result ────────────────────────────────────

export const qtestUpdateTestRunResultSchema = {
  name: "qtest_update_test_run_result",
  description: "Submit a test execution result for a test run in qTest",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      testRunId: {
        type: "number",
        description: "The qTest test run ID",
      },
      status: {
        type: "string",
        enum: ["passed", "failed", "blocked", "incomplete"],
        description: "The test execution status",
      },
      note: {
        type: "string",
        description: "Execution commentary or notes (optional)",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the result data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["testRunId", "status"],
  },
};

export async function handleQtestUpdateTestRunResult(args: any): Promise<ToolResponse> {
  try {
    const { projectId: rawProjectId, testRunId, status, note, outputDir } = args as {
      projectId?: number;
      testRunId: number;
      status: "passed" | "failed" | "blocked" | "incomplete";
      note?: string;
      outputDir?: string | boolean | null;
    };

    const projectId = resolveProjectId(rawProjectId);

    const body = {
      status,
      note,
      exe_start_date: new Date().toISOString(),
      exe_end_date: new Date().toISOString(),
    };

    const client = new QtestApiClient();
    const result = await client.post<any>(
      `/api/v3/projects/${projectId}/test-runs/${testRunId}/auto-test-logs`,
      body,
    );

    const summary = `**Test Run Result Submitted**\n- Test Run ID: ${testRunId}\n- Status: ${status}\n- Note: ${note ?? "N/A"}`;

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_update_test_run_result",
      String(testRunId),
      result,
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
