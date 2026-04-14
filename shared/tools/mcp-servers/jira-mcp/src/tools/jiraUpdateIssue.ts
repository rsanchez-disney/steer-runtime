import { JiraApiClient } from "../utils/jiraApi.js";
import { saveTicketData } from "../utils/fileUtils.js";
import {
    CUSTOM_FIELD_ALIASES,
    resolveCustomFieldIds,
} from "../utils/customFields.js";

export const jiraUpdateIssueSchema = {
    name: "jira_update_issue",
    description:
        "Update a JIRA ticket with support for custom fields and save the updated data",
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
                    "Directory to save the updated ticket data (optional)",
            },
            summary: {
                type: "string",
                description: "New ticket summary",
            },
            description: {
                type: "string",
                description: "New ticket description",
            },
            assignee: {
                type: "string",
                description: "Username of the new assignee",
            },
            epicLink: {
                type: "string",
                description:
                    'Epic ticket ID to link to (e.g., "SEWEB-46018") - will try common field IDs',
            },
            components: {
                type: "array",
                items: { type: "string" },
                description:
                    'Array of component names (e.g., ["Client Platforms & Misc"])',
            },
            labels: {
                type: "array",
                items: { type: "string" },
                description:
                    'Array of label names (e.g., ["SPORTSWEB", "olympics", "2026"])',
            },
            priority: {
                type: "string",
                description:
                    'Priority name (e.g., "1 - Critical", "2 - High", "3 - Medium", "4 - Low")',
            },
            customFields: {
                type: "object",
                description: `Custom fields as key-value pairs. Use field IDs or aliases. Example: {"studio": "ROS - BANG | Ruth", "storyPoints": 8}`,
            },
        },
        required: ["ticketId"],
    },
};

export async function handleJiraUpdateIssue(args: any): Promise<any> {
    try {
        const {
            ticketId,
            outputDir,
            summary,
            description,
            assignee,
            epicLink,
            components,
            labels,
            priority,
            customFields,
        } = args as {
            ticketId: string;
            outputDir?: string;
            summary?: string;
            description?: string;
            assignee?: string;
            epicLink?: string;
            components?: string[];
            labels?: string[];
            priority?: string;
            customFields?: Record<string, unknown>;
        };

        const apiClient = new JiraApiClient();
        const updates: any = {};
        if (summary) updates.summary = summary;
        if (description) updates.description = description;
        if (assignee) updates.assignee = { name: assignee };

        if (components && components.length > 0) {
            updates.components = components.map((name) => ({
                name,
            }));
        }

        if (labels && labels.length > 0) {
            updates.labels = labels;
        }

        if (priority) {
            updates.priority = { name: priority };
        }

        // Resolve custom field aliases and merge into updates
        if (customFields) {
            for (const [key, value] of Object.entries(customFields)) {
                const resolved = resolveCustomFieldIds([key]);
                if (resolved.length > 0) {
                    updates[resolved[0]] = value;
                }
            }
        }

        // Try different Epic Link field IDs
        if (epicLink) {
            // Try the most common Epic Link field IDs one by one
            const epicFieldIds = [
                "customfield_10014",
                "customfield_10008",
                "customfield_10006",
                "customfield_10002",
            ];

            for (const fieldId of epicFieldIds) {
                try {
                    const testUpdates = {
                        ...updates,
                        [fieldId]: epicLink,
                    };
                    console.error(`Trying Epic Link field ID: ${fieldId}`);
                    await apiClient.updateJiraTicket(ticketId, testUpdates);
                    console.error(`Success! Epic Link field ID is: ${fieldId}`);
                    break;
                } catch (error) {
                    console.error(
                        `Failed with ${fieldId}: ${error instanceof Error ? error.message : "Unknown error"}`,
                    );
                    if (fieldId === epicFieldIds[epicFieldIds.length - 1]) {
                        // Last attempt failed, proceed without Epic Link
                        console.error(
                            "All Epic Link field IDs failed, proceeding without Epic Link",
                        );
                        await apiClient.updateJiraTicket(ticketId, updates);
                    }
                }
            }
        } else {
            await apiClient.updateJiraTicket(ticketId, updates);
        }

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
                    text: `**Ticket Updated Successfully**

${summaryText}${savedInfo}`,
                },
            ],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error updating JIRA ticket: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
