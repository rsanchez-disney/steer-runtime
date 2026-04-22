import { JiraApiClient } from "../utils/jiraApi.js";

export const jiraGetMyselfSchema = {
    name: "jira_get_myself",
    description:
        "Get the currently authenticated Jira user's profile (username, display name, email). Useful for resolving the internal username needed for assignee fields.",
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};

export async function handleJiraGetMyself(_args: any): Promise<any> {
    try {
        const apiClient = new JiraApiClient();
        const user = await apiClient.getMyself();

        const summaryText = `**Current Jira User**

**Username:** ${user.name}
**Display Name:** ${user.displayName}
**Email:** ${user.emailAddress || "Not available"}
**Active:** ${user.active}`;

        return {
            content: [
                {
                    type: "text",
                    text: summaryText,
                },
            ],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching current user: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
