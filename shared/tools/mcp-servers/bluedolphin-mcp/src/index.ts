#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { BlueDolphinClient } from "./client.js";
import { tools, handleToolCall } from "./tools.js";

const server = new Server(
  { name: "bluedolphin-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

const client = new BlueDolphinClient({
  apiKey: process.env.BD_API_KEY || "",
  tenant: process.env.BD_TENANT || "",
  region: (process.env.BD_REGION as "eu" | "us") || "eu",
  useOData: process.env.BD_USE_ODATA === "true",
  odataUsername: process.env.BD_ODATA_USERNAME || "",
  odataPassword: process.env.BD_ODATA_PASSWORD || "",
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
  console.error("[BlueDolphin MCP] Server started");
}

main().catch((error) => {
  console.error("[BlueDolphin MCP] Fatal error:", error);
  process.exit(1);
});
