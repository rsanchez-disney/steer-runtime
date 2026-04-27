#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { listSitesSchema, handleListSites } from "./tools/listSites.js";
import { listDrivesSchema, handleListDrives } from "./tools/listDrives.js";
import { listItemsSchema, handleListItems } from "./tools/listItems.js";
import { searchDocumentsSchema, handleSearchDocuments } from "./tools/searchDocuments.js";
import { getDocumentSchema, handleGetDocument } from "./tools/getDocument.js";
import { uploadDocumentSchema, handleUploadDocument } from "./tools/uploadDocument.js";

const INSTANCE_PREFIX = process.env.SHAREPOINT_INSTANCE_PREFIX || "";

function prefixName(name: string): string {
    return INSTANCE_PREFIX ? `${INSTANCE_PREFIX}${name}` : name;
}

const tools = [
    { schema: listSitesSchema, handler: handleListSites },
    { schema: listDrivesSchema, handler: handleListDrives },
    { schema: listItemsSchema, handler: handleListItems },
    { schema: searchDocumentsSchema, handler: handleSearchDocuments },
    { schema: getDocumentSchema, handler: handleGetDocument },
    { schema: uploadDocumentSchema, handler: handleUploadDocument },
];

const prefixedTools = tools.map((t) => ({
    schema: { ...t.schema, name: prefixName(t.schema.name) },
    handler: t.handler,
}));

class SharePointMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            { name: INSTANCE_PREFIX ? `sharepoint-${INSTANCE_PREFIX.replace(/_$/, "")}` : "sharepoint-mcp", version: "0.1.0" },
            { capabilities: { tools: {} } },
        );
        this.setupToolHandlers();
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: prefixedTools.map((t) => t.schema),
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                const tool = prefixedTools.find((t) => t.schema.name === name);
                if (!tool) throw new Error(`Unknown tool: ${name}`);
                return await tool.handler(args);
            } catch (error) {
                return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }] };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("SharePoint MCP server running on stdio");
    }
}

const server = new SharePointMCPServer();
server.run().catch(console.error);
