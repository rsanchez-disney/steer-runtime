import { getClient, parseProject } from "../utils/apiClient.js";

export const gitlabGetPipelineSchema = {
    name: "gitlab_get_pipeline",
    description: "Get details of a specific pipeline",
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
        },
        required: ["project", "pipelineId"],
    },
};

export async function handleGitlabGetPipeline(args: any) {
    const { project, pipelineId } = args as {
        project: string;
        pipelineId: number;
    };

    const projectPath = parseProject(project);
    const gl = getClient();

    const pipeline = await gl.Pipelines.show(projectPath, pipelineId);

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(pipeline, null, 2),
            },
        ],
    };
}
