
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
import {
    githubCreateReviewSchema,
    handleGithubCreateReview,
} from "./tools/githubCreateReview.js";
import {
    githubGetProjectSchema,
    handleGithubGetProject,
} from "./tools/githubGetProject.js";
import {
    githubListProjectItemsSchema,
    handleGithubListProjectItems,
} from "./tools/githubListProjectItems.js";
import {
    githubCreateProjectItemSchema,
    handleGithubCreateProjectItem,
} from "./tools/githubCreateProjectItem.js";
import {
    githubUpdateProjectItemFieldSchema,
    handleGithubUpdateProjectItemField,
} from "./tools/githubUpdateProjectItemField.js";

// Load environment variables from .env file in the script's directory
config({ path: path.join(scriptDir, "..", ".env") });

// All tool schemas
const allSchemas = [
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
    githubCreateReviewSchema,
    githubGetProjectSchema,
    githubListProjectItemsSchema,
    githubCreateProjectItemSchema,
    githubUpdateProjectItemFieldSchema,
];

// Build schemas with prefixed names
const prefixedSchemas = allSchemas.map((schema) => ({
    ...schema,
    name: prefixToolName(schema.name),
}));

// Base handler map (original tool names → handlers)
const baseHandlers: Record<string, (args: any) => Promise<any>> = {
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
    github_create_review: handleGithubCreateReview,
    github_get_project: handleGithubGetProject,
    github_list_project_items: handleGithubListProjectItems,
    github_create_project_item: handleGithubCreateProjectItem,
    github_update_project_item_field: handleGithubUpdateProjectItemField,
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
    console.error("GitHub MCP server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
