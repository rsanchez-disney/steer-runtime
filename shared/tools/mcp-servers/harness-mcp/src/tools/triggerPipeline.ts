import { harnessRequest } from "../utils/apiClient.js";

export const triggerPipelineSchema = {
  name: "harness_trigger_pipeline",
  description: "Trigger a pipeline execution",
  inputSchema: {
    type: "object" as const,
    properties: {
      org: { type: "string", description: "Organization identifier" },
      project: { type: "string", description: "Project identifier" },
      pipelineId: { type: "string", description: "Pipeline identifier" },
      branch: { type: "string", description: "Git branch (optional)" },
      inputSetRefs: { type: "array", items: { type: "string" }, description: "Input set references (optional)" },
    },
    required: ["org", "project", "pipelineId"],
  },
};

export async function handleTriggerPipeline(args: Record<string, unknown>) {
  const org = args.org as string;
  const project = args.project as string;
  const pipelineId = args.pipelineId as string;

  const params: Record<string, string> = {
    orgIdentifier: org,
    projectIdentifier: project,
  };
  if (args.branch) params.branch = args.branch as string;

  const body: any = {};
  if (args.inputSetRefs) {
    body.inputSetReferences = args.inputSetRefs;
  }

  const data = await harnessRequest<any>({
    method: "POST",
    path: `pipeline/api/pipeline/execute/${pipelineId}`,
    params,
    body,
  });

  const result = {
    executionId: data?.data?.planExecution?.uuid,
    status: data?.status,
    message: data?.message || "Pipeline triggered",
  };

  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}
