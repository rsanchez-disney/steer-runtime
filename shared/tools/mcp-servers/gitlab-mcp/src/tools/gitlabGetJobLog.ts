import { getClient, parseProject } from "../utils/apiClient.js";

export const gitlabGetJobLogSchema = {
    name: "gitlab_get_job_log",
    description: "Get the log/trace output of a specific job",
    inputSchema: {
        type: "object",
        properties: {
            project: {
                type: "string",
                description:
                    "Project in format 'namespace/project' or full URL",
            },
            jobId: {
                type: "number",
                description: "Job ID",
            },
        },
        required: ["project", "jobId"],
    },
};

export async function handleGitlabGetJobLog(args: any) {
    const { project, jobId } = args as {
        project: string;
        jobId: number;
    };

    const projectPath = parseProject(project);
    const gl = getClient();

    const log = (await gl.Jobs.showLog(projectPath, jobId)) as string;

    return {
        content: [
            {
                type: "text",
                text: log,
            },
        ],
    };
}
