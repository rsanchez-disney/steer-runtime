import { getClient, parseProject } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
import { formatTimestamp, formatProjectId } from "../utils/formatting.js";

export const gitlabCommentOnMrSchema = {
    name: "gitlab_comment_on_mr",
    description: "Add a comment (note) to a GitLab merge request",
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
            body: {
                type: "string",
                description: "Comment text",
            },
            outputDir: {
                type: "string",
                description: "Optional: Directory to save comment data",
            },
        },
        required: ["project", "mrIid", "body"],
    },
};

export async function handleGitlabCommentOnMr(args: any) {
    const { project, mrIid, body, outputDir } = args as {
        project: string;
        mrIid: string;
        body: string;
        outputDir?: string | false | null;
    };

    const projectPath = parseProject(project);
    const gl = getClient();
    const iid = parseInt(mrIid);

    const note = await gl.MergeRequestNotes.create(projectPath, iid, body);

    let savedInfo = "";
    if (outputDir !== false && outputDir !== null) {
        const filename = `gitlab-mr-comment-${formatProjectId(projectPath)}-${mrIid}-${note.id}_${formatTimestamp()}.json`;
        const filepath = await saveToFile(note, filename, outputDir);
        savedInfo = ` and saved to ${filepath}`;
    }

    return {
        content: [
            {
                type: "text",
                text: `Comment added to GitLab MR !${mrIid} successfully${savedInfo}\n\nNote ID: ${note.id}`,
            },
        ],
    };
}
