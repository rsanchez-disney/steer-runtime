import { figma } from "../utils/apiClient.js";

export const getCommentsSchema = {
    name: "get_figma_comments",
    description: "Get comments on a Figma file",
    inputSchema: {
        type: "object",
        properties: {
            fileKey: { type: "string", description: "Figma file key" },
        },
        required: ["fileKey"],
    },
};

export async function handleGetComments(args: any) {
    const data = await figma.request(`/files/${args.fileKey}/comments`);
    const comments = (data.comments || []).map((c: any) =>
        `[${c.resolved_at ? "✅" : "💬"}] ${c.user?.handle || "unknown"} (${c.created_at?.slice(0, 10)}):\n  ${c.message}`
    );
    return {
        content: [{
            type: "text",
            text: comments.length ? `${comments.length} comments:\n\n${comments.join("\n\n")}` : "No comments on this file.",
        }],
    };
}
