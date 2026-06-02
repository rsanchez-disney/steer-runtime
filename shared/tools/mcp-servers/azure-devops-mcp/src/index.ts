import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { listReposSchema, handleListRepos } from "./tools/listRepos.js";
import { listPRsSchema, handleListPRs } from "./tools/listPRs.js";
import { createPRSchema, handleCreatePR } from "./tools/createPR.js";
import { getFileSchema, handleGetFile } from "./tools/getFile.js";
import { listPipelinesSchema, handleListPipelines } from "./tools/listPipelines.js";
import { getPipelineRunSchema, handleGetPipelineRun } from "./tools/getPipelineRun.js";
import { queryWorkItemsSchema, handleQueryWorkItems } from "./tools/queryWorkItems.js";

const allSchemas = [
  listReposSchema, listPRsSchema, createPRSchema, getFileSchema,
  listPipelinesSchema, getPipelineRunSchema, queryWorkItemsSchema,
];

const toolHandlers: Record<string, (args: Record<string, unknown>) => Promise<any>> = {
  azdo_list_repos: handleListRepos,
  azdo_list_prs: handleListPRs,
  azdo_create_pr: handleCreatePR,
  azdo_get_file: handleGetFile,
  azdo_list_pipelines: handleListPipelines,
  azdo_get_pipeline_run: handleGetPipelineRun,
  azdo_query_work_items: handleQueryWorkItems,
};

const server = new Server(
  { name: "azure-devops-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: allSchemas }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const handler = toolHandlers[name];
  if (!handler) throw new Error(`Unknown tool: ${name}`);
  return await handler(args as Record<string, unknown>);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Azure DevOps MCP server running on stdio");
}

main().catch((error) => { console.error("Fatal:", error); process.exit(1); });
