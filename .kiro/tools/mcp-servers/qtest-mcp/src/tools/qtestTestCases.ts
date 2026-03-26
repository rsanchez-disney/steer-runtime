import { QtestApiClient, resolveProjectId, resolveModulePid, withErrorHandling } from "../utils/qtestClient.js";
import { saveData } from "../utils/fileUtils.js";
import { formatTestCase } from "../utils/formatting.js";
import type { QtestTestCase, QtestTestStep, ToolResponse } from "../utils/types.js";

// ── qtest_get_test_case ─────────────────────────────────────────────

export const qtestGetTestCaseSchema = {
  name: "qtest_get_test_case",
  description: "Retrieve test case details from qTest. Accepts TC-#### format (e.g. TC-1234) or numeric ID.",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      testCaseId: {
        type: ["string", "number"],
        description: "The test case identifier — TC-#### format (e.g. 'TC-1234') or numeric ID",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the test case data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["testCaseId"],
  },
};

interface GetTestCaseArgs {
  projectId?: number;
  testCaseId: string | number;
  outputDir?: string | boolean | null;
}

export async function handleQtestGetTestCase(args: GetTestCaseArgs): Promise<ToolResponse> {
  return withErrorHandling(async () => {
    const { projectId: rawProjectId, testCaseId, outputDir } = args;
    const projectId = resolveProjectId(rawProjectId);
    const client = new QtestApiClient();

    const tcIdStr = String(testCaseId);
    const isPid = /^TC-\d+$/i.test(tcIdStr);
    const lookupPath = isPid
      ? `/api/v3/projects/${projectId}/test-cases/${tcIdStr}`
      : `/api/v3/projects/${projectId}/test-cases/${testCaseId}`;

    const testCase = await client.get<QtestTestCase>(lookupPath);

    // Fetch test steps from the versioned endpoint
    const numericId = testCase.id;
    const versionId = (testCase as any).test_case_version_id ?? (testCase as any).version;
    if (versionId) {
      try {
        const steps = await client.get<QtestTestStep[]>(
          `/api/v3/projects/${projectId}/test-cases/${numericId}/versions/${versionId}/test-steps?expand=&showParamIdentifier=false`,
        );
        if (steps && steps.length > 0) {
          testCase.test_steps = steps;
        }
      } catch {
        // Steps fetch failed — continue with whatever test_steps came from the main response
      }
    }

    const summary = formatTestCase(testCase);

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_get_test_case",
      String(testCaseId),
      testCase,
      summary,
    );

    const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

    return {
      content: [{ type: "text", text: `${summary}${savedInfo}` }],
    };
  });
}


// ── qtest_create_test_case ──────────────────────────────────────────

export const qtestCreateTestCaseSchema = {
  name: "qtest_create_test_case",
  description: "Create a new test case in qTest",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      name: {
        type: "string",
        description: "The test case name",
      },
      description: {
        type: "string",
        description: "The test case description (optional)",
      },
      precondition: {
        type: "string",
        description: "The test case precondition (optional)",
      },
      testSteps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            description: { type: "string" },
            expected: { type: "string" },
          },
          required: ["description", "expected"],
        },
        description: "Array of test steps with description and expected result (optional)",
      },
      parentId: {
        type: ["string", "number"],
        description: "Parent module for the test case — accepts MD-#### PID format (e.g., \"MD-42\") or a numeric ID (optional)",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the test case data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["name"],
  },
};

interface CreateTestCaseArgs {
  projectId?: number;
  name: string;
  description?: string;
  precondition?: string;
  testSteps?: Array<{ description: string; expected: string }>;
  parentId?: string | number;
  outputDir?: string | boolean | null;
}

export async function handleQtestCreateTestCase(args: CreateTestCaseArgs): Promise<ToolResponse> {
  return withErrorHandling(async () => {
    const { projectId: rawProjectId, name, description, precondition, testSteps, parentId: rawParentId, outputDir } = args;
    const projectId = resolveProjectId(rawProjectId);
    const client = new QtestApiClient();

    let numericParentId: number | undefined;
    if (rawParentId !== undefined && rawParentId !== null) {
      const parentIdStr = String(rawParentId);
      const isMdPid = /^MD-\d+$/i.test(parentIdStr);
      if (isMdPid) {
        const resolved = await resolveModulePid(client, projectId, parentIdStr);
        if (!resolved) {
          return {
            content: [{ type: "text", text: `Module "${parentIdStr}" not found in project ${projectId}.` }],
            isError: true,
          };
        }
        numericParentId = resolved;
      } else {
        numericParentId = Number(rawParentId);
        if (isNaN(numericParentId)) {
          return {
            content: [{ type: "text", text: `Invalid parentId: "${rawParentId}". Use MD-#### format (e.g., "MD-42") or a numeric ID.` }],
            isError: true,
          };
        }
      }
    }

    const body: Record<string, any> = {
      name,
      description,
      precondition,
      test_steps: testSteps?.map((s, i) => ({ ...s, order: i + 1 })),
      parent_id: numericParentId,
    };

    const created = await client.post<QtestTestCase>(
      `/api/v3/projects/${projectId}/test-cases`,
      body,
    );

    const summary = `**Test Case Created**\n- ID: ${created.id}\n- PID: ${created.pid ?? "N/A"}\n- Name: ${created.name}\n- URL: ${created.web_url ?? "N/A"}`;

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_create_test_case",
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


// ── qtest_update_test_case ──────────────────────────────────────────

export const qtestUpdateTestCaseSchema = {
  name: "qtest_update_test_case",
  description: "Update test case fields in qTest",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      testCaseId: {
        type: "number",
        description: "The qTest test case ID to update",
      },
      name: {
        type: "string",
        description: "Updated test case name (optional)",
      },
      description: {
        type: "string",
        description: "Updated test case description (optional)",
      },
      precondition: {
        type: "string",
        description: "Updated test case precondition (optional)",
      },
      testSteps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            description: { type: "string" },
            expected: { type: "string" },
          },
          required: ["description", "expected"],
        },
        description: "Updated array of test steps (optional)",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the test case data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["testCaseId"],
  },
};

interface UpdateTestCaseArgs {
  projectId?: number;
  testCaseId: number;
  name?: string;
  description?: string;
  precondition?: string;
  testSteps?: Array<{ description: string; expected: string }>;
  outputDir?: string | boolean | null;
}

export async function handleQtestUpdateTestCase(args: UpdateTestCaseArgs): Promise<ToolResponse> {
  return withErrorHandling(async () => {
    const { projectId: rawProjectId, testCaseId, name, description, precondition, testSteps, outputDir } = args;
    const projectId = resolveProjectId(rawProjectId);

    const body: Record<string, any> = {};
    if (name !== undefined) body.name = name;
    if (description !== undefined) body.description = description;
    if (precondition !== undefined) body.precondition = precondition;
    if (testSteps !== undefined) {
      body.test_steps = testSteps.map((s, i) => ({ ...s, order: i + 1 }));
    }

    const client = new QtestApiClient();
    const updated = await client.put<QtestTestCase>(
      `/api/v3/projects/${projectId}/test-cases/${testCaseId}`,
      body,
    );

    const summary = `**Test Case Updated**\n- ID: ${updated.id}\n- Name: ${updated.name}\n- URL: ${updated.web_url ?? "N/A"}`;

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_update_test_case",
      String(testCaseId),
      updated,
      summary,
    );

    const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

    return {
      content: [{ type: "text", text: `${summary}${savedInfo}` }],
    };
  });
}


// ── qtest_search_test_cases ─────────────────────────────────────────

export const qtestSearchTestCasesSchema = {
  name: "qtest_search_test_cases",
  description: "Search test cases in a qTest project",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      query: {
        type: "string",
        description: "Search query string",
      },
      page: {
        type: "number",
        description: "Page number (optional, defaults to 1)",
      },
      pageSize: {
        type: "number",
        description: "Number of results per page (optional, defaults to 25)",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the search results (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["query"],
  },
};

interface SearchTestCasesArgs {
  projectId?: number;
  query: string;
  page?: number;
  pageSize?: number;
  outputDir?: string | boolean | null;
}

export async function handleQtestSearchTestCases(args: SearchTestCasesArgs): Promise<ToolResponse> {
  return withErrorHandling(async () => {
    const { projectId: rawProjectId, query, page = 1, pageSize = 25, outputDir } = args;
    const projectId = resolveProjectId(rawProjectId);

    const body = {
      object_type: "test-cases",
      query,
      page,
      page_size: pageSize,
    };

    const client = new QtestApiClient();
    const results = await client.post<any>(
      `/api/v3/projects/${projectId}/search`,
      body,
    );

    const items: QtestTestCase[] = results.items ?? results ?? [];
    const total: number = results.total ?? items.length;

    let summary = `**Test Case Search Results**\n- Query: "${query}"\n- Page: ${page}\n- Page Size: ${pageSize}\n- Total: ${total}\n\n`;
    items.forEach((tc: QtestTestCase, i: number) => {
      summary += `${i + 1}. [${tc.pid ?? tc.id}] ${tc.name}\n`;
    });

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_search_test_cases",
      `search-p${page}`,
      results,
      summary,
    );

    const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

    return {
      content: [{ type: "text", text: `${summary}${savedInfo}` }],
    };
  });
}
