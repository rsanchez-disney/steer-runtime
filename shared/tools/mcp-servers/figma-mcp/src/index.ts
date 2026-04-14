#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { getFileSchema, handleGetFile } from "./tools/getFile.js";
import { getNodeSchema, handleGetNode } from "./tools/getNode.js";
import { getCommentsSchema, handleGetComments } from "./tools/getComments.js";
import { getStylesSchema, handleGetStyles } from "./tools/getStyles.js";
import { exportImagesSchema, handleExportImages } from "./tools/exportImages.js";

const tools = [
    { schema: getFileSchema, handler: handleGetFile },
    { schema: getNodeSchema, handler: handleGetNode },
    { schema: getCommentsSchema, handler: handleGetComments },
    { schema: getStylesSchema, handler: handleGetStyles },
    { schema: exportImagesSchema, handler: handleExportImages },
];

const server = new Server(
    { name: "figma-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map((t) => t.schema),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        const tool = tools.find((t) => t.schema.name === name);
        if (!tool) throw new Error(`Unknown tool: ${name}`);
        return await tool.handler(args);
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }] };
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Figma MCP server running on stdio");
}

main().catch(console.error);
