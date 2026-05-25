import { getClient, parseProject } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
import { formatTimestamp, formatProjectId } from "../utils/formatting.js";

export const gitlabGetMrCommentsSchema = {
    name: "gitlab_get_mr_comments",
    description: "Fetch comments (notes) from a GitLab merge request",
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
            outputDir: {
                type: "string",
                description: "Optional: Directory to save comments data",
            },
        },
        required: ["project", "mrIid"],
    },
};

export async function handleGitlabGetMrComments(args: any) {
    const { project, mrIid, outputDir } = args as {
        project: string;
        mrIid: string;
        outputDir?: string | false | null;
    };

    const projectPath = parseProject(project);
    const gl = getClient();
    const iid = parseInt(mrIid);

    const notes = await gl.MergeRequestNotes.all(projectPath, iid);

    let savedInfo = "";
    if (outputDir !== false && outputDir !== null) {
        const filename = `gitlab-mr-comments-${formatProjectId(projectPath)}-${mrIid}_${formatTimestamp()}.json`;
        const filepath = await saveToFile(notes, filename, outputDir);
        savedInfo = ` and saved to ${filepath}`;
    }

    return {
        content: [
            {
                type: "text",
                text: `GitLab MR !${mrIid} comments fetched successfully${savedInfo}\n\nTotal comments: ${notes.length}`,
            },
        ],
    };
}
