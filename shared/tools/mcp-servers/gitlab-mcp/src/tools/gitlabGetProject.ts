import { getClient, parseProject } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
import { formatTimestamp, formatProjectId } from "../utils/formatting.js";

export const gitlabGetProjectSchema = {
    name: "gitlab_get_project",
    description: "Fetch GitLab project (repository) information",
    inputSchema: {
        type: "object",
        properties: {
            project: {
                type: "string",
                description: "Project in format 'namespace/project' or full URL",
            },
            outputDir: {
                type: "string",
                description: "Optional: Directory to save project data",
            },
        },
        required: ["project"],
    },
};

export async function handleGitlabGetProject(args: any) {
    const { project, outputDir } = args as {
        project: string;
        outputDir?: string | false | null;
    };

    const projectPath = parseProject(project);
    const gl = getClient();

    const projectData = await gl.Projects.show(projectPath);

    let savedInfo = "";
    if (outputDir !== false && outputDir !== null) {
        const filename = `gitlab-project-${formatProjectId(projectPath)}_${formatTimestamp()}.json`;
        const filepath = await saveToFile(projectData, filename, outputDir);
        savedInfo = ` and saved to ${filepath}`;
    }

    return {
        content: [
            {
                type: "text",
                text: `GitLab project ${projectPath} fetched successfully${savedInfo}\n\nName: ${projectData.name}\nDescription: ${projectData.description || "(none)"}\nDefault Branch: ${projectData.default_branch}\nWeb URL: ${projectData.web_url}`,
            },
        ],
    };
}
