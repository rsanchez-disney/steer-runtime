import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { searchEventsSchema, handleSearchEvents } from "./tools/searchEvents.js";
import { getIndexesSchema, handleGetIndexes } from "./tools/getIndexes.js";
import { getSavedSearchesSchema, handleGetSavedSearches } from "./tools/getSavedSearches.js";
import { runSavedSearchSchema, handleRunSavedSearch } from "./tools/runSavedSearch.js";
import { getJobStatusSchema, handleGetJobStatus } from "./tools/getJobStatus.js";
import { getAlertsSchema, handleGetAlerts } from "./tools/getAlerts.js";
import { getAlertDetailsSchema, handleGetAlertDetails } from "./tools/getAlertDetails.js";
import { getAlertHistorySchema, handleGetAlertHistory } from "./tools/getAlertHistory.js";
import { suppressAlertSchema, handleSuppressAlert } from "./tools/suppressAlert.js";
import { getServerInfoSchema, handleGetServerInfo } from "./tools/getServerInfo.js";
import { oneshotSearchSchema, handleOneshotSearch } from "./tools/oneshotSearch.js";
import { getSourcetypesSchema, handleGetSourcetypes } from "./tools/getSourcetypes.js";
import { getFieldsSchema, handleGetFields } from "./tools/getFields.js";
import { exportResultsSchema, handleExportResults } from "./tools/exportResults.js";
import { listDashboardsSchema, handleListDashboards } from "./tools/listDashboards.js";
import { getDashboardSchema, handleGetDashboard } from "./tools/getDashboard.js";
import { runDashboardPanelSchema, handleRunDashboardPanel } from "./tools/runDashboardPanel.js";
import { getDatamodelsSchema, handleGetDatamodels } from "./tools/getDatamodels.js";
import { getDatamodelFieldsSchema, handleGetDatamodelFields } from "./tools/getDatamodelFields.js";
import { listReportsSchema, handleListReports } from "./tools/listReports.js";
import { getReportResultsSchema, handleGetReportResults } from "./tools/getReportResults.js";
import { apiClient } from "./utils/apiClient.js";

const tools = [
    { schema: searchEventsSchema, handler: handleSearchEvents },
    { schema: oneshotSearchSchema, handler: handleOneshotSearch },
    { schema: getIndexesSchema, handler: handleGetIndexes },
    { schema: getSourcetypesSchema, handler: handleGetSourcetypes },
    { schema: getFieldsSchema, handler: handleGetFields },
    { schema: getSavedSearchesSchema, handler: handleGetSavedSearches },
    { schema: runSavedSearchSchema, handler: handleRunSavedSearch },
    { schema: getJobStatusSchema, handler: handleGetJobStatus },
    { schema: getAlertsSchema, handler: handleGetAlerts },
    { schema: getAlertDetailsSchema, handler: handleGetAlertDetails },
    { schema: getAlertHistorySchema, handler: handleGetAlertHistory },
    { schema: suppressAlertSchema, handler: handleSuppressAlert },
    { schema: exportResultsSchema, handler: handleExportResults },
    { schema: listDashboardsSchema, handler: handleListDashboards },
    { schema: getDashboardSchema, handler: handleGetDashboard },
    { schema: runDashboardPanelSchema, handler: handleRunDashboardPanel },
    { schema: getDatamodelsSchema, handler: handleGetDatamodels },
    { schema: getDatamodelFieldsSchema, handler: handleGetDatamodelFields },
    { schema: listReportsSchema, handler: handleListReports },
    { schema: getReportResultsSchema, handler: handleGetReportResults },
    { schema: getServerInfoSchema, handler: handleGetServerInfo },
];

class SplunkMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            { name: "splunk-mcp", version: "0.1.0" },
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
        try {
            await apiClient.validate();
        } catch (err) {
            console.error(`[splunk-mcp] Startup validation failed: ${err instanceof Error ? err.message : String(err)}`);
            console.error("[splunk-mcp] Server will start but tools may fail until config is fixed");
        }

        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Splunk MCP server running on stdio");
    }
}

const server = new SplunkMCPServer();
server.run().catch(console.error);
