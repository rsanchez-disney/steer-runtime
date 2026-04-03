import { figma } from "../utils/apiClient.js";

export const exportImagesSchema = {
    name: "export_figma_images",
    description: "Export nodes as images (PNG, SVG, JPG, PDF) and return download URLs",
    inputSchema: {
        type: "object",
        properties: {
            fileKey: { type: "string", description: "Figma file key" },
            nodeIds: { type: "string", description: "Comma-separated node IDs to export" },
            format: { type: "string", enum: ["png", "svg", "jpg", "pdf"], description: "Image format (default: png)" },
            scale: { type: "number", description: "Export scale 0.01–4 (default: 2)" },
        },
        required: ["fileKey", "nodeIds"],
    },
};

export async function handleExportImages(args: any) {
    const { fileKey, nodeIds, format = "png", scale = 2 } = args;
    const params = `ids=${encodeURIComponent(nodeIds)}&format=${format}&scale=${scale}`;
    const data = await figma.request(`/images/${fileKey}?${params}`);
    const images = Object.entries(data.images || {}).map(([id, url]) => `  ${id}: ${url}`);
    return {
        content: [{
            type: "text",
            text: images.length ? `Exported ${images.length} images (${format} @${scale}x):\n\n${images.join("\n")}` : "No images exported.",
        }],
    };
}
