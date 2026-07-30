#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { SonarQubeClient } from "./client.js";
import { tools, handleToolCall } from "./tools.js";

const server = new Server(
  { name: "sonarqube-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

const client = new SonarQubeClient({
  url: process.env.SONARQUBE_URL || "https://sonar.cicd.wdprapps.disney.com",
  token: process.env.SONARQUBE_TOKEN || "",
  organization: process.env.SONARQUBE_ORG || undefined,
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return handleToolCall(client, name, args || {});
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[SonarQube MCP] Server started");
}

main().catch((error) => {
  console.error("[SonarQube MCP] Fatal error:", error);
  process.exit(1);
});
