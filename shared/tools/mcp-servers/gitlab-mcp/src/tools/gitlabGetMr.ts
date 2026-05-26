import { getClient, parseProject } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
import { formatTimestamp, formatProjectId } from "../utils/formatting.js";

export const gitlabGetMrSchema = {
    name: "gitlab_get_mr",
    description: "Fetch a GitLab merge request by project and MR IID",
    inputSchema: {
        type: "object",
        properties: {
            project: {
                type: "string",
                description: "Project in format 'namespace/project' or full URL",
            },
            mrIid: {
                type: "string",
                description: "Merge request IID (internal ID)",
            },
            outputDir: {
                type: "string",
                description: "Optional: Directory to save MR data",
            },
        },
        required: ["project", "mrIid"],
    },
};

export async function handleGitlabGetMr(args: any) {
    const { project, mrIid, outputDir } = args as {
        project: string;
        mrIid: string;
        outputDir?: string | false | null;
    };

    const projectPath = parseProject(project);
    const gl = getClient();
    const iid = parseInt(mrIid);

    const mr = await gl.MergeRequests.show(projectPath, iid);

    let savedInfo = "";
    if (outputDir !== false && outputDir !== null) {
        const filename = `gitlab-mr-${formatProjectId(projectPath)}-${mrIid}_${formatTimestamp()}.json`;
        const filepath = await saveToFile(mr, filename, outputDir);
        savedInfo = ` and saved to ${filepath}`;
    }

    return {
        content: [
            {
                type: "text",
                text: `GitLab MR !${mrIid} fetched successfully${savedInfo}\n\nTitle: ${mr.title}\nState: ${mr.state}\nAuthor: ${mr.author?.username}\nBranch: ${mr.source_branch} \u2192 ${mr.target_branch}\nURL: ${mr.web_url}`,
            },
        ],
    };
}
