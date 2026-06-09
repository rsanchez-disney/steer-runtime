import { getClient, parseProject } from "../utils/apiClient.js";

export const gitlabListPipelinesSchema = {
    name: "gitlab_list_pipelines",
    description: "List recent pipelines for a GitLab project",
    inputSchema: {
        type: "object",
        properties: {
            project: {
                type: "string",
                description:
                    "Project in format 'namespace/project' or full URL",
            },
            ref: {
                type: "string",
                description: "Filter by branch or tag",
            },
            status: {
                type: "string",
                description:
                    "Filter by status: running, pending, success, failed, canceled, skipped, manual",
            },
            perPage: {
                type: "number",
                description: "Results per page (default: 20)",
            },
        },
        required: ["project"],
    },
};

export async function handleGitlabListPipelines(args: any) {
    const {
        project,
        ref,
        status,
        perPage = 20,
    } = args as {
        project: string;
        ref?: string;
        status?: string;
        perPage?: number;
    };

    const projectPath = parseProject(project);
    const gl = getClient();

    const options: any = { perPage };
    if (ref) options.ref = ref;
    if (status) options.status = status;

    const pipelines = await gl.Pipelines.all(projectPath, options);

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(pipelines, null, 2),
            },
        ],
    };
}
