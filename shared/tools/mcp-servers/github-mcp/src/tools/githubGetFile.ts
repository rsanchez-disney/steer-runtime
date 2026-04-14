import { getClient, parseRepo } from "../utils/apiClient.js";

export const githubGetFileSchema = {
    name: "github_get_file",
    description:
        "Read a single file from a GitHub repository. Returns the decoded text content. Useful for reading source code, configs, docs, etc. as context.",
    inputSchema: {
        type: "object",
        properties: {
            repo: {
                type: "string",
                description: "Repository in format 'owner/repo' or full URL",
            },
            path: {
                type: "string",
                description:
                    "File path relative to repository root (e.g. 'src/index.ts', 'README.md')",
            },
            ref: {
                type: "string",
                description:
                    "Optional: Branch, tag, or commit SHA. Defaults to the repo's default branch",
            },
        },
        required: ["repo", "path"],
    },
};

export async function handleGithubGetFile(args: any) {
    const {
        repo,
        path: filePath,
        ref,
    } = args as {
        repo: string;
        path: string;
        ref?: string;
    };

    const { owner,
        repo: repoName,
    } = parseRepo(repo);
    const octokit = getClient();

    const params: { owner: string; repo: string; path: string; ref?: string } =
        { owner, repo: repoName, path: filePath };
    if (ref) params.ref = ref;

    const { data } = await octokit.repos.getContent(params);

    if (Array.isArray(data)) {
        // Path points to a directory — list its entries instead
        const entries = data.map((e: any) => `${e.type === "dir" ? "📁" : "📄"} ${e.path}`);
        return {
            content: [
                {
                    type: "text",
                    text: `Path '${filePath}' is a directory with ${entries.length} entries:\n\n${entries.join("\n")}`,
                },
            ],
        };
    }

    if (data.type !== "file" || !("content" in data)) {
        return {
            content: [
                {
                    type: "text",
                    text: `Path '${filePath}' is not a regular file (type: ${data.type}).`,
                },
            ],
            isError: true,
        };
    }

    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    const refInfo = ref ? ` (ref: ${ref})` : "";

    return {
        content: [
            {
                type: "text",
                text: `File: ${owner}/${repoName}/${filePath}${refInfo}\nSize: ${data.size} bytes\nSHA: ${data.sha}\n\n${decoded}`,
            },
        ],
    };
}
