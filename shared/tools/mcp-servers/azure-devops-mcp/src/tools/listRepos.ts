import { azdoRequest } from "../utils/apiClient.js";

export const listReposSchema = {
  name: "azdo_list_repos",
  description: "List Git repositories in an Azure DevOps project",
  inputSchema: {
    type: "object" as const,
    properties: {
      project: { type: "string", description: "Project name (uses default if omitted)" },
    },
    required: [],
  },
};

export async function handleListRepos(args: Record<string, unknown>) {
  const data = await azdoRequest<any>({ path: "git/repositories", project: args.project as string });
  const repos = (data.value || []).map((r: any) => ({
    name: r.name,
    id: r.id,
    defaultBranch: r.defaultBranch?.replace("refs/heads/", ""),
    url: r.webUrl,
  }));
  return { content: [{ type: "text", text: JSON.stringify(repos, null, 2) }] };
}
