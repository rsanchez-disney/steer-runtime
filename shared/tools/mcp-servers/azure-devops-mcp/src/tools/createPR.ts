import { azdoRequest } from "../utils/apiClient.js";

export const createPRSchema = {
  name: "azdo_create_pr",
  description: "Create a pull request in an Azure DevOps repository",
  inputSchema: {
    type: "object" as const,
    properties: {
      project: { type: "string", description: "Project name" },
      repoId: { type: "string", description: "Repository name or ID" },
      title: { type: "string", description: "PR title" },
      description: { type: "string", description: "PR description" },
      sourceBranch: { type: "string", description: "Source branch name" },
      targetBranch: { type: "string", description: "Target branch name (default: main)" },
    },
    required: ["repoId", "title", "sourceBranch"],
  },
};

export async function handleCreatePR(args: Record<string, unknown>) {
  const data = await azdoRequest<any>({
    method: "POST",
    path: `git/repositories/${args.repoId}/pullrequests`,
    project: args.project as string,
    body: {
      sourceRefName: `refs/heads/${args.sourceBranch}`,
      targetRefName: `refs/heads/${args.targetBranch || "main"}`,
      title: args.title,
      description: args.description || "",
    },
  });
  return { content: [{ type: "text", text: JSON.stringify({ id: data.pullRequestId, title: data.title, url: data.url, status: data.status }, null, 2) }] };
}
