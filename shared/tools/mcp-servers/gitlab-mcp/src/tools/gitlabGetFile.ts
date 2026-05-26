import { getClient, parseProject } from "../utils/apiClient.js";

export const gitlabGetFileSchema = {
    name: "gitlab_get_file",
    description:
        "Read a single file from a GitLab repository. Returns the decoded text content.",
    inputSchema: {
        type: "object",
        properties: {
            project: {
                type: "string",
                description: "Project in format 'namespace/project' or full URL",
            },
            path: {
                type: "string",
                description: "File path relative to repository root (e.g. 'src/index.ts')",
            },
            ref: {
                type: "string",
                description: "Optional: Branch, tag, or commit SHA. Defaults to the project's default branch",
            },
        },
        required: ["project", "path"],
    },
};

export async function handleGitlabGetFile(args: any) {
    const { project, path: filePath, ref } = args as {
        project: string;
        path: string;
        ref?: string;
    };

    const projectPath = parseProject(project);
    const gl = getClient();

    const file = await gl.RepositoryFiles.show(projectPath, filePath, ref || "HEAD");

    const decoded = Buffer.from(file.content, "base64").toString("utf-8");
    const refInfo = ref ? ` (ref: ${ref})` : "";

    return {
        content: [
            {
                type: "text",
                text: `File: ${projectPath}/${filePath}${refInfo}\nSize: ${file.size} bytes\nSHA: ${file.content_sha256}\n\n${decoded}`,
            },
        ],
    };
}
