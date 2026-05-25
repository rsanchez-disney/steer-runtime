import { getClient, parseProject } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
import { formatTimestamp, formatProjectId } from "../utils/formatting.js";

export const gitlabSearchMrsSchema = {
    name: "gitlab_search_mrs",
    description: "Search merge requests in a GitLab project",
    inputSchema: {
        type: "object",
        properties: {
            project: {
                type: "string",
                description:
                    "Project in format 'namespace/project' or full URL",
            },
            state: {
                type: "string",
                description:
                    "Filter by state: 'opened', 'closed', 'merged', 'all' (default: 'opened')",
            },
            labels: {
                type: "string",
                description:
                    "Comma-separated list of label names to filter by (e.g. 'bug,critical'). Use 'None' for unlabeled, 'Any' for any label.",
            },
            sourceBranch: {
                type: "string",
                description: "Filter by source branch",
            },
            targetBranch: {
                type: "string",
                description: "Filter by target branch",
            },
            orderBy: {
                type: "string",
                description:
                    "Order by: 'created_at', 'updated_at' (default: 'created_at')",
            },
            sort: {
                type: "string",
                description:
                    "Sort direction: 'asc' or 'desc' (default: 'desc')",
            },
            outputDir: {
                type: "string",
                description: "Optional: Directory to save search results",
            },
        },
        required: ["project"],
    },
};

export async function handleGitlabSearchMrs(args: any) {
    const {
        project,
        state = "opened",
        labels,
        sourceBranch,
        targetBranch,
        orderBy = "created_at",
        sort = "desc",
        outputDir,
    } = args as {
        project: string;
        state?: string;
        labels?: string;
        sourceBranch?: string;
        targetBranch?: string;
        orderBy?: string;
        sort?: string;
        outputDir?: string | false | null;
    };

    const projectPath = parseProject(project);
    const gl = getClient();

    const options: any = { state, orderBy, sort };
    if (labels) options.labels = labels;
    if (sourceBranch) options.sourceBranch = sourceBranch;
    if (targetBranch) options.targetBranch = targetBranch;

    const mrs = await gl.MergeRequests.all({
        projectId: projectPath,
        ...options,
    });

    let savedInfo = "";
    if (outputDir !== false && outputDir !== null) {
        const filename = `gitlab-mrs-search-${formatProjectId(projectPath)}_${formatTimestamp()}.json`;
        const filepath = await saveToFile(mrs, filename, outputDir);
        savedInfo = ` and saved to ${filepath}`;
    }

    return {
        content: [
            {
                type: "text",
                text: `GitLab MRs search completed successfully${savedInfo}\n\nTotal MRs found: ${mrs.length}\nState: ${state}`,
            },
        ],
    };
}
