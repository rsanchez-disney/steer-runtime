import { azdoRequest } from "../utils/apiClient.js";

export const getFileSchema = {
  name: "azdo_get_file",
  description: "Get file content from an Azure DevOps repository",
  inputSchema: {
    type: "object" as const,
    properties: {
      project: { type: "string", description: "Project name" },
      repoId: { type: "string", description: "Repository name or ID" },
      path: { type: "string", description: "File path (e.g., /src/index.ts)" },
      branch: { type: "string", description: "Branch name (optional, defaults to main)" },
    },
    required: ["repoId", "path"],
  },
};

export async function handleGetFile(args: Record<string, unknown>) {
  const params: Record<string, string> = { "path": args.path as string };
  if (args.branch) params["versionDescriptor.version"] = args.branch as string;
  params["versionDescriptor.versionType"] = "branch";

  const data = await azdoRequest<any>({
    path: `git/repositories/${args.repoId}/items`,
    project: args.project as string,
    params: { ...params, includeContent: "true" },
  });
  return { content: [{ type: "text", text: data.content || JSON.stringify(data, null, 2) }] };
}
