import { QtestApiClient, resolveProjectId, resolveModulePid, resolveRequirementPid, withErrorHandling } from "../utils/qtestClient.js";
import { saveData } from "../utils/fileUtils.js";
import { formatRequirements } from "../utils/formatting.js";
import type { QtestRequirement, ToolResponse } from "../utils/types.js";

/**
 * Fetch linked test cases for a requirement via the linked-artifacts endpoint.
 * GET /linked-artifacts?type=requirements&ids={requirementId}
 */
async function fetchLinkedTestCases(
  client: QtestApiClient,
  projectId: number,
  requirementId: number,
): Promise<Array<{ id: number; name: string; pid?: string }> | undefined> {
  try {
    const resp = await client.get<any[]>(
      `/api/v3/projects/${projectId}/linked-artifacts?type=requirements&ids=${requirementId}`,
    );
    const entry = Array.isArray(resp) ? resp.find((r: any) => r.id === requirementId) : null;
    const objects = entry?.objects ?? [];
    if (objects.length > 0) {
      return objects.map((tc: any) => ({ id: tc.id ?? 0, name: tc.pid ?? String(tc.id), pid: tc.pid }));
    }
  } catch (e) {
    console.error(`[qtest-mcp] Failed to fetch linked test cases: ${e instanceof Error ? e.message : e}`);
  }
  return undefined;
}

// ── qtest_get_requirements ──────────────────────────────────────────

export const qtestGetRequirementsSchema = {
  name: "qtest_get_requirements",
  description: "Retrieve requirements tree for a qTest project",
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
          "Directory to save the requirements data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: [],
  },
};

interface GetRequirementsArgs {
  projectId?: number;
  outputDir?: string | boolean | null;
}

export async function handleQtestGetRequirements(args: GetRequirementsArgs): Promise<ToolResponse> {
  return withErrorHandling(async () => {
    const { projectId: rawProjectId, outputDir } = args;
    const projectId = resolveProjectId(rawProjectId);

    const client = new QtestApiClient();
    const requirements = await client.get<QtestRequirement[]>(
      `/api/v3/projects/${projectId}/requirements`,
    );

    const summary = formatRequirements(requirements);

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_get_requirements",
      String(projectId),
      requirements,
      summary,
    );

    const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

    return {
      content: [{ type: "text", text: `${summary}${savedInfo}` }],
    };
  });
}


// ── qtest_get_requirement ───────────────────────────────────────────

export const qtestGetRequirementSchema = {
  name: "qtest_get_requirement",
  description: "Retrieve requirement details with linked test cases from qTest",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      requirementId: {
        type: ["string", "number"],
        description: "The qTest requirement identifier — accepts RQ-#### PID format (e.g., \"RQ-1239\") or a numeric ID",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the requirement data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["requirementId"],
  },
};

interface GetRequirementArgs {
  projectId?: number;
  requirementId: string | number;
  outputDir?: string | boolean | null;
}

export async function handleQtestGetRequirement(args: GetRequirementArgs): Promise<ToolResponse> {
  return withErrorHandling(async () => {
    const { projectId: rawProjectId, requirementId: rawReqId, outputDir } = args;
    const projectId = resolveProjectId(rawProjectId);
    const client = new QtestApiClient();

    const reqIdStr = String(rawReqId);
    const isRqPid = /^RQ-\d+$/i.test(reqIdStr);
    let numericReqId: number;

    if (isRqPid) {
      const resolved = await resolveRequirementPid(client, projectId, reqIdStr);
      if (!resolved) {
        return {
          content: [{ type: "text", text: `Requirement "${reqIdStr}" not found in project ${projectId}.` }],
          isError: true,
        };
      }
      numericReqId = resolved;
    } else {
      numericReqId = Number(rawReqId);
      if (isNaN(numericReqId)) {
        return {
          content: [{ type: "text", text: `Invalid requirementId: "${rawReqId}". Use RQ-#### format (e.g., "RQ-1239") or a numeric ID.` }],
          isError: true,
        };
      }
    }

    const requirement = await client.get<QtestRequirement>(
      `/api/v3/projects/${projectId}/requirements/${numericReqId}`,
    );

    requirement.linked_test_cases = await fetchLinkedTestCases(client, projectId, numericReqId);

    const summary = formatRequirements([requirement]);

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_get_requirement",
      String(rawReqId),
      requirement,
      summary,
    );

    const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

    return {
      content: [{ type: "text", text: `${summary}${savedInfo}` }],
    };
  });
}


// ── qtest_link_requirement ──────────────────────────────────────────

export const qtestLinkRequirementSchema = {
  name: "qtest_link_requirement",
  description: "Create a traceability link between a requirement and a test case in qTest",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      requirementId: {
        type: ["string", "number"],
        description: "The qTest requirement — accepts RQ-#### PID format (e.g., \"RQ-1239\") or a numeric ID",
      },
      testCaseId: {
        type: "number",
        description: "The qTest test case ID to link",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the link confirmation data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["requirementId", "testCaseId"],
  },
};

interface LinkRequirementArgs {
  projectId?: number;
  requirementId: string | number;
  testCaseId: number;
  outputDir?: string | boolean | null;
}

export async function handleQtestLinkRequirement(args: LinkRequirementArgs): Promise<ToolResponse> {
  return withErrorHandling(async () => {
    const { projectId: rawProjectId, requirementId: rawReqId, testCaseId, outputDir } = args;
    const projectId = resolveProjectId(rawProjectId);
    const client = new QtestApiClient();

    const reqIdStr = String(rawReqId);
    const isRqPid = /^RQ-\d+$/i.test(reqIdStr);
    let numericReqId: number;

    if (isRqPid) {
      const resolved = await resolveRequirementPid(client, projectId, reqIdStr);
      if (!resolved) {
        return {
          content: [{ type: "text", text: `Requirement "${reqIdStr}" not found in project ${projectId}.` }],
          isError: true,
        };
      }
      numericReqId = resolved;
    } else {
      numericReqId = Number(rawReqId);
      if (isNaN(numericReqId)) {
        return {
          content: [{ type: "text", text: `Invalid requirementId: "${rawReqId}". Use RQ-#### format (e.g., "RQ-1239") or a numeric ID.` }],
          isError: true,
        };
      }
    }

    const result = await client.post<any>(
      `/api/v3/projects/${projectId}/requirements/${numericReqId}/link?type=test-cases`,
      [testCaseId],
    );

    const reqLabel = isRqPid ? `${reqIdStr} (${numericReqId})` : String(numericReqId);
    const summary = `**Requirement-Test Case Link Created**\n- Requirement: ${reqLabel}\n- Test Case ID: ${testCaseId}\n- Project ID: ${projectId}`;

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_link_requirement",
      `${numericReqId}-tc-${testCaseId}`,
      result,
      summary,
    );

    const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

    return {
      content: [{ type: "text", text: `${summary}${savedInfo}` }],
    };
  });
}


// ── qtest_create_requirement ────────────────────────────────────────

export const qtestCreateRequirementSchema = {
  name: "qtest_create_requirement",
  description: "Create a new requirement in qTest. Useful for importing Jira stories as qTest requirements.",
  inputSchema: {
    type: "object",
    properties: {
      projectId: {
        type: "number",
        description: "The qTest project ID (optional, defaults to QTEST_PROJECT_ID env var)",
      },
      name: {
        type: "string",
        description: "The requirement name/title",
      },
      description: {
        type: "string",
        description: "The requirement description (optional, supports HTML)",
      },
      parentId: {
        type: ["string", "number"],
        description: "Parent requirement module — accepts MD-#### PID format (e.g., \"MD-42\") or a numeric ID. Determines where the requirement lands in the tree.",
      },
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the created requirement data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: ["name", "parentId"],
  },
};

interface CreateRequirementArgs {
  projectId?: number;
  name: string;
  description?: string;
  parentId: string | number;
  outputDir?: string | boolean | null;
}

export async function handleQtestCreateRequirement(args: CreateRequirementArgs): Promise<ToolResponse> {
  return withErrorHandling(async () => {
    const { projectId: rawProjectId, name, description, parentId: rawParentId, outputDir } = args;
    const projectId = resolveProjectId(rawProjectId);
    const client = new QtestApiClient();

    const parentIdStr = String(rawParentId);
    const isMdPid = /^MD-\d+$/i.test(parentIdStr);
    let numericParentId: number;

    if (isMdPid) {
      const resolved = await resolveModulePid(client, projectId, parentIdStr);
      if (!resolved) {
        return {
          content: [{ type: "text", text: `Module "${parentIdStr}" not found in project ${projectId}. Use qtest_get_requirements to browse the module tree.` }],
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

    const body: Record<string, any> = {
      name,
      parent_id: numericParentId,
    };

    const created = await client.post<QtestRequirement>(
      `/api/v3/projects/${projectId}/requirements`,
      body,
    );

    const warnings: string[] = [];

    // Set description via properties — qTest requires it as a property field, not a top-level field
    if (description) {
      const descField = (created as any).properties?.find(
        (p: any) => p.field_name === "Description",
      );
      if (descField) {
        try {
          await client.put<any>(
            `/api/v3/projects/${projectId}/requirements/${created.id}`,
            { properties: [{ field_id: descField.field_id, field_value: description }] },
          );
        } catch (descError) {
          const msg = `Description update failed: ${descError instanceof Error ? descError.message : descError}`;
          console.error(`[qtest-mcp] Warning: ${msg}`);
          warnings.push(msg);
        }
      }
    }

    const parentLabel = isMdPid ? `${parentIdStr} (${numericParentId})` : String(numericParentId);
    let summary = `**Requirement Created**\n- ID: ${created.id}\n- PID: ${created.pid}\n- Name: ${created.name}\n- Parent: ${parentLabel}\n- Project ID: ${projectId}`;

    // Auto-comment so the comments endpoint can resolve this requirement by PID later
    try {
      await client.post<any>(
        `/api/v3/projects/${projectId}/requirements/${created.id}/comments`,
        { content: "Created with qTest MCP" },
      );
    } catch (commentError) {
      const msg = `Auto-comment failed (PID resolution for this requirement may not work): ${commentError instanceof Error ? commentError.message : commentError}`;
      console.error(`[qtest-mcp] Warning: ${msg}`);
      warnings.push(msg);
    }

    if (warnings.length > 0) {
      summary += `\n\n**⚠️ Warnings:**\n${warnings.map(w => `- ${w}`).join("\n")}`;
    }

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_create_requirement",
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
