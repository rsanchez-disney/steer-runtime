import { getClient, parseProject } from "../utils/apiClient.js";

export const gitlabTriggerPipelineSchema = {
    name: "gitlab_trigger_pipeline",
    description: "⚠️ TRIGGERS A REAL PIPELINE — runs a new pipeline on the specified branch. Confirm with user before executing.",
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
                description: "Branch or tag to run pipeline on (default: main)",
            },
            variables: {
                type: "array",
                description:
                    "Pipeline variables as array of {key, value} objects",
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
        required: ["project"],
    },
};

export async function handleGitlabTriggerPipeline(args: any) {
    const {
        project,
        ref = "main",
        variables = [],
    } = args as {
        project: string;
        ref?: string;
        variables?: Array<{ key: string; value: string }>;
    };

    const projectPath = parseProject(project);
    const gl = getClient();

    const options: any = {};
    if (variables.length > 0) {
        options.variables = variables.map((v) => ({
            key: v.key,
            value: v.value,
            variable_type: "env_var",
        }));
    }

    const pipeline = await gl.Pipelines.create(projectPath, ref, options);

    return {
        content: [
            {
                type: "text",
                text: `Pipeline #${pipeline.id} created\n\nRef: ${pipeline.ref}\nStatus: ${pipeline.status}\nURL: ${pipeline.web_url}`,
            },
        ],
    };
}
