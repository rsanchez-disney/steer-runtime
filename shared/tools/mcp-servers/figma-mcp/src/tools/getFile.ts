import { figma } from "../utils/apiClient.js";

export const getFileSchema = {
    name: "get_figma_file",
    description: "Get a Figma file's metadata, pages, and component list",
    inputSchema: {
        type: "object",
        properties: {
            fileKey: { type: "string", description: "Figma file key (from URL: figma.com/design/<fileKey>/...)" },
            depth: { type: "number", description: "Depth of node tree to return (default 2)" },
        },
        required: ["fileKey"],
    },
};

export async function handleGetFile(args: any) {
    const { fileKey, depth = 2 } = args;
    const params = depth ? `?depth=${depth}` : "";
    const data = await figma.request(`/files/${fileKey}${params}`);
    const pages = data.document?.children?.map((p: any) => ({
        id: p.id, name: p.name, type: p.type, childCount: p.children?.length || 0,
    })) || [];
    return {
        content: [{
            type: "text",
            text: `File: ${data.name}\nLast modified: ${data.lastModified}\nPages: ${pages.length}\n\n${pages.map((p: any) => `  • ${p.name} (${p.id}) — ${p.childCount} children`).join("\n")}`,
        }],
    };
}
