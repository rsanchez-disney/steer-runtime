#!/usr/bin/env node

import { config } from "dotenv";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { fileURLToPath } from "url";
import path from "path";

// Resolve script directory (works in both ESM and CJS bundles)
const scriptDir = (() => {
    try {
        return path.dirname(fileURLToPath(import.meta.url));
    } catch {
        return __dirname;
    }
})();

// Import tool schemas and handlers
import { githubGetPrSchema, handleGithubGetPr } from "./tools/githubGetPr.js";
import {
    githubCreatePrSchema,
    handleGithubCreatePr,
} from "./tools/githubCreatePr.js";
import {
    githubCommentOnPrSchema,
    handleGithubCommentOnPr,
} from "./tools/githubCommentOnPr.js";
import {
    githubGetPrCommentsSchema,
    handleGithubGetPrComments,
} from "./tools/githubGetPrComments.js";
import {
    githubUpdatePrSchema,
    handleGithubUpdatePr,
} from "./tools/githubUpdatePr.js";
import {
    githubGetRepoSchema,
    handleGithubGetRepo,
} from "./tools/githubGetRepo.js";
import {
    githubSearchPrsSchema,
    handleGithubSearchPrs,
} from "./tools/githubSearchPrs.js";
import {
    githubListRemotesSchema,
    handleGithubListRemotes,
} from "./tools/githubListRemotes.js";
import {
    githubGetFileSchema,
    handleGithubGetFile,
} from "./tools/githubGetFile.js";
import {
    githubGetFilesSchema,
    handleGithubGetFiles,
} from "./tools/githubGetFiles.js";

// Load environment variables from .env file in the script's directory
config({ path: path.join(scriptDir, "..", ".env") });

// Tool registry - maps tool names to their handlers
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
    github_get_pr: handleGithubGetPr,
    github_create_pr: handleGithubCreatePr,
    github_comment_on_pr: handleGithubCommentOnPr,
    github_get_pr_comments: handleGithubGetPrComments,
    github_update_pr: handleGithubUpdatePr,
    github_get_repo: handleGithubGetRepo,
    github_search_prs: handleGithubSearchPrs,
    github_list_remotes: handleGithubListRemotes,
    github_get_file: handleGithubGetFile,
    github_get_files: handleGithubGetFiles,
};

const server = new Server(
    {
        name: "github-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    },
);

// Register tool schemas
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            githubGetPrSchema,
            githubCreatePrSchema,
            githubCommentOnPrSchema,
            githubGetPrCommentsSchema,
            githubUpdatePrSchema,
            githubGetRepoSchema,
            githubSearchPrsSchema,
            githubListRemotesSchema,
            githubGetFileSchema,
            githubGetFilesSchema,
        ],
    };
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const handler = toolHandlers[name];
    if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
    }

    return await handler(args);
});

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("GitHub MCP server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
