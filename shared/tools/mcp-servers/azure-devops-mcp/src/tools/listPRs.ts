import { azdoRequest } from "../utils/apiClient.js";

export const listPRsSchema = {
  name: "azdo_list_prs",
  description: "List pull requests in an Azure DevOps repository",
  inputSchema: {
    type: "object" as const,
    properties: {
      project: { type: "string", description: "Project name" },
      repoId: { type: "string", description: "Repository name or ID" },
      status: { type: "string", description: "Filter: active, completed, abandoned (default: active)" },
    },
    required: ["repoId"],
  },
};

export async function handleListPRs(args: Record<string, unknown>) {
  const repoId = args.repoId as string;
  const status = args.status as string || "active";
  const data = await azdoRequest<any>({
    path: `git/repositories/${repoId}/pullrequests`,
    project: args.project as string,
    params: { "searchCriteria.status": status },
  });
  const prs = (data.value || []).map((pr: any) => ({
    id: pr.pullRequestId,
    title: pr.title,
    author: pr.createdBy?.displayName,
    sourceBranch: pr.sourceRefName?.replace("refs/heads/", ""),
    targetBranch: pr.targetRefName?.replace("refs/heads/", ""),
    status: pr.status,
    createdAt: pr.creationDate,
    url: pr.url,
  }));
  return { content: [{ type: "text", text: JSON.stringify(prs, null, 2) }] };
}
