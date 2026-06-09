import { getClient, parseProject } from "../utils/apiClient.js";

export const gitlabGetPipelineBridgesSchema = {
    name: "gitlab_get_pipeline_bridges",
    description:
        "List bridge jobs (downstream pipeline triggers) for a specific pipeline",
    inputSchema: {
        type: "object",
        properties: {
            project: {
                type: "string",
                description:
                    "Project in format 'namespace/project' or full URL",
            },
            pipelineId: {
                type: "number",
                description: "Pipeline ID",
            },
            perPage: {
                type: "number",
                description: "Results per page (default: 20)",
            },
        },
        required: ["project", "pipelineId"],
    },
};

export async function handleGitlabGetPipelineBridges(args: any) {
    const {
        project,
        pipelineId,
        perPage = 20,
    } = args as {
        project: string;
        pipelineId: number;
        perPage?: number;
    };

    const projectPath = parseProject(project);
    const gl = getClient();

    const bridges = await gl.Jobs.allPipelineBridges(projectPath, pipelineId, {
        perPage,
    } as any);

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(bridges, null, 2),
            },
        ],
    };
}
