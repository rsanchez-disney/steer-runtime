import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayListRepositoryFoldersSchema = {
    name: "xray_list_repository_folders",
    description:
        "List all Test Repository folders for a project, including full hierarchy",
    inputSchema: {
        type: "object",
        properties: {
            projectKey: {
                type: "string",
                description: "The JIRA project key (e.g., DPAY)",
            },
        },
        required: ["projectKey"],
    },
};

function formatFolderHierarchy(folders: any[], indent: number = 0): string {
    let text = "";
    for (const folder of folders) {
        const prefix = "  ".repeat(indent);
        text += `${prefix}- ${folder.name} (id: ${folder.id})\n`;
        if (folder.folders && folder.folders.length > 0) {
            text += formatFolderHierarchy(folder.folders, indent + 1);
        }
    }
    return text;
}

export async function handleXrayListRepositoryFolders(args: any): Promise<any> {
    try {
        const { projectKey } = args as { projectKey: string };

        const apiClient = new JiraApiClient();
        const result = await apiClient.getXrayRepositoryFolders(projectKey);

        const folders = result?.folders || result || [];

        if (!Array.isArray(folders) || folders.length === 0) {
            return {
                content: [{ type: "text", text: `No Test Repository folders found for project ${projectKey}.` }],
            };
        }

        let text = `**Test Repository Folders for ${projectKey}**\n\n`;
        text += formatFolderHierarchy(folders);

        return {
            content: [{ type: "text", text }],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error listing repository folders: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
