import { readFile } from "fs/promises";
import { apiClient, USER_AGENT } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";

export const uploadAttachmentSchema = {
    name: "upload_attachment",
    description: "Upload a file attachment to a Confluence page",
    inputSchema: {
        type: "object",
        properties: {
            pageId: {
                type: "string",
                description: "Page ID to attach the file to",
            },
            filePath: {
                type: "string",
                description: "Local file path to upload",
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save data (optional, defaults to .amazonq/external-data). Pass false or null to skip saving",
            },
        },
        required: ["pageId", "filePath"],
    },
};

export async function handleUploadAttachment(args: any) {
    const { pageId, filePath, outputDir } = args;

    try {
        const fileBuffer = await readFile(filePath);
        const fileName = filePath.split("/").pop() || "attachment";

        const formData = new FormData();
        const blob = new Blob([new Uint8Array(fileBuffer)]);
        formData.append("file", blob, fileName);
        formData.append("comment", "Uploaded via Confluence MCP");

        const response = await fetch(
            `${apiClient.getConfluenceUrl()}/rest/api/content/${pageId}/child/attachment`,
            {
                method: "POST",
                headers: {
                    Authorization: apiClient.getAuthHeader(),
                    "X-Atlassian-Token": "no-check",
                    "User-Agent": USER_AGENT,
                },
                body: formData,
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Confluence API error: ${response.status} - ${errorText}`,
            );
        }

        const data = await response.json();
        const filename = `attachment-${data.results[0].id}-on-page-${pageId}.json`;
        const savedFilePath = await saveToFile(data, outputDir, filename);

        const savedInfo = savedFilePath
            ? ` Data saved to: ${savedFilePath}`
            : "";

        return {
            content: [
                {
                    type: "text",
                    text: `Successfully uploaded attachment "${fileName}" to page ${pageId}. Attachment ID: ${data.results[0].id}.${savedInfo}`,
                },
            ],
        };
    } catch (error) {
        throw new Error(
            `Failed to upload attachment: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
}
