import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { listApplicationsSchema, handleListApplications } from "./tools/listApplications.js";
import { getApplicationHealthSchema, handleGetApplicationHealth } from "./tools/getApplicationHealth.js";
import { getBusinessTransactionsSchema, handleGetBusinessTransactions } from "./tools/getBusinessTransactions.js";
import { getMetricDataSchema, handleGetMetricData } from "./tools/getMetricData.js";
import { getTiersSchema, handleGetTiers } from "./tools/getTiers.js";
import { getNodesSchema, handleGetNodes } from "./tools/getNodes.js";
import { getHealthViolationsSchema, handleGetHealthViolations } from "./tools/getHealthViolations.js";
import { getErrorRateSchema, handleGetErrorRate } from "./tools/getErrorRate.js";
import { getSnapshotsSchema, handleGetSnapshots } from "./tools/getSnapshots.js";
import { getAnomaliesSchema, handleGetAnomalies } from "./tools/getAnomalies.js";

const tools = [
    { schema: listApplicationsSchema, handler: handleListApplications },
    { schema: getApplicationHealthSchema, handler: handleGetApplicationHealth },
    { schema: getBusinessTransactionsSchema, handler: handleGetBusinessTransactions },
    { schema: getMetricDataSchema, handler: handleGetMetricData },
    { schema: getTiersSchema, handler: handleGetTiers },
    { schema: getNodesSchema, handler: handleGetNodes },
    { schema: getHealthViolationsSchema, handler: handleGetHealthViolations },
    { schema: getErrorRateSchema, handler: handleGetErrorRate },
    { schema: getSnapshotsSchema, handler: handleGetSnapshots },
    { schema: getAnomaliesSchema, handler: handleGetAnomalies },
];

class AppDynamicsMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            { name: "appdynamics-node-mcp", version: "0.1.0" },
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
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("AppDynamics MCP server running on stdio");
    }
}

const server = new AppDynamicsMCPServer();
server.run().catch(console.error);
