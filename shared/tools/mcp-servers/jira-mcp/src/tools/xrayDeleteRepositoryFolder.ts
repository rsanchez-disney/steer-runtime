import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayDeleteRepositoryFolderSchema = {
    name: "xray_delete_repository_folder",
    description:
        "Delete a folder from the XRay Test Repository",
    inputSchema: {
        type: "object",
        properties: {
            projectKey: {
                type: "string",
                description: "The JIRA project key (e.g., DPAY)",
            },
            folderId: {
                type: "string",
                description: "The ID of the folder to delete",
            },
        },
        required: ["projectKey", "folderId"],
    },
};

export async function handleXrayDeleteRepositoryFolder(args: any): Promise<any> {
    try {
        const { projectKey, folderId } = args as {
            projectKey: string;
            folderId: string;
        };

        const apiClient = new JiraApiClient();
        await apiClient.deleteXrayRepositoryFolder(projectKey, folderId);

        return {
            content: [{
                type: "text",
                text: `**Folder Deleted**\n\nSuccessfully deleted folder ${folderId} from project ${projectKey}.`,
            }],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error deleting repository folder: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
