#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { runNrqlSchema, handleRunNrql } from "./tools/runNrql.js";
import { listEntitiesSchema, handleListEntities } from "./tools/listEntities.js";
import { getEntityGoldenSignalsSchema, handleGetEntityGoldenSignals } from "./tools/getEntityGoldenSignals.js";
import { getAlertViolationsSchema, handleGetAlertViolations } from "./tools/getAlertViolations.js";
import { getDeploymentsSchema, handleGetDeployments } from "./tools/getDeployments.js";
import { apiClient } from "./utils/apiClient.js";

const tools = [
    { schema: runNrqlSchema, handler: handleRunNrql },
    { schema: listEntitiesSchema, handler: handleListEntities },
    { schema: getEntityGoldenSignalsSchema, handler: handleGetEntityGoldenSignals },
    { schema: getAlertViolationsSchema, handler: handleGetAlertViolations },
    { schema: getDeploymentsSchema, handler: handleGetDeployments },
];

class NewRelicMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            { name: "newrelic-mcp", version: "0.1.0" },
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
                if (!tool) {
                    throw new Error(`Unknown tool: ${name}`);
                }
                return await tool.handler(args);
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        });
    }

    async run() {
        // Startup validation
        try {
            await apiClient.validate();
        } catch (err) {
            console.error(`[newrelic-mcp] Startup validation failed: ${err instanceof Error ? err.message : String(err)}`);
            console.error("[newrelic-mcp] Server will start but tools may fail until config is fixed");
        }

        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("New Relic MCP server running on stdio");
    }
}

const server = new NewRelicMCPServer();
server.run().catch(console.error);
