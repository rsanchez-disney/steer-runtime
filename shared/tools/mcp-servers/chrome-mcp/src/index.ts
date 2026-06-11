#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { navigateSchema, handleNavigate } from "./tools/navigate.js";
import { screenshotSchema, handleScreenshot } from "./tools/screenshot.js";
import { clickSchema, handleClick } from "./tools/click.js";
import { typeSchema, handleType } from "./tools/type.js";
import { getTextSchema, handleGetText } from "./tools/getText.js";
import { getDomSchema, handleGetDom } from "./tools/getDom.js";
import { evaluateSchema, handleEvaluate } from "./tools/evaluate.js";
import { waitForSelectorSchema, handleWaitForSelector } from "./tools/waitForSelector.js";
import { startRecordingSchema, handleStartRecording } from "./tools/startRecording.js";
import { stopRecordingSchema, handleStopRecording } from "./tools/stopRecording.js";
import { closeBrowser } from "./utils/browser.js";

const tools = [
    { schema: navigateSchema, handler: handleNavigate },
    { schema: screenshotSchema, handler: handleScreenshot },
    { schema: clickSchema, handler: handleClick },
    { schema: typeSchema, handler: handleType },
    { schema: getTextSchema, handler: handleGetText },
    { schema: getDomSchema, handler: handleGetDom },
    { schema: evaluateSchema, handler: handleEvaluate },
    { schema: waitForSelectorSchema, handler: handleWaitForSelector },
    { schema: startRecordingSchema, handler: handleStartRecording },
    { schema: stopRecordingSchema, handler: handleStopRecording },
];

class ChromeMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            { name: "chrome-mcp", version: "0.1.0" },
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
            const tool = tools.find((t) => t.schema.name === name);
            if (!tool) throw new Error(`Unknown tool: ${name}`);
            return await tool.handler(args);
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Chrome MCP server running on stdio");

        process.on("SIGINT", async () => { await closeBrowser(); process.exit(0); });
        process.on("SIGTERM", async () => { await closeBrowser(); process.exit(0); });
        process.on("uncaughtException", async (err) => {
            console.error("Uncaught exception:", err);
            await closeBrowser();
            process.exit(1);
        });
    }
}

const server = new ChromeMCPServer();
server.run().catch(console.error);
