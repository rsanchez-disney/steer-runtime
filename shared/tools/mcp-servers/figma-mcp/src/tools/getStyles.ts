import { figma } from "../utils/apiClient.js";

export const getStylesSchema = {
    name: "get_figma_styles",
    description: "Get published styles (colors, typography, effects) from a Figma file",
    inputSchema: {
        type: "object",
        properties: {
            fileKey: { type: "string", description: "Figma file key" },
        },
        required: ["fileKey"],
    },
};

export async function handleGetStyles(args: any) {
    const data = await figma.request(`/files/${args.fileKey}/styles`);
    const styles = (data.meta?.styles || []).map((s: any) =>
        `  • ${s.name} (${s.style_type}) — key: ${s.key}`
    );
    return {
        content: [{
            type: "text",
            text: styles.length ? `${styles.length} styles:\n\n${styles.join("\n")}` : "No published styles found.",
        }],
    };
}
