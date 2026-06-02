import { azdoRequest } from "../utils/apiClient.js";

export const getPipelineRunSchema = {
  name: "azdo_get_pipeline_run",
  description: "Get details of a pipeline run including status and stages",
  inputSchema: {
    type: "object" as const,
    properties: {
      project: { type: "string", description: "Project name" },
      pipelineId: { type: "number", description: "Pipeline ID" },
      runId: { type: "number", description: "Run ID" },
    },
    required: ["pipelineId", "runId"],
  },
};

export async function handleGetPipelineRun(args: Record<string, unknown>) {
  const data = await azdoRequest<any>({
    path: `pipelines/${args.pipelineId}/runs/${args.runId}`,
    project: args.project as string,
  });
  const result = {
    id: data.id,
    name: data.name,
    state: data.state,
    result: data.result,
    createdDate: data.createdDate,
    finishedDate: data.finishedDate,
    sourceBranch: data.resources?.repositories?.self?.refName?.replace("refs/heads/", ""),
    url: data._links?.web?.href,
  };
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}
