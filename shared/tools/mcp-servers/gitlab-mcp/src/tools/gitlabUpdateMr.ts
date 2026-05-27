import { getClient, parseProject } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
import { formatTimestamp, formatProjectId } from "../utils/formatting.js";

export const gitlabUpdateMrSchema = {
    name: "gitlab_update_mr",
    description: "Update a GitLab merge request (title, description, assignees, reviewers, state)",
    inputSchema: {
        type: "object",
        properties: {
            project: {
                type: "string",
                description: "Project in format 'namespace/project' or full URL",
            },
            mrIid: {
                type: "string",
                description: "Merge request IID",
            },
            title: {
                type: "string",
                description: "New MR title",
            },
            description: {
                type: "string",
                description: "New MR description",
            },
            stateEvent: {
                type: "string",
                description: "State transition: 'close' or 'reopen'",
            },
            assigneeIds: {
                type: "array",
                items: { type: "number" },
                description: "Array of user IDs to assign",
            },
            reviewerIds: {
                type: "array",
                items: { type: "number" },
                description: "Array of user IDs to request review from",
            },
            outputDir: {
                type: "string",
                description: "Optional: Directory to save updated MR data",
            },
        },
        required: ["project", "mrIid"],
    },
};

export async function handleGitlabUpdateMr(args: any) {
    const {
        project,
        mrIid,
        title,
        description,
        stateEvent,
        assigneeIds,
        reviewerIds,
        outputDir,
    } = args as {
        project: string;
        mrIid: string;
        title?: string;
        description?: string;
        stateEvent?: string;
        assigneeIds?: number[];
        reviewerIds?: number[];
        outputDir?: string | false | null;
    };

    const projectPath = parseProject(project);
    const gl = getClient();
    const iid = parseInt(mrIid);

    const options: any = {};
    if (title) options.title = title;
    if (description) options.description = description;
    if (stateEvent) options.stateEvent = stateEvent;
    if (assigneeIds) options.assigneeIds = assigneeIds;
    if (reviewerIds) options.reviewerIds = reviewerIds;

    const mr = await gl.MergeRequests.edit(projectPath, iid, options);

    let savedInfo = "";
    if (outputDir !== false && outputDir !== null) {
        const filename = `gitlab-mr-updated-${formatProjectId(projectPath)}-${mrIid}_${formatTimestamp()}.json`;
        const filepath = await saveToFile(mr, filename, outputDir);
        savedInfo = ` and saved to ${filepath}`;
    }

    return {
        content: [
            {
                type: "text",
                text: `GitLab MR !${mrIid} updated successfully${savedInfo}\n\nTitle: ${mr.title}\nState: ${mr.state}`,
            },
        ],
    };
}
