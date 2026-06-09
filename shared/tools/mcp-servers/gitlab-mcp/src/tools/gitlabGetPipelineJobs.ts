import { getClient, parseProject } from "../utils/apiClient.js";

export const gitlabGetPipelineJobsSchema = {
    name: "gitlab_get_pipeline_jobs",
    description: "List jobs for a specific pipeline",
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
            scope: {
                type: "string",
                description:
                    "Filter by status: created, pending, running, failed, success, canceled, skipped, manual",
            },
            perPage: {
                type: "number",
                description: "Results per page (default: 100)",
            },
        },
        required: ["project", "pipelineId"],
    },
};

export async function handleGitlabGetPipelineJobs(args: any) {
    const {
        project,
        pipelineId,
        scope,
        perPage = 100,
    } = args as {
        project: string;
        pipelineId: number;
        scope?: string;
        perPage?: number;
    };

    const projectPath = parseProject(project);
    const gl = getClient();

    const options: any = { perPage };
    if (scope) options.scope = [scope];

    const jobs = await gl.Jobs.all(projectPath, {
        pipelineId,
        ...options,
    });

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(jobs, null, 2),
            },
        ],
    };
}
