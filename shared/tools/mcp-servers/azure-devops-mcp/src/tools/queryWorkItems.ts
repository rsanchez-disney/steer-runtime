import { azdoRequest } from "../utils/apiClient.js";

export const queryWorkItemsSchema = {
  name: "azdo_query_work_items",
  description: "Query work items using WIQL (Work Item Query Language)",
  inputSchema: {
    type: "object" as const,
    properties: {
      project: { type: "string", description: "Project name" },
      wiql: { type: "string", description: "WIQL query (e.g., SELECT [System.Id] FROM WorkItems WHERE [System.State] = 'Active')" },
    },
    required: ["wiql"],
  },
};

export async function handleQueryWorkItems(args: Record<string, unknown>) {
  const wiql = args.wiql as string;
  const data = await azdoRequest<any>({
    method: "POST",
    path: "wit/wiql",
    project: args.project as string,
    body: { query: wiql },
  });

  const ids = (data.workItems || []).slice(0, 20).map((w: any) => w.id);
  if (ids.length === 0) return { content: [{ type: "text", text: "[]" }] };

  // Fetch details for the IDs
  const details = await azdoRequest<any>({
    path: `wit/workitems`,
    project: args.project as string,
    params: { ids: ids.join(","), fields: "System.Id,System.Title,System.State,System.AssignedTo,System.WorkItemType,System.CreatedDate" },
  });

  const items = (details.value || []).map((w: any) => ({
    id: w.id,
    title: w.fields?.["System.Title"],
    state: w.fields?.["System.State"],
    type: w.fields?.["System.WorkItemType"],
    assignedTo: w.fields?.["System.AssignedTo"]?.displayName,
    createdDate: w.fields?.["System.CreatedDate"],
  }));
  return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
}
