import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayMoveTestsToFolderSchema = {
    name: "xray_move_tests_to_folder",
    description:
        "Add or remove test cases from a Test Repository folder",
    inputSchema: {
        type: "object",
        properties: {
            projectKey: {
                type: "string",
                description: "The JIRA project key (e.g., DPAY)",
            },
            folderId: {
                type: "string",
                description: "The ID of the target folder",
            },
            add: {
                type: "array",
                items: { type: "string" },
                description: 'Array of Test issue keys to add to the folder (e.g., ["DPAY-101", "DPAY-102"])',
            },
            remove: {
                type: "array",
                items: { type: "string" },
                description: 'Array of Test issue keys to remove from the folder (e.g., ["DPAY-103"])',
            },
        },
        required: ["projectKey", "folderId"],
    },
};

export async function handleXrayMoveTestsToFolder(args: any): Promise<any> {
    try {
        const { projectKey, folderId, add: rawAdd, remove: rawRemove } = args as {
            projectKey: string;
            folderId: string;
            add?: string[] | string;
            remove?: string[] | string;
        };

        // Handle case where arrays arrive as JSON strings
        const add: string[] | undefined = typeof rawAdd === "string"
            ? JSON.parse(rawAdd)
            : rawAdd;
        const remove: string[] | undefined = typeof rawRemove === "string"
            ? JSON.parse(rawRemove)
            : rawRemove;

        if ((!add || add.length === 0) && (!remove || remove.length === 0)) {
            return {
                content: [{ type: "text", text: "No test keys provided to add or remove." }],
            };
        }

        const apiClient = new JiraApiClient();
        await apiClient.moveTestsToXrayFolder(projectKey, folderId, add, remove);

        let text = `**Tests Updated in Folder ${folderId} (${projectKey})**\n\n`;
        if (add && add.length > 0) {
            text += `Added ${add.length} test(s): ${add.join(", ")}\n`;
        }
        if (remove && remove.length > 0) {
            text += `Removed ${remove.length} test(s): ${remove.join(", ")}\n`;
        }

        return {
            content: [{ type: "text", text }],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error moving tests to folder: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
