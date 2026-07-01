
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

// New tools: issue links, user, dev status, XRay write
import {
    jiraGetDevStatusSchema,
    handleJiraGetDevStatus,
} from "./tools/jiraGetDevStatus.js";
import {
    jiraGetLinkTypesSchema,
    handleJiraGetLinkTypes,
} from "./tools/jiraGetLinkTypes.js";
import {
    jiraGetMyselfSchema,
    handleJiraGetMyself,
} from "./tools/jiraGetMyself.js";
import {
    jiraLinkIssuesSchema,
    handleJiraLinkIssues,
} from "./tools/jiraLinkIssues.js";
import {
    xrayAddTestsToTestExecSchema,
    handleXrayAddTestsToTestExec,
} from "./tools/xrayAddTestsToTestExec.js";

// Smart Checklist tools
import {
    jiraSmartChecklistGetSchema,
    handleJiraSmartChecklistGet,
    jiraSmartChecklistSetSchema,
    handleJiraSmartChecklistSet,
    jiraSmartChecklistAddItemSchema,
    handleJiraSmartChecklistAddItem,
    jiraSmartChecklistCheckItemSchema,
    handleJiraSmartChecklistCheckItem,
    jiraSmartChecklistDeleteSchema,
    handleJiraSmartChecklistDelete,
} from "./tools/jiraSmartChecklist.js";
// XRay Test Repository folder management
import {
    xrayListRepositoryFoldersSchema,
    handleXrayListRepositoryFolders,
} from "./tools/xrayListRepositoryFolders.js";
import {
    xrayCreateRepositoryFolderSchema,
    handleXrayCreateRepositoryFolder,
} from "./tools/xrayCreateRepositoryFolder.js";
import {
    xrayGetFolderTestsSchema,
    handleXrayGetFolderTests,
} from "./tools/xrayGetFolderTests.js";
import {
    xrayMoveTestsToFolderSchema,
    handleXrayMoveTestsToFolder,
} from "./tools/xrayMoveTestsToFolder.js";
import {
    xrayDeleteRepositoryFolderSchema,
    handleXrayDeleteRepositoryFolder,
} from "./tools/xrayDeleteRepositoryFolder.js";

// XRay Cloud tools
import { isXrayCloudConfigured } from "./utils/xrayCloudAuth.js";
import {
    xrayCloudCreateTestSchema,
    handleXrayCloudCreateTest,
} from "./tools/xrayCloudCreateTest.js";
import {
    xrayCloudCreateExecutionSchema,
    handleXrayCloudCreateExecution,
} from "./tools/xrayCloudCreateExecution.js";
import {
    xrayCloudUpdateRunSchema,
    handleXrayCloudUpdateRun,
} from "./tools/xrayCloudUpdateRun.js";
import {
    xrayCloudLinkTestToStorySchema,
    handleXrayCloudLinkTestToStory,
} from "./tools/xrayCloudLinkTestToStory.js";
import {
    xrayCloudGetTestStepsSchema,
    handleXrayCloudGetTestSteps,
} from "./tools/xrayCloudGetTestSteps.js";
import {
    xrayCloudGetTestRunsSchema,
    handleXrayCloudGetTestRuns,
} from "./tools/xrayCloudGetTestRuns.js";
import {
    xrayCloudSearchTestsSchema,
    handleXrayCloudSearchTests,
} from "./tools/xrayCloudSearchTests.js";
import {
    xrayCloudUpdateTestTypeSchema,
    handleXrayCloudUpdateTestType,
} from "./tools/xrayCloudUpdateTestType.js";
import {
    xrayCloudAddPreconditionSchema,
    handleXrayCloudAddPrecondition,
} from "./tools/xrayCloudAddPrecondition.js";

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
    // Issue links, user, dev status
    { schema: prefixed(jiraGetDevStatusSchema), handler: handleJiraGetDevStatus },
    { schema: prefixed(jiraGetLinkTypesSchema), handler: handleJiraGetLinkTypes },
    { schema: prefixed(jiraGetMyselfSchema), handler: handleJiraGetMyself },
    { schema: prefixed(jiraLinkIssuesSchema), handler: handleJiraLinkIssues },
    // XRay write
    { schema: prefixed(xrayAddTestsToTestExecSchema), handler: handleXrayAddTestsToTestExec },
    // Smart Checklist
    { schema: prefixed(jiraSmartChecklistGetSchema), handler: handleJiraSmartChecklistGet },
    { schema: prefixed(jiraSmartChecklistSetSchema), handler: handleJiraSmartChecklistSet },
    { schema: prefixed(jiraSmartChecklistAddItemSchema), handler: handleJiraSmartChecklistAddItem },
    { schema: prefixed(jiraSmartChecklistCheckItemSchema), handler: handleJiraSmartChecklistCheckItem },
    { schema: prefixed(jiraSmartChecklistDeleteSchema), handler: handleJiraSmartChecklistDelete },
    // XRay Test Repository folder management
    { schema: prefixed(xrayListRepositoryFoldersSchema), handler: handleXrayListRepositoryFolders },
    { schema: prefixed(xrayCreateRepositoryFolderSchema), handler: handleXrayCreateRepositoryFolder },
    { schema: prefixed(xrayGetFolderTestsSchema), handler: handleXrayGetFolderTests },
    { schema: prefixed(xrayMoveTestsToFolderSchema), handler: handleXrayMoveTestsToFolder },
    { schema: prefixed(xrayDeleteRepositoryFolderSchema), handler: handleXrayDeleteRepositoryFolder },
    // XRay Cloud tools (conditionally available when XRAY_CLOUD_CLIENT_ID is set)
    ...(isXrayCloudConfigured() ? [
        { schema: prefixed(xrayCloudCreateTestSchema), handler: handleXrayCloudCreateTest },
        { schema: prefixed(xrayCloudCreateExecutionSchema), handler: handleXrayCloudCreateExecution },
        { schema: prefixed(xrayCloudUpdateRunSchema), handler: handleXrayCloudUpdateRun },
        { schema: prefixed(xrayCloudUpdateTestTypeSchema), handler: handleXrayCloudUpdateTestType },
        { schema: prefixed(xrayCloudAddPreconditionSchema), handler: handleXrayCloudAddPrecondition },
        { schema: prefixed(xrayCloudLinkTestToStorySchema), handler: handleXrayCloudLinkTestToStory },
        { schema: prefixed(xrayCloudGetTestStepsSchema), handler: handleXrayCloudGetTestSteps },
        { schema: prefixed(xrayCloudGetTestRunsSchema), handler: handleXrayCloudGetTestRuns },
        { schema: prefixed(xrayCloudSearchTestsSchema), handler: handleXrayCloudSearchTests },
    ] : []),
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
