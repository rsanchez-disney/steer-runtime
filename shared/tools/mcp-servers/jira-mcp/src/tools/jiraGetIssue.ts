import { JiraApiClient } from "../utils/jiraApi.js";
import { buildFormattedSummary } from "../utils/formatting.js";
import { saveTicketData } from "../utils/fileUtils.js";

export const jiraGetIssueSchema = {
    name: "jira_get_issue",
    description:
        "Fetch a JIRA ticket by ID and optionally save to output directory",
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
                    "Directory to save the ticket data (optional, defaults to .amazonq/external-data)",
            },
            fields: {
                type: "array",
                items: {
                    type: "string",
                    enum: [
                        "summary",
                        "status",
                        "assignee",
                        "priority",
                        "created",
                        "updated",
                        "description",
                        "labels",
                        "components",
                    ],
                },
                description:
                    "Optional: Fields to include in response (default: all current fields)",
            },
        },
        required: ["ticketId"],
    },
};

export async function handleJiraGetIssue(args: any): Promise<any> {
    try {
        const { ticketId, outputDir, fields } = args as {
            ticketId: string;
            outputDir?: string;
            fields?: string[];
        };

        const defaultFields = [
            "summary",
            "status",
            "assignee",
            "priority",
            "created",
            "description",
        ];
        const requestedFields = fields || defaultFields;

        const apiClient = new JiraApiClient();
        const ticket = await apiClient.fetchJiraTicket(
            ticketId,
            requestedFields,
        );
        const summary = buildFormattedSummary(ticket, requestedFields);

        const savedPath = await saveTicketData(
            outputDir,
            ticketId,
            ticket,
            summary,
            true,
        );

        const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

        return {
            content: [
                {
                    type: "text",
                    text: `${summary}${savedInfo}`,
                },
            ],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching JIRA ticket: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
