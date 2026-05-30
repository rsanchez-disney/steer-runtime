import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { listPipelinesSchema, handleListPipelines } from "./tools/listPipelines.js";
import { listExecutionsSchema, handleListExecutions } from "./tools/listExecutions.js";
import { getExecutionSchema, handleGetExecution } from "./tools/getExecution.js";
import { getLogsSchema, handleGetLogs } from "./tools/getLogs.js";
import { triggerPipelineSchema, handleTriggerPipeline } from "./tools/triggerPipeline.js";
import { listServicesSchema, handleListServices } from "./tools/listServices.js";
import { listEnvironmentsSchema, handleListEnvironments } from "./tools/listEnvironments.js";

const allSchemas = [
  listPipelinesSchema,
  listExecutionsSchema,
  getExecutionSchema,
  getLogsSchema,
  triggerPipelineSchema,
  listServicesSchema,
  listEnvironmentsSchema,
];

const toolHandlers: Record<string, (args: Record<string, unknown>) => Promise<any>> = {
  harness_list_pipelines: handleListPipelines,
  harness_list_executions: handleListExecutions,
  harness_get_execution: handleGetExecution,
  harness_get_logs: handleGetLogs,
  harness_trigger_pipeline: handleTriggerPipeline,
  harness_list_services: handleListServices,
  harness_list_environments: handleListEnvironments,
};

const server = new Server(
  { name: "harness-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allSchemas,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const handler = toolHandlers[name];
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return await handler(args as Record<string, unknown>);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Harness MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
