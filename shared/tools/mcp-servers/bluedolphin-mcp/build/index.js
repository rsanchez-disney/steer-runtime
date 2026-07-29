#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const client_js_1 = require("./client.js");
const tools_js_1 = require("./tools.js");
const server = new index_js_1.Server({ name: "bluedolphin-mcp", version: "0.1.0" }, { capabilities: { tools: {} } });
const client = new client_js_1.BlueDolphinClient({
    apiKey: process.env.BD_API_KEY || "",
    tenant: process.env.BD_TENANT || "",
    region: process.env.BD_REGION || "eu",
    useOData: process.env.BD_USE_ODATA === "true",
    odataUsername: process.env.BD_ODATA_USERNAME || "",
    odataPassword: process.env.BD_ODATA_PASSWORD || "",
});
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
    tools: tools_js_1.tools,
}));
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return (0, tools_js_1.handleToolCall)(client, name, args || {});
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("[BlueDolphin MCP] Server started");
}
main().catch((error) => {
    console.error("[BlueDolphin MCP] Fatal error:", error);
    process.exit(1);
});
