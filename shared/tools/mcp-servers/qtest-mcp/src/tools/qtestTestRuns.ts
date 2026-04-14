import { QtestApiClient, resolveProjectId, withErrorHandling } from "../utils/qtestClient.js";
import { saveData } from "../utils/fileUtils.js";
import { formatTestRun } from "../utils/formatting.js";
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

interface GetTestRunArgs {
  projectId?: number;
  testRunId: number;
  outputDir?: string | boolean | null;
}

export async function handleQtestGetTestRun(args: GetTestRunArgs): Promise<ToolResponse> {
  return withErrorHandling(async () => {
    const { projectId: rawProjectId, testRunId, outputDir } = args;
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
  });
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

interface CreateTestRunArgs {
  projectId?: number;
  testCaseId: number;
  parentId: number;
  name?: string;
  outputDir?: string | boolean | null;
}

export async function handleQtestCreateTestRun(args: CreateTestRunArgs): Promise<ToolResponse> {
  return withErrorHandling(async () => {
    const { projectId: rawProjectId, testCaseId, parentId, name, outputDir } = args;
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
  });
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
      exeStartDate: {
        type: "string",
        description: "Execution start date in ISO 8601 format (optional, defaults to current time)",
      },
      exeEndDate: {
        type: "string",
        description: "Execution end date in ISO 8601 format (optional, defaults to current time)",
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

interface UpdateTestRunResultArgs {
  projectId?: number;
  testRunId: number;
  status: "passed" | "failed" | "blocked" | "incomplete";
  note?: string;
  exeStartDate?: string;
  exeEndDate?: string;
  outputDir?: string | boolean | null;
}

export async function handleQtestUpdateTestRunResult(args: UpdateTestRunResultArgs): Promise<ToolResponse> {
  return withErrorHandling(async () => {
    const { projectId: rawProjectId, testRunId, status, note, exeStartDate, exeEndDate, outputDir } = args;
    const projectId = resolveProjectId(rawProjectId);

    const now = new Date().toISOString();
    const body = {
      status,
      note,
      exe_start_date: exeStartDate ?? now,
      exe_end_date: exeEndDate ?? now,
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
  });
}
