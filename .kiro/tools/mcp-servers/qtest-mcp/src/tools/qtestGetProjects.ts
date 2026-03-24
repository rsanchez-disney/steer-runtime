import { QtestApiClient, mapApiError, resolveProjectId } from "../utils/qtestClient.js";
import { saveData } from "../utils/fileUtils.js";
import { formatProjects } from "../utils/formatting.js";
import { QtestApiError } from "../utils/types.js";
import type { QtestProject, ToolResponse } from "../utils/types.js";

export const qtestGetProjectsSchema = {
  name: "qtest_get_projects",
  description: "List all qTest projects",
  inputSchema: {
    type: "object",
    properties: {
      outputDir: {
        type: ["string", "boolean", "null"],
        description:
          "Directory to save the projects data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: [],
  },
};

export async function handleQtestGetProjects(args: any): Promise<ToolResponse> {
  try {
    const { outputDir } = args as { outputDir?: string | boolean | null };

    const client = new QtestApiClient();
    const projects = await client.get<QtestProject[]>("/api/v3/projects");

    const summary = formatProjects(projects);

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_get_projects",
      "all",
      projects,
      summary,
    );

    const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

    return {
      content: [{ type: "text", text: `${summary}${savedInfo}` }],
    };
  } catch (error) {
    const message = error instanceof QtestApiError
      ? mapApiError(error)
      : `Unexpected error: ${error instanceof Error ? error.message : "Unknown"}`;
    console.error(`[qtest-mcp] ${message}`);
    return { content: [{ type: "text", text: message }], isError: true };
  }
}

export const qtestGetProjectSchema = {
  name: "qtest_get_project",
  description: "Get a qTest project by ID",
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
          "Directory to save the project data (optional, defaults to /tmp/qtest-mcp/). Set to false or null to skip saving.",
      },
    },
    required: [],
  },
};

export async function handleQtestGetProject(args: any): Promise<ToolResponse> {
  try {
    const { projectId: rawProjectId, outputDir } = args as {
      projectId?: number;
      outputDir?: string | boolean | null;
    };

    const projectId = resolveProjectId(rawProjectId);

    const client = new QtestApiClient();
    const project = await client.get<QtestProject>(`/api/v3/projects/${projectId}`);

    const summary = formatProjects([project]);

    const savedPath = await saveData(
      outputDir as string | false | null | undefined,
      "qtest_get_project",
      String(projectId),
      project,
      summary,
    );

    const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

    return {
      content: [{ type: "text", text: `${summary}${savedInfo}` }],
    };
  } catch (error) {
    const message = error instanceof QtestApiError
      ? mapApiError(error)
      : `Unexpected error: ${error instanceof Error ? error.message : "Unknown"}`;
    console.error(`[qtest-mcp] ${message}`);
    return { content: [{ type: "text", text: message }], isError: true };
  }
}
