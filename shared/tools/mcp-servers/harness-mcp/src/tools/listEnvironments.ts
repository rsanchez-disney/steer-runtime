import { harnessRequest } from "../utils/apiClient.js";

export const listEnvironmentsSchema = {
  name: "harness_list_environments",
  description: "List environments in a Harness project",
  inputSchema: {
    type: "object" as const,
    properties: {
      org: { type: "string", description: "Organization identifier" },
      project: { type: "string", description: "Project identifier" },
    },
    required: ["org", "project"],
  },
};

export async function handleListEnvironments(args: Record<string, unknown>) {
  const org = args.org as string;
  const project = args.project as string;

  const data = await harnessRequest<any>({
    path: "ng/api/environmentsV2",
    params: {
      orgIdentifier: org,
      projectIdentifier: project,
      size: "50",
    },
  });

  const envs = (data?.data?.content || []).map((e: any) => ({
    name: e.environment?.name,
    identifier: e.environment?.identifier,
    type: e.environment?.type,
    description: e.environment?.description,
  }));

  return { content: [{ type: "text", text: JSON.stringify(envs, null, 2) }] };
}
