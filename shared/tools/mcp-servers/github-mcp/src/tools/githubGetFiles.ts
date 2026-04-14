import { getClient, parseRepo } from "../utils/apiClient.js";

export const githubGetFilesSchema = {
    name: "github_get_files",
    description:
        "Read multiple files from a GitHub repository in a single call. Returns decoded text content for each file. Useful for loading several source files as context at once.",
    inputSchema: {
        type: "object",
        properties: {
            repo: {
                type: "string",
                description: "Repository in format 'owner/repo' or full URL",
            },
            paths: {
                type: "array",
                items: { type: "string" },
                description:
                    "Array of file paths relative to repository root (e.g. ['src/index.ts', 'README.md'])",
            },
            ref: {
                type: "string",
                description:
                    "Optional: Branch, tag, or commit SHA. Defaults to the repo's default branch",
            },
        },
        required: ["repo", "paths"],
    },
};

export async function handleGithubGetFiles(args: any) {
    const {
        repo,
        paths,
        ref,
    } = args as {
        repo: string;
        paths: string[];
        ref?: string;
    };

    const { owner,
        repo: repoName,
    } = parseRepo(repo);
    const octokit = getClient();
    const refInfo = ref ? ` (ref: ${ref})` : "";

    const results = await Promise.allSettled(
        paths.map(async (filePath) => {
            const params: {
                owner: string;
                repo: string;
                path: string;
                ref?: string;
            } = { owner, repo: repoName, path: filePath };
            if (ref) params.ref = ref;

            const { data } = await octokit.repos.getContent(params);

            if (Array.isArray(data)) {
                return { path: filePath, error: "Path is a directory" };
            }
            if (data.type !== "file" || !("content" in data)) {
                return {
                    path: filePath,
                    error: `Not a regular file (type: ${data.type})`,
                };
            }

            const decoded = Buffer.from(data.content, "base64").toString(
                "utf-8",
            );
            return {
                path: filePath,
                size: data.size,
                sha: data.sha,
                content: decoded,
            };
        }),
    );

    const sections: string[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const result of results) {
        if (result.status === "rejected") {
            errorCount++;
            sections.push(`--- ERROR ---\n${result.reason}`);
            continue;
        }
        const val = result.value;
        if ("error" in val) {
            errorCount++;
            sections.push(
                `--- ${val.path} ---\nError: ${val.error}`,
            );
        } else {
            successCount++;
            sections.push(
                `--- ${val.path} (${val.size} bytes, sha: ${val.sha}) ---\n${val.content}`,
            );
        }
    }

    const summary = `Fetched ${successCount}/${paths.length} files from ${owner}/${repoName}${refInfo}${errorCount > 0 ? ` (${errorCount} errors)` : ""}`;

    return {
        content: [
            {
                type: "text",
                text: `${summary}\n\n${sections.join("\n\n")}`,
            },
        ],
    };
}
