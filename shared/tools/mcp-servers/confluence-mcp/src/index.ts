
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { prefixToolName, getServerName } from "./utils/toolPrefix.js";

// Import all tools
import {
    getConfluencePageSchema,
    handleGetConfluencePage,
} from "./tools/getConfluencePage.js";
import {
    searchConfluencePagesSchema,
    handleSearchConfluencePages,
} from "./tools/searchConfluencePages.js";
import {
    getConfluenceSpaceSchema,
    handleGetConfluenceSpace,
} from "./tools/getConfluenceSpace.js";
import {
    listConfluenceSpacesSchema,
    handleListConfluenceSpaces,
} from "./tools/listConfluenceSpaces.js";
import {
    createConfluencePageSchema,
    handleCreateConfluencePage,
} from "./tools/createConfluencePage.js";
import {
    updateConfluencePageSchema,
    handleUpdateConfluencePage,
} from "./tools/updateConfluencePage.js";
import {
    commentOnConfluencePageSchema,
    handleCommentOnConfluencePage,
} from "./tools/commentOnConfluencePage.js";
import {
    uploadAttachmentSchema,
    handleUploadAttachment,
} from "./tools/uploadAttachment.js";

// Tool registry
const tools = [
    { schema: getConfluencePageSchema, handler: handleGetConfluencePage },
    {
        schema: searchConfluencePagesSchema,
        handler: handleSearchConfluencePages,
    },
    { schema: getConfluenceSpaceSchema, handler: handleGetConfluenceSpace },
    { schema: listConfluenceSpacesSchema, handler: handleListConfluenceSpaces },
    { schema: createConfluencePageSchema, handler: handleCreateConfluencePage },
    { schema: updateConfluencePageSchema, handler: handleUpdateConfluencePage },
    {
        schema: commentOnConfluencePageSchema,
        handler: handleCommentOnConfluencePage,
    },
    { schema: uploadAttachmentSchema, handler: handleUploadAttachment },
];

// Build prefixed schemas and handler map
const prefixedTools = tools.map((t) => ({
    schema: { ...t.schema, name: prefixToolName(t.schema.name) },
    handler: t.handler,
}));

class ConfluenceMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: getServerName(),
                version: "0.1.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            },
        );

        this.setupToolHandlers();
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: prefixedTools.map((t) => t.schema),
        }));

        this.server.setRequestHandler(
            CallToolRequestSchema,
            async (request) => {
                const { name, arguments: args } = request.params;

                try {
                    const tool = prefixedTools.find((t) => t.schema.name === name);
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
            },
        );
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Confluence MCP server running on stdio");
    }
}

const server = new ConfluenceMCPServer();
server.run().catch(console.error);
