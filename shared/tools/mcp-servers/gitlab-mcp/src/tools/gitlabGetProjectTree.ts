import { getClient, parseProject } from "../utils/apiClient.js";

export const gitlabGetProjectTreeSchema = {
    name: "gitlab_get_project_tree",
    description: "List files and directories in a GitLab project repository",
    inputSchema: {
        type: "object",
        properties: {
            project: {
                type: "string",
                description:
                    "Project in format 'namespace/project' or full URL",
            },
            path: {
                type: "string",
                description: "Directory path within the repo (default: root)",
            },
            ref: {
                type: "string",
                description:
                    "Branch, tag, or commit SHA (default: project default branch)",
            },
            recursive: {
                type: "boolean",
                description: "List recursively (default: false)",
            },
        },
        required: ["project"],
    },
};

export async function handleGitlabGetProjectTree(args: any) {
    const {
        project,
        path = "",
        ref,
        recursive = false,
    } = args as {
        project: string;
        path?: string;
        ref?: string;
        recursive?: boolean;
    };

    const projectPath = parseProject(project);
    const gl = getClient();

    const options: any = { recursive, perPage: 100 };
    if (path) options.path = path;
    if (ref) options.ref = ref;

    const tree = await gl.Repositories.allRepositoryTrees(projectPath, options);

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(tree, null, 2),
            },
        ],
    };
}
