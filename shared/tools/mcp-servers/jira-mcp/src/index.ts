
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import all tools
import {
    jiraGetIssueSchema,
    handleJiraGetIssue,
} from "./tools/jiraGetIssue.js";
import {
    jiraUpdateIssueSchema,
    handleJiraUpdateIssue,
} from "./tools/jiraUpdateIssue.js";
import {
    jiraTransitionIssueSchema,
    handleJiraTransitionIssue,
} from "./tools/jiraTransitionIssue.js";
import {
    jiraAssignIssueSchema,
    handleJiraAssignIssue,
} from "./tools/jiraAssignIssue.js";
import {
    jiraCommentOnIssueSchema,
    handleJiraCommentOnIssue,
} from "./tools/jiraCommentOnIssue.js";
import {
    jiraSearchIssuesSchema,
    handleJiraSearchIssues,
} from "./tools/jiraSearchIssues.js";
import {
    jiraCreateIssueSchema,
    handleJiraCreateIssue,
} from "./tools/jiraCreateIssue.js";
import {
    jiraGetProjectsSchema,
    handleJiraGetProjects,
} from "./tools/jiraGetProjects.js";
import {
    jiraGetIssueTypesSchema,
    handleJiraGetIssueTypes,
} from "./tools/jiraGetIssueTypes.js";
import {
    jiraGetTransitionsSchema,
    handleJiraGetTransitions,
} from "./tools/jiraGetTransitions.js";
import {
    jiraGetBoardsSchema,
    handleJiraGetBoards,
} from "./tools/jiraGetBoards.js";
import {
    jiraGetSprintsSchema,
    handleJiraGetSprints,
} from "./tools/jiraGetSprints.js";
import {
    jiraGetSprintIssuesSchema,
    handleJiraGetSprintIssues,
} from "./tools/jiraGetSprintIssues.js";

// Tool registry
const tools = [
    { schema: jiraGetIssueSchema, handler: handleJiraGetIssue },
    { schema: jiraUpdateIssueSchema, handler: handleJiraUpdateIssue },
    { schema: jiraTransitionIssueSchema, handler: handleJiraTransitionIssue },
    { schema: jiraAssignIssueSchema, handler: handleJiraAssignIssue },
    { schema: jiraCommentOnIssueSchema, handler: handleJiraCommentOnIssue },
    { schema: jiraSearchIssuesSchema, handler: handleJiraSearchIssues },
    { schema: jiraCreateIssueSchema, handler: handleJiraCreateIssue },
    { schema: jiraGetProjectsSchema, handler: handleJiraGetProjects },
    { schema: jiraGetIssueTypesSchema, handler: handleJiraGetIssueTypes },
    { schema: jiraGetTransitionsSchema, handler: handleJiraGetTransitions },
    { schema: jiraGetBoardsSchema, handler: handleJiraGetBoards },
    { schema: jiraGetSprintsSchema, handler: handleJiraGetSprints },
    { schema: jiraGetSprintIssuesSchema, handler: handleJiraGetSprintIssues },
];

class JiraMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: "jira-mcp",
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
        // Register list_tools handler
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: tools.map((t) => t.schema),
        }));

        // Register call_tool handler
        this.server.setRequestHandler(
            CallToolRequestSchema,
            async (request) => {
                const tool = tools.find(
                    (t) => t.schema.name === request.params.name,
                );
                if (!tool)
                    throw new Error(`Unknown tool: ${request.params.name}`);
                return await tool.handler(request.params.arguments);
            },
        );
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("JIRA MCP server running on stdio");
    }
}

const server = new JiraMCPServer();
server.run().catch(console.error);
