import { apiClient } from "../utils/apiClient.js";

export const listSitesSchema = {
    name: "sharepoint_list_sites",
    description: "Search for SharePoint sites by keyword",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string", description: "Search keyword for sites" },
        },
        required: ["query"],
    },
};

export async function handleListSites(args: any): Promise<any> {
    try {
        const { query } = args as { query: string };
        const data = await apiClient.graphRequest(`/sites?search=${encodeURIComponent(query)}`);
        const sites = (data.value || []).map((s: any) => `- **${s.displayName}** — ${s.webUrl} (id: ${s.id})`);
        return { content: [{ type: "text", text: `**SharePoint Sites matching "${query}"**\n\n${sites.join("\n") || "No sites found."}` }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
