import { apiClient } from "../utils/apiClient.js";
import { readFile } from "fs/promises";
import { resolve, isAbsolute } from "path";

export const uploadDocumentSchema = {
    name: "sharepoint_upload_document",
    description: "Upload a local file to a SharePoint document library",
    inputSchema: {
        type: "object",
        properties: {
            driveId: { type: "string", description: "Drive ID" },
            remotePath: { type: "string", description: "Destination path including filename (e.g., 'Reports/Q1.pdf')" },
            localPath: { type: "string", description: "Local file path to upload (must be relative to working directory)" },
        },
        required: ["driveId", "remotePath", "localPath"],
    },
};

export async function handleUploadDocument(args: any): Promise<any> {
    try {
        const { driveId, remotePath, localPath } = args as { driveId: string; remotePath: string; localPath: string };

        // Path validation: reject absolute paths and traversals
        if (isAbsolute(localPath) || localPath.includes("..")) {
            return { content: [{ type: "text", text: "Error: localPath must be a relative path without '..' traversals" }], isError: true };
        }
        const resolved = resolve(process.cwd(), localPath);
        if (!resolved.startsWith(process.cwd())) {
            return { content: [{ type: "text", text: "Error: localPath resolves outside working directory" }], isError: true };
        }

        const fileBuffer = await readFile(resolved);
        const encodedPath = remotePath.split("/").map(encodeURIComponent).join("/");
        const data = await apiClient.graphRequest(
            `/drives/${driveId}/root:/${encodedPath}:/content`,
            { method: "PUT", body: fileBuffer as any, headers: { "Content-Type": "application/octet-stream" } },
        );
        return { content: [{ type: "text", text: `**Uploaded successfully**\n\n- **Name:** ${data.name}\n- **URL:** ${data.webUrl}\n- **Size:** ${((data.size || 0) / 1024).toFixed(1)} KB` }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
