import { JiraApiClient } from "../utils/jiraApi.js";
import { buildFormattedSummary } from "../utils/formatting.js";
import { saveTicketData } from "../utils/fileUtils.js";
import { ticketCard } from "../utils/uiWidgets.js";
import {
    CUSTOM_FIELD_ALIASES,
    resolveCustomFieldIds,
    getCustomFieldLabel,
    formatCustomFieldValue,
} from "../utils/customFields.js";

export const jiraGetIssueSchema = {
    name: "jira_get_issue",
    description:
        "Fetch a JIRA ticket by ID with support for custom fields. Issue links (e.g., blocks, split from, depends on) are included by default. Optionally save to output directory.",
    inputSchema: {
        type: "object",
        properties: {
            ticketId: {
                type: "string",
                description: "The JIRA ticket ID (e.g., ROS-1815)",
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
                        "reporter",
                        "priority",
                        "created",
                        "updated",
                        "description",
                        "comment",
                        "labels",
                        "components",
                        "issuelinks",
                        "storyPoints",
                        "customfield_10003",
                    ],
                },
                description:
                    "Optional: Fields to include in response (default: all current fields)",
            },
            customFields: {
                type: "array",
                items: { type: "string" },
                description: `Optional: Array of custom field IDs to fetch (e.g., ["customfield_20001", "customfield_10803"]). You can also use aliases: ${Object.keys(CUSTOM_FIELD_ALIASES).map((a) => `"${a}"`).join(", ")}`,
            },
        },
        required: ["ticketId"],
    },
};

export async function handleJiraGetIssue(args: any): Promise<any> {
    try {
        const { ticketId, outputDir, fields, customFields } = args as {
            ticketId: string;
            outputDir?: string;
            fields?: string[];
            customFields?: string[];
        };

        const defaultFields = [
            "summary",
            "status",
            "assignee",
            "reporter",
            "priority",
            "created",
            "description",
            "comment",
            "issuelinks",
            "storyPoints",
        ];
        const requestedFields = fields || defaultFields;

        // Resolve storyPoints alias in requested fields
        const expandedFields = requestedFields.map(f =>
            f === "storyPoints" ? "customfield_10004" : f
        );

        // Resolve custom field aliases → real IDs and merge into the field list
        const resolvedCustomFields = customFields
            ? resolveCustomFieldIds(customFields)
            : [];
        const allFields = [...new Set([...expandedFields, ...resolvedCustomFields])];

        const apiClient = new JiraApiClient();
        const ticket = await apiClient.fetchJiraTicket(ticketId, allFields);

        // Build the standard summary
        const summary = buildFormattedSummary(ticket, requestedFields);

        // Append custom field values
        let customFieldSection = "";
        if (resolvedCustomFields.length > 0) {
            const lines: string[] = ["", "**Custom Fields:**"];
            for (const fieldId of resolvedCustomFields) {
                const label = getCustomFieldLabel(fieldId);
                const rawValue = (ticket.fields as any)[fieldId];
                const display = formatCustomFieldValue(rawValue);
                lines.push(`**${label}:** ${display}`);
            }
            customFieldSection = lines.join("\n");
        }

        const fullSummary = `${summary}${customFieldSection}`;

        const savedPath = await saveTicketData(
            outputDir,
            ticketId,
            ticket,
            fullSummary,
            true,
        );

        const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

        return {
            content: [
                {
                    type: "text",
                    text: `${fullSummary}${savedInfo}`,
                },
                {
                    type: "resource",
                    resource: {
                        uri: `ui://jira-mcp/ticket/${ticketId}`,
                        mimeType: "text/html;profile=mcp-app",
                        text: ticketCard({
                            key: ticketId,
                            summary: (ticket as any).fields?.summary || '',
                            status: (ticket as any).fields?.status?.name || 'Unknown',
                            assignee: (ticket as any).fields?.assignee?.displayName,
                            priority: (ticket as any).fields?.priority?.name,
                            type: (ticket as any).fields?.issuetype?.name,
                            description: (ticket as any).fields?.description,
                            labels: (ticket as any).fields?.labels,
                            created: (ticket as any).fields?.created?.slice(0, 10),
                            updated: (ticket as any).fields?.updated?.slice(0, 10),
                            storyPoints: (ticket as any).fields?.story_points || (ticket as any).fields?.customfield_10028,
                        }),
                    },
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
