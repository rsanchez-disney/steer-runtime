import { harnessRequest } from "../utils/apiClient.js";

export const getLogsSchema = {
  name: "harness_get_logs",
  description: "Get logs for a specific step in a pipeline execution",
  inputSchema: {
    type: "object" as const,
    properties: {
      org: { type: "string", description: "Organization identifier" },
      project: { type: "string", description: "Project identifier" },
      executionId: { type: "string", description: "Pipeline execution ID" },
      nodeId: { type: "string", description: "Stage or step node ID" },
    },
    required: ["org", "project", "executionId", "nodeId"],
  },
};

export async function handleGetLogs(args: Record<string, unknown>) {
  const org = args.org as string;
  const project = args.project as string;
  const executionId = args.executionId as string;
  const nodeId = args.nodeId as string;

  try {
    const data = await harnessRequest<any>({
      path: `log-service/blob/download`,
      params: {
        orgIdentifier: org,
        projectIdentifier: project,
        prefix: `pipeline/execution/${executionId}/${nodeId}`,
      },
    });

    const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    return { content: [{ type: "text", text }] };
  } catch (err: any) {
    return {
      content: [{ type: "text", text: `⚠️ Log retrieval failed: ${err.message}\n\nThis may require additional permissions or the log-service endpoint may differ for this Harness instance.` }],
      isError: true,
    };
  }
}
