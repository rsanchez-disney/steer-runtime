import { azdoRequest } from "../utils/apiClient.js";

export const listPipelinesSchema = {
  name: "azdo_list_pipelines",
  description: "List pipelines in an Azure DevOps project",
  inputSchema: {
    type: "object" as const,
    properties: {
      project: { type: "string", description: "Project name" },
    },
    required: [],
  },
};

export async function handleListPipelines(args: Record<string, unknown>) {
  const data = await azdoRequest<any>({ path: "pipelines", project: args.project as string });
  const pipelines = (data.value || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    folder: p.folder,
    url: p._links?.web?.href,
  }));
  return { content: [{ type: "text", text: JSON.stringify(pipelines, null, 2) }] };
}
