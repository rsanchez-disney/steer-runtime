import { QtestApiClient, mapApiError, resolveProjectId } from "../utils/qtestClient.js";
import { saveData } from "../utils/fileUtils.js";
import { formatDefects } from "../utils/formatting.js";
import { QtestApiError } from "../utils/types.js";
import type { QtestDefect, ToolResponse } from "../utils/types.js";

// ── qtest_get_defects ───────────────────────────────────────────────

export const qtestGetDefectsSchema = {
  name: "qtest_get_defects",
  description: "Retrieve defects linked to a test run in qTest",
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
          "Directory to save the defects data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["testRunId"],
  },
};

export async function handleQtestGetDefects(args: any): Promise<ToolResponse> {
  try {
    const { projectId: rawProjectId, testRunId, outputDir } = args as {
      projectId?: number;
      testRunId: number;
      outputDir?: string | boolean | null;
    };

    const projectId = resolveProjectId(rawProjectId);

    const client = new QtestApiClient();
    const defects = await client.get<QtestDefect[]>(
      `/api/v3/projects/${projectId}/test-runs/${testRunId}/defects`,
    );

    const summary = formatDefects(defects);

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_get_defects",
      `${projectId}-run-${testRunId}`,
      defects,
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


// ── qtest_link_defect ───────────────────────────────────────────────

export const qtestLinkDefectSchema = {
  name: "qtest_link_defect",
  description: "Link an existing defect to a test run in qTest",
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
      defectId: {
        type: "number",
        description: "The qTest defect ID to link",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the link confirmation data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["testRunId", "defectId"],
  },
};

export async function handleQtestLinkDefect(args: any): Promise<ToolResponse> {
  try {
    const { projectId: rawProjectId, testRunId, defectId, outputDir } = args as {
      projectId?: number;
      testRunId: number;
      defectId: number;
      outputDir?: string | boolean | null;
    };

    const projectId = resolveProjectId(rawProjectId);

    const client = new QtestApiClient();
    const result = await client.post<any>(
      `/api/v3/projects/${projectId}/test-runs/${testRunId}/defects`,
      { defect_id: defectId },
    );

    const summary = `**Defect Linked to Test Run**\n- Defect ID: ${defectId}\n- Test Run ID: ${testRunId}\n- Project ID: ${projectId}`;

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_link_defect",
      `${testRunId}-defect-${defectId}`,
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


// ── qtest_submit_defect ─────────────────────────────────────────────

export const qtestSubmitDefectSchema = {
  name: "qtest_submit_defect",
  description: "Create a new defect linked to a test run in qTest",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      testRunId: {
        type: "number",
        description: "The qTest test run ID to link the defect to",
      },
      summary: {
        type: "string",
        description: "Summary/title of the defect",
      },
      description: {
        type: "string",
        description: "Detailed description of the defect (optional)",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the created defect data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["testRunId", "summary"],
  },
};

export async function handleQtestSubmitDefect(args: any): Promise<ToolResponse> {
  try {
    const { projectId: rawProjectId, testRunId, summary, description, outputDir } = args as {
      projectId?: number;
      testRunId: number;
      summary: string;
      description?: string;
      outputDir?: string | boolean | null;
    };

    const projectId = resolveProjectId(rawProjectId);

    const client = new QtestApiClient();
    const result = await client.post<any>(
      `/api/v3/projects/${projectId}/defects`,
      { summary, description, linked_test_run_id: testRunId },
    );

    const defectId = result.id ?? "unknown";
    const responseSummary = `**Defect Created**\n- Defect ID: ${defectId}\n- Summary: ${summary}\n- Linked Test Run ID: ${testRunId}\n- Project ID: ${projectId}`;

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_submit_defect",
      String(defectId),
      result,
      responseSummary,
    );

    const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

    return {
      content: [{ type: "text", text: `${responseSummary}${savedInfo}` }],
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
