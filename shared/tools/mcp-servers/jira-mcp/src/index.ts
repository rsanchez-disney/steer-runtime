
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
import {
    jiraGetAttachmentsSchema,
    handleJiraGetAttachments,
} from "./tools/jiraGetAttachments.js";
import {
    jiraGetDevStatusSchema,
    handleJiraGetDevStatus,
} from "./tools/jiraGetDevStatus.js";
import {
    jiraLinkIssuesSchema,
    handleJiraLinkIssues,
} from "./tools/jiraLinkIssues.js";
import {
    jiraGetLinkTypesSchema,
    handleJiraGetLinkTypes,
} from "./tools/jiraGetLinkTypes.js";
import {
    jiraGetMyselfSchema,
    handleJiraGetMyself,
} from "./tools/jiraGetMyself.js";
import {
    jiraGetChildIssuesSchema,
    handleJiraGetChildIssues,
} from "./tools/jiraGetChildIssues.js";

// XRay tools
import {
    xrayGetTestCaseFullSchema,
    handleXrayGetTestCaseFull,
} from "./tools/xrayGetTestCaseFull.js";
import {
    xrayGetTestStepsSchema,
    handleXrayGetTestSteps,
} from "./tools/xrayGetTestSteps.js";
import {
    xrayGetTestExecTestsSchema,
    handleXrayGetTestExecTests,
} from "./tools/xrayGetTestExecTests.js";
import {
    xrayGetTestPlanTestsSchema,
    handleXrayGetTestPlanTests,
} from "./tools/xrayGetTestPlanTests.js";
import {
    xrayGetTestSetTestsSchema,
    handleXrayGetTestSetTests,
} from "./tools/xrayGetTestSetTests.js";
import {
    xrayGetTestRunsSchema,
    handleXrayGetTestRuns,
} from "./tools/xrayGetTestRuns.js";
import {
    xraySearchTestCasesSchema,
    handleXraySearchTestCases,
} from "./tools/xraySearchTestCases.js";
import {
    xrayGetTestStatusesSchema,
    handleXrayGetTestStatuses,
} from "./tools/xrayGetTestStatuses.js";
import {
    xrayGetTestPreConditionsSchema,
    handleXrayGetTestPreConditions,
} from "./tools/xrayGetTestPreConditions.js";
import {
    xrayGetPreConditionTestsSchema,
    handleXrayGetPreConditionTests,
} from "./tools/xrayGetPreConditionTests.js";
import {
    xrayAddTestsToTestExecSchema,
    handleXrayAddTestsToTestExec,
} from "./tools/xrayAddTestsToTestExec.js";

// Instance prefix for multi-instance support (avoids tool name collisions)
const INSTANCE_PREFIX = process.env.JIRA_INSTANCE_PREFIX || "";

function prefixed(schema: { name: string; description: string; inputSchema: unknown }) {
    if (!INSTANCE_PREFIX) return schema;
    return { ...schema, name: INSTANCE_PREFIX + schema.name };
}

// Tool registry
const tools = [
    { schema: prefixed(jiraGetIssueSchema), handler: handleJiraGetIssue },
    { schema: prefixed(jiraUpdateIssueSchema), handler: handleJiraUpdateIssue },
    { schema: prefixed(jiraTransitionIssueSchema), handler: handleJiraTransitionIssue },
    { schema: prefixed(jiraAssignIssueSchema), handler: handleJiraAssignIssue },
    { schema: prefixed(jiraCommentOnIssueSchema), handler: handleJiraCommentOnIssue },
    { schema: prefixed(jiraSearchIssuesSchema), handler: handleJiraSearchIssues },
    { schema: prefixed(jiraCreateIssueSchema), handler: handleJiraCreateIssue },
    { schema: prefixed(jiraGetProjectsSchema), handler: handleJiraGetProjects },
    { schema: prefixed(jiraGetIssueTypesSchema), handler: handleJiraGetIssueTypes },
    { schema: prefixed(jiraGetTransitionsSchema), handler: handleJiraGetTransitions },
    { schema: prefixed(jiraGetBoardsSchema), handler: handleJiraGetBoards },
    { schema: prefixed(jiraGetSprintsSchema), handler: handleJiraGetSprints },
    { schema: prefixed(jiraGetSprintIssuesSchema), handler: handleJiraGetSprintIssues },
    { schema: prefixed(jiraGetAttachmentsSchema), handler: handleJiraGetAttachments },
    { schema: prefixed(jiraGetChildIssuesSchema), handler: handleJiraGetChildIssues },
    { schema: prefixed(jiraGetDevStatusSchema), handler: handleJiraGetDevStatus },
    { schema: prefixed(jiraLinkIssuesSchema), handler: handleJiraLinkIssues },
    { schema: prefixed(jiraGetLinkTypesSchema), handler: handleJiraGetLinkTypes },
    { schema: prefixed(jiraGetMyselfSchema), handler: handleJiraGetMyself },
    // XRay tools
    { schema: prefixed(xrayGetTestCaseFullSchema), handler: handleXrayGetTestCaseFull },
    { schema: prefixed(xrayGetTestStepsSchema), handler: handleXrayGetTestSteps },
    { schema: prefixed(xrayGetTestExecTestsSchema), handler: handleXrayGetTestExecTests },
    { schema: prefixed(xrayGetTestPlanTestsSchema), handler: handleXrayGetTestPlanTests },
    { schema: prefixed(xrayGetTestSetTestsSchema), handler: handleXrayGetTestSetTests },
    { schema: prefixed(xrayGetTestRunsSchema), handler: handleXrayGetTestRuns },
    { schema: prefixed(xraySearchTestCasesSchema), handler: handleXraySearchTestCases },
    { schema: prefixed(xrayGetTestStatusesSchema), handler: handleXrayGetTestStatuses },
    { schema: prefixed(xrayGetTestPreConditionsSchema), handler: handleXrayGetTestPreConditions },
    { schema: prefixed(xrayGetPreConditionTestsSchema), handler: handleXrayGetPreConditionTests },
    { schema: prefixed(xrayAddTestsToTestExecSchema), handler: handleXrayAddTestsToTestExec },
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
