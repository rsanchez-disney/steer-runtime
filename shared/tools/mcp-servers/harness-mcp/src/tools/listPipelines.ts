import { harnessRequest } from "../utils/apiClient.js";

export const listPipelinesSchema = {
  name: "harness_list_pipelines",
  description: "List pipelines in a Harness project",
  inputSchema: {
    type: "object" as const,
    properties: {
      org: { type: "string", description: "Organization identifier" },
      project: { type: "string", description: "Project identifier" },
      searchTerm: { type: "string", description: "Filter by name (optional)" },
    },
    required: ["org", "project"],
  },
};

export async function handleListPipelines(args: Record<string, unknown>) {
  const org = args.org as string;
  const project = args.project as string;
  const params: Record<string, string> = {
    orgIdentifier: org,
    projectIdentifier: project,
    size: "25",
  };
  if (args.searchTerm) params.searchTerm = args.searchTerm as string;

  const data = await harnessRequest<any>({
    method: "POST",
    path: "pipeline/api/pipelines/list",
    params,
    body: { filterType: "PipelineSetup" },
  });

  const pipelines = (data?.data?.content || []).map((p: any) => ({
    name: p.name,
    identifier: p.identifier,
    lastExecution: p.recentExecutionsInfo?.[0]?.status,
    lastRunAt: p.recentExecutionsInfo?.[0]?.startTs
      ? new Date(p.recentExecutionsInfo[0].startTs).toISOString()
      : null,
  }));

  return { content: [{ type: "text", text: JSON.stringify(pipelines, null, 2) }] };
}
