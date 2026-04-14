#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import project tools
import {
    qtestGetProjectsSchema,
    handleQtestGetProjects,
    qtestGetProjectSchema,
    handleQtestGetProject,
} from "./tools/qtestGetProjects.js";

// Import test case tools
import {
    qtestGetTestCaseSchema,
    handleQtestGetTestCase,
    qtestCreateTestCaseSchema,
    handleQtestCreateTestCase,
    qtestUpdateTestCaseSchema,
    handleQtestUpdateTestCase,
    qtestSearchTestCasesSchema,
    handleQtestSearchTestCases,
} from "./tools/qtestTestCases.js";

// Import test run tools
import {
    qtestGetTestRunSchema,
    handleQtestGetTestRun,
    qtestCreateTestRunSchema,
    handleQtestCreateTestRun,
    qtestUpdateTestRunResultSchema,
    handleQtestUpdateTestRunResult,
} from "./tools/qtestTestRuns.js";

// Import test cycle and suite tools
import {
    qtestGetTestCyclesSchema,
    handleQtestGetTestCycles,
    qtestCreateTestCycleSchema,
    handleQtestCreateTestCycle,
    qtestGetTestSuitesSchema,
    handleQtestGetTestSuites,
    qtestCreateTestSuiteSchema,
    handleQtestCreateTestSuite,
} from "./tools/qtestTestCycles.js";

// Import requirement tools
import {
    qtestGetRequirementsSchema,
    handleQtestGetRequirements,
    qtestGetRequirementSchema,
    handleQtestGetRequirement,
    qtestLinkRequirementSchema,
    handleQtestLinkRequirement,
    qtestCreateRequirementSchema,
    handleQtestCreateRequirement,
} from "./tools/qtestRequirements.js";

// Import defect tools
import {
    qtestGetDefectsSchema,
    handleQtestGetDefects,
    qtestLinkDefectSchema,
    handleQtestLinkDefect,
    qtestSubmitDefectSchema,
    handleQtestSubmitDefect,
} from "./tools/qtestDefects.js";

// Tool registry
const tools = [
    { schema: qtestGetProjectsSchema, handler: handleQtestGetProjects },
    { schema: qtestGetProjectSchema, handler: handleQtestGetProject },
    { schema: qtestGetTestCaseSchema, handler: handleQtestGetTestCase },
    { schema: qtestCreateTestCaseSchema, handler: handleQtestCreateTestCase },
    { schema: qtestUpdateTestCaseSchema, handler: handleQtestUpdateTestCase },
    { schema: qtestSearchTestCasesSchema, handler: handleQtestSearchTestCases },
    { schema: qtestGetTestRunSchema, handler: handleQtestGetTestRun },
    { schema: qtestCreateTestRunSchema, handler: handleQtestCreateTestRun },
    { schema: qtestUpdateTestRunResultSchema, handler: handleQtestUpdateTestRunResult },
    { schema: qtestGetTestCyclesSchema, handler: handleQtestGetTestCycles },
    { schema: qtestCreateTestCycleSchema, handler: handleQtestCreateTestCycle },
    { schema: qtestGetTestSuitesSchema, handler: handleQtestGetTestSuites },
    { schema: qtestCreateTestSuiteSchema, handler: handleQtestCreateTestSuite },
    { schema: qtestGetRequirementsSchema, handler: handleQtestGetRequirements },
    { schema: qtestGetRequirementSchema, handler: handleQtestGetRequirement },
    { schema: qtestLinkRequirementSchema, handler: handleQtestLinkRequirement },
    { schema: qtestCreateRequirementSchema, handler: handleQtestCreateRequirement },
    { schema: qtestGetDefectsSchema, handler: handleQtestGetDefects },
    { schema: qtestLinkDefectSchema, handler: handleQtestLinkDefect },
    { schema: qtestSubmitDefectSchema, handler: handleQtestSubmitDefect },
];

class QtestMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: "qtest-mcp",
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
        if (!process.env.QTEST_BEARER_TOKEN) {
            console.error("Error: QTEST_BEARER_TOKEN is required");
            process.exit(1);
        }
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("qTest MCP server running on stdio");
    }
}

const server = new QtestMCPServer();
server.run().catch(console.error);
