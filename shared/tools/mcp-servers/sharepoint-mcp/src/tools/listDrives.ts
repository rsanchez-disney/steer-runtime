import { apiClient } from "../utils/apiClient.js";

export const listDrivesSchema = {
    name: "sharepoint_list_drives",
    description: "List document libraries (drives) for the configured SharePoint site",
    inputSchema: {
        type: "object",
        properties: {
            siteId: { type: "string", description: "Site ID (optional, uses configured site if omitted)" },
        },
    },
};

export async function handleListDrives(args: any): Promise<any> {
    try {
        const siteId = (args as any).siteId || await apiClient.getSiteId();
        const data = await apiClient.graphRequest(`/sites/${siteId}/drives`);
        const drives = (data.value || []).map((d: any) => `- **${d.name}** — ${d.webUrl} (id: ${d.id})`);
        return { content: [{ type: "text", text: `**Document Libraries**\n\n${drives.join("\n") || "No libraries found."}` }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
