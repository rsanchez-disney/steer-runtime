import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { nrqlQuerySchema, handleNrqlQuery } from "./tools/nrqlQuery.js";
import { getCrashRateSchema, handleGetCrashRate } from "./tools/getCrashRate.js";
import { getTopCrashesSchema, handleGetTopCrashes } from "./tools/getTopCrashes.js";
import { getAdoptionRateSchema, handleGetAdoptionRate } from "./tools/getAdoptionRate.js";
import { getDashboardSchema, handleGetDashboard } from "./tools/getDashboard.js";
import { apiClient } from "./utils/apiClient.js";

const tools = [
    { schema: nrqlQuerySchema, handler: handleNrqlQuery },
    { schema: getCrashRateSchema, handler: handleGetCrashRate },
    { schema: getTopCrashesSchema, handler: handleGetTopCrashes },
    { schema: getAdoptionRateSchema, handler: handleGetAdoptionRate },
    { schema: getDashboardSchema, handler: handleGetDashboard },
];

class NewRelicMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            { name: "newrelic-node-mcp", version: "0.1.0" },
            { capabilities: { tools: {} } },
        );
        this.setupToolHandlers();
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: tools.map((t) => t.schema),
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                const tool = tools.find((t) => t.schema.name === name);
                if (!tool) throw new Error(`Unknown tool: ${name}`);
                return await tool.handler(args);
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                    }],
                };
            }
        });
    }

    async run() {
        try {
            await apiClient.validate();
        } catch (err) {
            console.error(`[newrelic-mcp] Validation failed: ${err instanceof Error ? err.message : String(err)}`);
            console.error("[newrelic-mcp] Server will start but tools may fail until config is fixed");
        }
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("New Relic MCP server running on stdio");
    }
}

new NewRelicMCPServer().run().catch(console.error);
