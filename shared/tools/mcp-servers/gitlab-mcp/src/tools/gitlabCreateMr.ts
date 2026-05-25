import { getClient, parseProject } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
import { formatTimestamp, formatProjectId } from "../utils/formatting.js";

export const gitlabCreateMrSchema = {
    name: "gitlab_create_mr",
    description: "Create a new GitLab merge request",
    inputSchema: {
        type: "object",
        properties: {
            project: {
                type: "string",
                description: "Project in format 'namespace/project' or full URL",
            },
            title: {
                type: "string",
                description: "MR title",
            },
            sourceBranch: {
                type: "string",
                description: "Source branch name",
            },
            targetBranch: {
                type: "string",
                description: "Target branch name (default: main)",
            },
            description: {
                type: "string",
                description: "MR description",
            },
            draft: {
                type: "boolean",
                description: "Create as draft MR (default: false)",
            },
            outputDir: {
                type: "string",
                description: "Optional: Directory to save MR data",
            },
        },
        required: ["project", "title", "sourceBranch"],
    },
};

export async function handleGitlabCreateMr(args: any) {
    const {
        project,
        title,
        sourceBranch,
        targetBranch = "main",
        description,
        draft = false,
        outputDir,
    } = args as {
        project: string;
        title: string;
        sourceBranch: string;
        targetBranch?: string;
        description?: string;
        draft?: boolean;
        outputDir?: string | false | null;
    };

    const projectPath = parseProject(project);
    const gl = getClient();

    const mrTitle = draft ? `Draft: ${title}` : title;

    const mr = await gl.MergeRequests.create(
        projectPath,
        sourceBranch,
        targetBranch,
        mrTitle,
        { description },
    );

    let savedInfo = "";
    if (outputDir !== false && outputDir !== null) {
        const filename = `gitlab-mr-created-${formatProjectId(projectPath)}-${mr.iid}_${formatTimestamp()}.json`;
        const filepath = await saveToFile(mr, filename, outputDir);
        savedInfo = ` and saved to ${filepath}`;
    }

    return {
        content: [
            {
                type: "text",
                text: `GitLab MR !${mr.iid} created successfully${savedInfo}\n\nTitle: ${mr.title}\nURL: ${mr.web_url}\nBranch: ${mr.source_branch} → ${mr.target_branch}`,
            },
        ],
    };
}
