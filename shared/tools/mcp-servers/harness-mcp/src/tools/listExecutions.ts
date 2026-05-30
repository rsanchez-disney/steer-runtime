import { harnessRequest } from "../utils/apiClient.js";

export const listExecutionsSchema = {
  name: "harness_list_executions",
  description: "List recent pipeline executions with optional filters",
  inputSchema: {
    type: "object" as const,
    properties: {
      org: { type: "string", description: "Organization identifier" },
      project: { type: "string", description: "Project identifier" },
      pipelineId: { type: "string", description: "Pipeline identifier (optional)" },
      status: { type: "string", description: "Filter by status: Success, Failed, Running, Aborted (optional)" },
      size: { type: "number", description: "Number of results (default 10)" },
    },
    required: ["org", "project"],
  },
};

export async function handleListExecutions(args: Record<string, unknown>) {
  const org = args.org as string;
  const project = args.project as string;
  const params: Record<string, string> = {
    orgIdentifier: org,
    projectIdentifier: project,
    size: String(args.size || 10),
    sort: "startTs,DESC",
  };
  if (args.pipelineId) params.pipelineIdentifier = args.pipelineId as string;
  if (args.status) params.status = args.status as string;

  const data = await harnessRequest<any>({
    method: "POST",
    path: "pipeline/api/pipelines/execution/v2/summary",
    params,
    body: { filterType: "PipelineExecution" },
  });

  const executions = (data?.data?.content || []).map((e: any) => ({
    id: e.planExecutionId,
    pipeline: e.pipelineIdentifier,
    status: e.status,
    trigger: e.executionTriggerInfo?.triggerType,
    triggeredBy: e.executionTriggerInfo?.triggeredBy?.identifier,
    startedAt: e.startTs ? new Date(e.startTs).toISOString() : null,
    endedAt: e.endTs ? new Date(e.endTs).toISOString() : null,
  }));

  return { content: [{ type: "text", text: JSON.stringify(executions, null, 2) }] };
}
