import { JiraApiClient } from "../utils/jiraApi.js";
import { saveTicketData } from "../utils/fileUtils.js";

export const jiraAssignIssueSchema = {
    name: "jira_assign_issue",
    description: "Assign a JIRA ticket to a user",
    inputSchema: {
        type: "object",
        properties: {
            ticketId: {
                type: "string",
                description: "The JIRA ticket ID (e.g., COREWEB-1815)",
            },
            assignee: {
                type: "string",
                description: "Email or username of the assignee",
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save the updated ticket data (optional)",
            },
        },
        required: ["ticketId", "assignee"],
    },
};

export async function handleJiraAssignIssue(args: any): Promise<any> {
    try {
        const { ticketId, assignee, outputDir } = args as {
            ticketId: string;
            assignee: string;
            outputDir?: string;
        };

        const apiClient = new JiraApiClient();
        const updates = { assignee: { name: assignee } };
        await apiClient.updateJiraTicket(ticketId, updates);
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
                    text: `**Ticket Assigned Successfully**

${summaryText}${savedInfo}`,
                },
            ],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error assigning JIRA ticket: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
