import { harnessRequest } from "../utils/apiClient.js";

export const listServicesSchema = {
  name: "harness_list_services",
  description: "List services in a Harness project",
  inputSchema: {
    type: "object" as const,
    properties: {
      org: { type: "string", description: "Organization identifier" },
      project: { type: "string", description: "Project identifier" },
    },
    required: ["org", "project"],
  },
};

export async function handleListServices(args: Record<string, unknown>) {
  const org = args.org as string;
  const project = args.project as string;

  const data = await harnessRequest<any>({
    path: "ng/api/servicesV2",
    params: {
      orgIdentifier: org,
      projectIdentifier: project,
      size: "50",
    },
  });

  const services = (data?.data?.content || []).map((s: any) => ({
    name: s.service?.name,
    identifier: s.service?.identifier,
    type: s.service?.serviceDefinition?.type,
    description: s.service?.description,
  }));

  return { content: [{ type: "text", text: JSON.stringify(services, null, 2) }] };
}
