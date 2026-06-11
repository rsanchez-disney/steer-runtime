import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayCreateRepositoryFolderSchema = {
    name: "xray_create_repository_folder",
    description:
        "Create a new folder in the XRay Test Repository under a parent folder",
    inputSchema: {
        type: "object",
        properties: {
            projectKey: {
                type: "string",
                description: "The JIRA project key (e.g., DPAY)",
            },
            parentFolderId: {
                type: "string",
                description: "The ID of the parent folder to create under",
            },
            name: {
                type: "string",
                description: "The name of the new folder",
            },
        },
        required: ["projectKey", "parentFolderId", "name"],
    },
};

export async function handleXrayCreateRepositoryFolder(args: any): Promise<any> {
    try {
        const { projectKey, parentFolderId, name } = args as {
            projectKey: string;
            parentFolderId: string;
            name: string;
        };

        const apiClient = new JiraApiClient();
        const result = await apiClient.createXrayRepositoryFolder(projectKey, parentFolderId, name);

        let text = `**Folder Created in ${projectKey}**\n\n`;
        text += `- Name: ${name}\n`;
        text += `- Parent Folder ID: ${parentFolderId}\n`;
        if (result?.id) {
            text += `- New Folder ID: ${result.id}\n`;
        }

        return {
            content: [{ type: "text", text }],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error creating repository folder: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
