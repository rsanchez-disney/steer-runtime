import { apiClient } from "../utils/apiClient.js";

export const getDocumentSchema = {
    name: "sharepoint_get_document",
    description: "Get metadata and content preview of a SharePoint document by drive ID and item ID",
    inputSchema: {
        type: "object",
        properties: {
            driveId: { type: "string", description: "Drive ID" },
            itemId: { type: "string", description: "Item ID" },
        },
        required: ["driveId", "itemId"],
    },
};

export async function handleGetDocument(args: any): Promise<any> {
    try {
        const { driveId, itemId } = args as { driveId: string; itemId: string };
        const meta = await apiClient.graphRequest(`/drives/${driveId}/items/${itemId}`);
        let text = `**${meta.name}**\n\n`;
        text += `- **Web URL:** ${meta.webUrl}\n`;
        text += `- **Size:** ${((meta.size || 0) / 1024).toFixed(1)} KB\n`;
        text += `- **Created:** ${meta.createdDateTime}\n`;
        text += `- **Modified:** ${meta.lastModifiedDateTime}\n`;
        text += `- **Created by:** ${meta.createdBy?.user?.displayName || "Unknown"}\n`;
        text += `- **Modified by:** ${meta.lastModifiedBy?.user?.displayName || "Unknown"}\n`;
        text += `- **MIME type:** ${meta.file?.mimeType || "folder"}\n`;
        return { content: [{ type: "text", text }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
