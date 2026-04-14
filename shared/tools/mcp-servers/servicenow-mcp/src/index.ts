import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { getIncidentSchema, handleGetIncident } from "./tools/getIncident.js";
import { addWorkNoteSchema, handleAddWorkNote } from "./tools/addWorkNote.js";
import { changeCiSchema, handleChangeCi } from "./tools/changeCi.js";
import { changeAssignmentGroupSchema, handleChangeAssignmentGroup } from "./tools/changeAssignmentGroup.js";
import { addParentIncidentSchema, handleAddParentIncident } from "./tools/addParentIncident.js";
import { resolveIncidentSchema, handleResolveIncident } from "./tools/resolveIncident.js";
import { updateIncidentSchema, handleUpdateIncident } from "./tools/updateIncident.js";
import { queryIncidentsSchema, handleQueryIncidents } from "./tools/queryIncidents.js";
import { createIncidentSchema, handleCreateIncident } from "./tools/createIncident.js";
import { createProblemSchema, handleCreateProblem } from "./tools/createProblem.js";
import { createChangeRequestSchema, handleCreateChangeRequest } from "./tools/createChangeRequest.js";
import { getCtaskSchema, handleGetCtask } from "./tools/getCtask.js";
import { addCtaskWorkNoteSchema, handleAddCtaskWorkNote } from "./tools/addCtaskWorkNote.js";
import { updateCtaskSchema, handleUpdateCtask } from "./tools/updateCtask.js";
import { closeCtaskSchema, handleCloseCtask } from "./tools/closeCtask.js";
import { apiClient } from "./utils/apiClient.js";

const tools = [
    { schema: getIncidentSchema, handler: handleGetIncident },
    { schema: addWorkNoteSchema, handler: handleAddWorkNote },
    { schema: changeCiSchema, handler: handleChangeCi },
    { schema: changeAssignmentGroupSchema, handler: handleChangeAssignmentGroup },
    { schema: addParentIncidentSchema, handler: handleAddParentIncident },
    { schema: resolveIncidentSchema, handler: handleResolveIncident },
    { schema: updateIncidentSchema, handler: handleUpdateIncident },
    { schema: queryIncidentsSchema, handler: handleQueryIncidents },
    { schema: createIncidentSchema, handler: handleCreateIncident },
    { schema: createProblemSchema, handler: handleCreateProblem },
    { schema: createChangeRequestSchema, handler: handleCreateChangeRequest },
    { schema: getCtaskSchema, handler: handleGetCtask },
    { schema: addCtaskWorkNoteSchema, handler: handleAddCtaskWorkNote },
    { schema: updateCtaskSchema, handler: handleUpdateCtask },
    { schema: closeCtaskSchema, handler: handleCloseCtask },
];

class ServiceNowMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            { name: "servicenow-node-mcp", version: "0.1.0" },
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
            console.error(`[servicenow-mcp] Startup validation failed: ${err instanceof Error ? err.message : String(err)}`);
            console.error("[servicenow-mcp] Server will start but tools may fail until config is fixed");
        }

        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("ServiceNow MCP server running on stdio");
    }
}

const server = new ServiceNowMCPServer();
server.run().catch(console.error);
