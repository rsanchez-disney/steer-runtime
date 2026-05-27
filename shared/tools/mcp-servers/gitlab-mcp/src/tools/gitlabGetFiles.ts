import { getClient, parseProject } from "../utils/apiClient.js";

export const gitlabGetFilesSchema = {
    name: "gitlab_get_files",
    description:
        "Read multiple files from a GitLab repository in a single call. Returns decoded text content for each file.",
    inputSchema: {
        type: "object",
        properties: {
            project: {
                type: "string",
                description: "Project in format 'namespace/project' or full URL",
            },
            paths: {
                type: "array",
                items: { type: "string" },
                description: "Array of file paths relative to repository root",
            },
            ref: {
                type: "string",
                description: "Optional: Branch, tag, or commit SHA. Defaults to the project's default branch",
            },
        },
        required: ["project", "paths"],
    },
};

export async function handleGitlabGetFiles(args: any) {
    const { project, paths, ref } = args as {
        project: string;
        paths: string[];
        ref?: string;
    };

    const projectPath = parseProject(project);
    const gl = getClient();
    const refInfo = ref ? ` (ref: ${ref})` : "";

    const results = await Promise.allSettled(
        paths.map(async (filePath) => {
            const file = await gl.RepositoryFiles.show(projectPath, filePath, ref || "HEAD");
            const decoded = Buffer.from(file.content, "base64").toString("utf-8");
            return {
                path: filePath,
                size: file.size,
                sha: file.content_sha256,
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
        } else {
            successCount++;
            const val = result.value;
            sections.push(
                `--- ${val.path} (${val.size} bytes, sha: ${val.sha}) ---\n${val.content}`,
            );
        }
    }

    const summary = `Fetched ${successCount}/${paths.length} files from ${projectPath}${refInfo}${errorCount > 0 ? ` (${errorCount} errors)` : ""}`;

    return {
        content: [
            {
                type: "text",
                text: `${summary}\n\n${sections.join("\n\n")}`,
            },
        ],
    };
}
