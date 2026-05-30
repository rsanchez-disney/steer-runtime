import { harnessRequest } from "../utils/apiClient.js";

export const getExecutionSchema = {
  name: "harness_get_execution",
  description: "Get detailed execution info including stages and steps",
  inputSchema: {
    type: "object" as const,
    properties: {
      org: { type: "string", description: "Organization identifier" },
      project: { type: "string", description: "Project identifier" },
      executionId: { type: "string", description: "Pipeline execution ID" },
    },
    required: ["org", "project", "executionId"],
  },
};

export async function handleGetExecution(args: Record<string, unknown>) {
  const org = args.org as string;
  const project = args.project as string;
  const executionId = args.executionId as string;

  const data = await harnessRequest<any>({
    path: `pipeline/api/pipelines/execution/${executionId}`,
    params: {
      orgIdentifier: org,
      projectIdentifier: project,
    },
  });

  const exec = data?.data;
  const nodeMap = exec?.executionGraph?.nodeMap || exec?.layoutNodeMap || {};
  const stages = Object.values(nodeMap).map((node: any) => ({
    name: node.name,
    identifier: node.nodeIdentifier,
    type: node.nodeType,
    status: node.status,
    startedAt: node.startTs ? new Date(node.startTs).toISOString() : null,
    duration: node.startTs && node.endTs ? `${Math.round((node.endTs - node.startTs) / 1000)}s` : null,
    failureMessage: node.failureInfo?.message,
  }));

  const result = {
    id: exec?.planExecutionId,
    pipeline: exec?.pipelineIdentifier,
    status: exec?.status,
    startedAt: exec?.startTs ? new Date(exec.startTs).toISOString() : null,
    endedAt: exec?.endTs ? new Date(exec.endTs).toISOString() : null,
    trigger: exec?.executionTriggerInfo?.triggerType,
    stages,
  };

  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}
