import { figma } from "../utils/apiClient.js";

export const getNodeSchema = {
    name: "get_figma_node",
    description: "Get specific nodes (frames, components) from a Figma file by their IDs",
    inputSchema: {
        type: "object",
        properties: {
            fileKey: { type: "string", description: "Figma file key" },
            nodeIds: { type: "string", description: "Comma-separated node IDs (e.g. '1:2,3:4')" },
        },
        required: ["fileKey", "nodeIds"],
    },
};

function summarizeNode(node: any, indent = ""): string {
    let out = `${indent}${node.type}: ${node.name} (${node.id})`;
    if (node.absoluteBoundingBox) {
        const b = node.absoluteBoundingBox;
        out += ` [${Math.round(b.width)}×${Math.round(b.height)}]`;
    }
    if (node.fills?.length) out += ` fills:${node.fills.length}`;
    if (node.children?.length) {
        out += `\n${node.children.map((c: any) => summarizeNode(c, indent + "  ")).join("\n")}`;
    }
    return out;
}

export async function handleGetNode(args: any) {
    const { fileKey, nodeIds } = args;
    const data = await figma.request(`/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeIds)}`);
    const nodes = Object.entries(data.nodes || {}).map(([id, val]: [string, any]) =>
        val?.document ? summarizeNode(val.document) : `${id}: not found`
    );
    return { content: [{ type: "text", text: nodes.join("\n\n") }] };
}
