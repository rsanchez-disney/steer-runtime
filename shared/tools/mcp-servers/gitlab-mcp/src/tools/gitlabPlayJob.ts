import { getClient, parseProject } from "../utils/apiClient.js";

export const gitlabPlayJobSchema = {
    name: "gitlab_play_job",
    description:
        "Trigger a manual job in a GitLab pipeline (jobs with 'when: manual')",
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
                description: "Job ID to trigger",
            },
            variables: {
                type: "array",
                description: "Job variables as array of {key, value} objects",
                items: {
                    type: "object",
                    properties: {
                        key: { type: "string" },
                        value: { type: "string" },
                    },
                    required: ["key", "value"],
                },
            },
        },
        required: ["project", "jobId"],
    },
};

export async function handleGitlabPlayJob(args: any) {
    const {
        project,
        jobId,
        variables = [],
    } = args as {
        project: string;
        jobId: number;
        variables?: Array<{ key: string; value: string }>;
    };

    const projectPath = parseProject(project);
    const gl = getClient();

    const options: any = {};
    if (variables.length > 0) {
        options.jobVariablesAttributes = variables.map((v) => ({
            key: v.key,
            value: v.value,
            variable_type: "env_var",
        }));
    }

    const job = await gl.Jobs.play(projectPath, jobId, options);

    return {
        content: [
            {
                type: "text",
                text: `Job #${jobId} triggered\n\nName: ${job.name}\nStatus: ${job.status}\nPipeline: ${job.pipeline?.id ?? "N/A"}`,
            },
        ],
    };
}
