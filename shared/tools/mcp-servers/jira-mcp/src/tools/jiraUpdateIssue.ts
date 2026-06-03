import { JiraApiClient } from "../utils/jiraApi.js";
import { saveTicketData } from "../utils/fileUtils.js";
import {
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
            reporter: {
                type: "string",
                description: "Username of the reporter",
            },
            storyPoints: {
                type: "number",
                description: "Story points estimate",
            },
            fixVersions: {
                type: "array",
                items: { type: "string" },
                description:
                    'Array of fix version names (e.g., ["Hong Kong CPO", "v2.0"]). Replaces existing fix versions.',
            },
            addFixVersions: {
                type: "array",
                items: { type: "string" },
                description:
                    "Array of fix version names to ADD (keeps existing versions)",
            },
            removeFixVersions: {
                type: "array",
                items: { type: "string" },
                description: "Array of fix version names to REMOVE",
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
            reporter,
            storyPoints,
            fixVersions,
            addFixVersions,
            removeFixVersions,
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
            reporter?: string;
            storyPoints?: number;
            fixVersions?: string[];
            addFixVersions?: string[];
            removeFixVersions?: string[];
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

        if (reporter) {
            updates.reporter = apiClient.auth.isCloud() ? { accountId: reporter } : { name: reporter };
        }

        if (storyPoints !== undefined) {
            const spResolved = resolveCustomFieldIds(["storyPoints"]);
            if (spResolved.length > 0) {
                updates[spResolved[0]] = storyPoints;
            }
        }

        // Resolve custom field aliases and merge into updates
        if (customFields) {
            // Native Jira fields that bypass custom field resolution
            const NATIVE_FIELDS: Record<string, string> = {
                fixversions: "fixVersions",
                duedate: "duedate",
            };

            for (const [key, value] of Object.entries(customFields)) {
                if (storyPoints !== undefined && key.toLowerCase() === "storypoints") continue;
                const nativeField = NATIVE_FIELDS[key.toLowerCase()];
                if (nativeField) {
                    updates[nativeField] = value;
                    continue;
                }
                const resolved = resolveCustomFieldIds([key]);
                if (resolved.length > 0) {
                    updates[resolved[0]] = value;
                }
            }
        }

        // Fix versions: replace mode (fields.fixVersions)
        if (fixVersions && fixVersions.length > 0) {
            updates.fixVersions = fixVersions.map((name) => ({ name }));
        }

        // Fix versions: add/remove mode (update.fixVersions)
        const updateOps: any = {};
        if (addFixVersions || removeFixVersions) {
            updateOps.fixVersions = [];
            if (addFixVersions) {
                addFixVersions.forEach((name) => {
                    updateOps.fixVersions.push({ add: { name } });
                });
            }
            if (removeFixVersions) {
                removeFixVersions.forEach((name) => {
                    updateOps.fixVersions.push({ remove: { name } });
                });
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

            let epicSet = false;
            for (const fieldId of epicFieldIds) {
                try {
                    const testUpdates = {
                        ...updates,
                        [fieldId]: epicLink,
                    };
                    console.error(`Trying Epic Link field ID: ${fieldId}`);
                    await apiClient.updateJiraTicket(ticketId, testUpdates, updateOps);
                    console.error(`Success! Epic Link field ID is: ${fieldId}`);
                    epicSet = true;
                    break;
                } catch (error) {
                    console.error(
                        `Failed with ${fieldId}: ${error instanceof Error ? error.message : "Unknown error"}`,
                    );
                }
            }

            // Fallback: use Agile API to assign to epic (bypasses screen schemes)
            if (!epicSet) {
                try {
                    console.error(`Trying Agile API fallback for epic link...`);
                    await apiClient.assignIssuesToEpic(epicLink, [ticketId]);
                    console.error(`Success! Epic link set via Agile API: ${ticketId} → ${epicLink}`);
                    epicSet = true;
                } catch (agileErr) {
                    console.error(`Agile API fallback also failed: ${agileErr instanceof Error ? agileErr.message : "Unknown error"}`);
                }
            }

            // Apply remaining updates without epic link field
            if (!epicSet) {
                console.error("All Epic Link methods failed, proceeding without Epic Link");
                if (Object.keys(updates).length > 0 || Object.keys(updateOps).length > 0) {
                    await apiClient.updateJiraTicket(ticketId, updates, updateOps);
                }
            }
        } else {
            await apiClient.updateJiraTicket(ticketId, updates, updateOps);
        }

        const ticket = await apiClient.fetchJiraTicket(ticketId);

        const summaryText = `**${ticket.key}: ${ticket.fields.summary}**

**Status:** ${ticket.fields.status?.name || "Unknown"}
**Assignee:** ${ticket.fields.assignee?.displayName || "Unassigned"}
**Reporter:** ${ticket.fields.reporter?.displayName || "Unknown"}
**Priority:** ${ticket.fields.priority?.name || "Unknown"}
**Story Points:** ${(ticket.fields as any)[resolveCustomFieldIds(["storyPoints"])[0]] ?? "Not set"}

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
