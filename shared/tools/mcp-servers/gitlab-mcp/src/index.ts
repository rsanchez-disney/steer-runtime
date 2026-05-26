import { config } from "dotenv";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { fileURLToPath } from "url";
import path from "path";
import { prefixToolName, getServerName } from "./utils/toolPrefix.js";

const scriptDir = (() => {
    try {
        return path.dirname(fileURLToPath(import.meta.url));
    } catch {
        return __dirname;
    }
})();

// Import tool schemas and handlers
import { gitlabGetProjectSchema, handleGitlabGetProject } from "./tools/gitlabGetProject.js";
import { gitlabGetMrSchema, handleGitlabGetMr } from "./tools/gitlabGetMr.js";
import { gitlabCreateMrSchema, handleGitlabCreateMr } from "./tools/gitlabCreateMr.js";
import { gitlabUpdateMrSchema, handleGitlabUpdateMr } from "./tools/gitlabUpdateMr.js";
import { gitlabCommentOnMrSchema, handleGitlabCommentOnMr } from "./tools/gitlabCommentOnMr.js";
import { gitlabGetMrCommentsSchema, handleGitlabGetMrComments } from "./tools/gitlabGetMrComments.js";
import { gitlabSearchMrsSchema, handleGitlabSearchMrs } from "./tools/gitlabSearchMrs.js";
import { gitlabGetFileSchema, handleGitlabGetFile } from "./tools/gitlabGetFile.js";
import { gitlabGetFilesSchema, handleGitlabGetFiles } from "./tools/gitlabGetFiles.js";
import { gitlabCreateReviewSchema, handleGitlabCreateReview } from "./tools/gitlabCreateReview.js";
import { gitlabListRemotesSchema, handleGitlabListRemotes } from "./tools/gitlabListRemotes.js";

// Load environment variables from .env file in the script's directory
config({ path: path.join(scriptDir, "..", ".env") });

// All tool schemas
const allSchemas = [
    gitlabGetProjectSchema,
    gitlabGetMrSchema,
    gitlabCreateMrSchema,
    gitlabUpdateMrSchema,
    gitlabCommentOnMrSchema,
    gitlabGetMrCommentsSchema,
    gitlabSearchMrsSchema,
    gitlabGetFileSchema,
    gitlabGetFilesSchema,
    gitlabCreateReviewSchema,
    gitlabListRemotesSchema,
];

// Build schemas with prefixed names
const prefixedSchemas = allSchemas.map((schema) => ({
    ...schema,
    name: prefixToolName(schema.name),
}));

// Base handler map (original tool names -> handlers)
const baseHandlers: Record<string, (args: any) => Promise<any>> = {
    gitlab_get_project: handleGitlabGetProject,
    gitlab_get_mr: handleGitlabGetMr,
    gitlab_create_mr: handleGitlabCreateMr,
    gitlab_update_mr: handleGitlabUpdateMr,
    gitlab_comment_on_mr: handleGitlabCommentOnMr,
    gitlab_get_mr_comments: handleGitlabGetMrComments,
    gitlab_search_mrs: handleGitlabSearchMrs,
    gitlab_get_file: handleGitlabGetFile,
    gitlab_get_files: handleGitlabGetFiles,
    gitlab_create_review: handleGitlabCreateReview,
    gitlab_list_remotes: handleGitlabListRemotes,
};

// Build handler map with prefixed keys
const toolHandlers: Record<string, (args: any) => Promise<any>> = {};
for (const [name, handler] of Object.entries(baseHandlers)) {
    toolHandlers[prefixToolName(name)] = handler;
}

const server = new Server(
    {
        name: getServerName(),
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    },
);

// Register tool schemas (prefixed)
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: prefixedSchemas,
    };
});

// Register tool call handler (uses prefixed keys)
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
    console.error("GitLab MCP server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
