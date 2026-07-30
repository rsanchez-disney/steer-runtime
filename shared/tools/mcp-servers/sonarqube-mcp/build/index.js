#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const client_js_1 = require("./client.js");
const tools_js_1 = require("./tools.js");
const server = new index_js_1.Server({ name: "sonarqube-mcp", version: "0.1.0" }, { capabilities: { tools: {} } });
const client = new client_js_1.SonarQubeClient({
    url: process.env.SONARQUBE_URL || "https://sonar.cicd.wdprapps.disney.com",
    token: process.env.SONARQUBE_TOKEN || "",
    organization: process.env.SONARQUBE_ORG || undefined,
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
    console.error("[SonarQube MCP] Server started");
}
main().catch((error) => {
    console.error("[SonarQube MCP] Fatal error:", error);
    process.exit(1);
});
