import { getClient, parseProject } from "../utils/apiClient.js";

export const gitlabSearchProjectSchema = {
    name: "gitlab_search_project",
    description: "Search for text within a GitLab project's code",
    inputSchema: {
        type: "object",
        properties: {
            project: {
                type: "string",
                description:
                    "Project in format 'namespace/project' or full URL",
            },
            search: {
                type: "string",
                description: "Search query",
            },
            ref: {
                type: "string",
                description:
                    "Branch, tag, or commit SHA (default: project default branch)",
            },
        },
        required: ["project", "search"],
    },
};

export async function handleGitlabSearchProject(args: any) {
    const { project, search, ref } = args as {
        project: string;
        search: string;
        ref?: string;
    };

    const projectPath = parseProject(project);
    const gl = getClient();

    const results = await gl.Search.all("projects", search, {
        projectId: projectPath,
        scope: "blobs",
        ...(ref ? { ref } : {}),
    } as any);

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(results, null, 2),
            },
        ],
    };
}
