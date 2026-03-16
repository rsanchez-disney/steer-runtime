import { JiraApiClient } from "../utils/jiraApi.js";
import { saveData } from "../utils/fileUtils.js";

export const jiraGetTransitionsSchema = {
    name: "jira_get_transitions",
    description: "Get available transitions for a JIRA issue",
    inputSchema: {
        type: "object",
        properties: {
            ticketId: {
                type: "string",
                description: "The JIRA ticket ID (e.g., COREWEB-1815)",
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save the transitions data (optional, defaults to .amazonq/external-data)",
            },
        },
        required: ["ticketId"],
    },
};

export async function handleJiraGetTransitions(args: any): Promise<any> {
    try {
        const { ticketId, outputDir } = args as {
            ticketId: string;
            outputDir?: string;
        };

        const apiClient = new JiraApiClient();
        const transitions = await apiClient.getJiraTransitions(ticketId);

        let summaryText = `**Available Transitions for ${ticketId}**

**Total Transitions:** ${transitions.transitions.length}

`;

        transitions.transitions.forEach((transition: any, index: number) => {
            summaryText += `**${index + 1}. ${transition.name}**
- ID: ${transition.id}
- To Status: ${transition.to?.name || "Unknown"}

`;
        });

        // Save the transitions data
        const savedPath = await saveData(
            outputDir,
            `${ticketId}_transitions_${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
            {
                ticketId,
                fetchedAt: new Date().toISOString(),
                rawData: transitions,
                formattedSummary: summaryText,
            },
            true,
        );

        const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

        return {
            content: [
                {
                    type: "text",
                    text: `${summaryText}${savedInfo}`,
                },
            ],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching JIRA transitions: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
