import { apiClient } from "../utils/apiClient.js";

export const listItemsSchema = {
    name: "sharepoint_list_items",
    description: "List files and folders in a SharePoint document library path",
    inputSchema: {
        type: "object",
        properties: {
            driveId: { type: "string", description: "Drive (library) ID" },
            path: { type: "string", description: "Folder path (default: root)" },
        },
        required: ["driveId"],
    },
};

export async function handleListItems(args: any): Promise<any> {
    try {
        const { driveId, path } = args as { driveId: string; path?: string };
        const endpoint = path
            ? `/drives/${driveId}/root:/${path.split("/").map(encodeURIComponent).join("/")}:/children`
            : `/drives/${driveId}/root/children`;
        const data = await apiClient.graphRequest(endpoint);
        const items = (data.value || []).map((i: any) => {
            const type = i.folder ? "📁" : "📄";
            const size = i.size ? ` (${(i.size / 1024).toFixed(1)} KB)` : "";
            return `- ${type} **${i.name}**${size} — modified ${i.lastModifiedDateTime}`;
        });
        return { content: [{ type: "text", text: `**Contents of ${path || "/"}**\n\n${items.join("\n") || "Empty folder."}` }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
