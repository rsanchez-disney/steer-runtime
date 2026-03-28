import { JiraApiClient } from "../utils/jiraApi.js";
import { saveTicketData } from "../utils/fileUtils.js";

export const jiraTransitionIssueSchema = {
    name: "jira_transition_issue",
    description: "Transition a JIRA ticket to a new status",
    inputSchema: {
        type: "object",
        properties: {
            ticketId: {
                type: "string",
                description: "The JIRA ticket ID (e.g., COREWEB-1815)",
            },
            status: {
                type: "string",
                description: 'Target status name (e.g., "In Progress", "Done")',
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save the updated ticket data (optional)",
            },
        },
        required: ["ticketId", "status"],
    },
};

export async function handleJiraTransitionIssue(args: any): Promise<any> {
    try {
        const { ticketId, status, outputDir } = args as {
            ticketId: string;
            status: string;
            outputDir?: string;
        };

        const apiClient = new JiraApiClient();

        // Get available transitions
        const transitions = await apiClient.getJiraTransitions(ticketId);
        const targetTransition = transitions.transitions.find(
            (t: any) => t.name.toLowerCase() === status.toLowerCase(),
        );

        if (!targetTransition) {
            const availableStatuses = transitions.transitions
                .map((t: any) => t.name)
                .join(", ");
            throw new Error(
                `Status "${status}" not available. Available transitions: ${availableStatuses}`,
            );
        }

        await apiClient.transitionJiraTicket(ticketId, targetTransition.id);
        const ticket = await apiClient.fetchJiraTicket(ticketId);

        const summaryText = `**${ticket.key}: ${ticket.fields.summary}**

**Status:** ${ticket.fields.status?.name || "Unknown"}
**Assignee:** ${ticket.fields.assignee?.displayName || "Unassigned"}
**Priority:** ${ticket.fields.priority?.name || "Unknown"}

**Description:**
${ticket.fields.description || "No description available"}`;

        const savedPath = await saveTicketData(
            outputDir,
            ticketId,
            ticket,
            summaryText,
            false,
        );

        const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

        return {
            content: [
                {
                    type: "text",
                    text: `**Ticket Transitioned Successfully**

${summaryText}${savedInfo}`,
                },
            ],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error transitioning JIRA ticket: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
