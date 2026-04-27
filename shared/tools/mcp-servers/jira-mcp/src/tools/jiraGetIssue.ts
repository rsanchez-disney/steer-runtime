import { JiraApiClient } from "../utils/jiraApi.js";
import { buildFormattedSummary } from "../utils/formatting.js";
import { saveTicketData } from "../utils/fileUtils.js";
import {
    CUSTOM_FIELD_ALIASES,
    BUG_DEFECT_FIELDS,
    resolveCustomFieldIds,
    getCustomFieldLabel,
    formatCustomFieldValue,
} from "../utils/customFields.js";

export const jiraGetIssueSchema = {
    name: "jira_get_issue",
    description:
        "Fetch a JIRA ticket by ID with support for custom fields. Optionally save to output directory.",
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
                        "priority",
                        "created",
                        "updated",
                        "description",
                        "labels",
                        "components",
                        "customfield_10003",
                        "customfield_20104",
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
            "priority",
            "created",
            "description",
            "issuetype",
        ];
        const requestedFields = fields
            ? [...new Set([...fields, "issuetype"])]
            : defaultFields;

        // Resolve custom field aliases → real IDs and merge into the field list
        const resolvedCustomFields = customFields
            ? resolveCustomFieldIds(customFields)
            : [];

        // First fetch: always include issuetype so we can detect Bug/Defect
        const initialFields = [...new Set([...requestedFields, ...resolvedCustomFields])];

        const apiClient = new JiraApiClient();
        const ticket = await apiClient.fetchJiraTicket(ticketId, initialFields);

        // Auto-inject bug/defect fields if the issue type is Bug or Defect
        const issueTypeName = ticket.fields.issuetype?.name?.toLowerCase() ?? "";
        const isBugOrDefect = issueTypeName === "bug" || issueTypeName === "defect";

        let bugFieldValues: { stepsToReproduce: string; expectedResults: string; actualResults: string } | null = null;

        if (isBugOrDefect) {
            // Check if bug fields were already fetched (user may have requested them explicitly)
            const missingBugFields = BUG_DEFECT_FIELDS.filter(
                (f) => !initialFields.includes(f),
            );

            if (missingBugFields.length > 0) {
                // Re-fetch with bug fields included
                const allFieldsWithBug = [...new Set([...initialFields, ...BUG_DEFECT_FIELDS])];
                const bugTicket = await apiClient.fetchJiraTicket(ticketId, allFieldsWithBug);
                // Merge bug fields into the original ticket
                for (const fieldId of BUG_DEFECT_FIELDS) {
                    (ticket.fields as any)[fieldId] = (bugTicket.fields as any)[fieldId];
                }
            }

            bugFieldValues = {
                stepsToReproduce: formatCustomFieldValue((ticket.fields as any)["customfield_11005"]),
                expectedResults: formatCustomFieldValue((ticket.fields as any)["customfield_11006"]),
                actualResults: formatCustomFieldValue((ticket.fields as any)["customfield_11007"]),
            };

            // Add bug fields to resolvedCustomFields for display (avoid duplicates)
            for (const f of BUG_DEFECT_FIELDS) {
                if (!resolvedCustomFields.includes(f)) {
                    resolvedCustomFields.push(f);
                }
            }
        }

        // Build the standard summary
        const summary = buildFormattedSummary(ticket, requestedFields);

        // For Bug/Defect: insert the bug-specific section before custom fields
        let bugSection = "";
        if (isBugOrDefect && bugFieldValues) {
            const lines: string[] = [
                "",
                "---",
                "**🐛 Bug / Defect Details:**",
                "",
                `**Steps to Reproduce:**\n${bugFieldValues.stepsToReproduce}`,
                "",
                `**Expected Results:**\n${bugFieldValues.expectedResults}`,
                "",
                `**Actual Results:**\n${bugFieldValues.actualResults}`,
                "---",
            ];
            bugSection = lines.join("\n");
        }

        // Append remaining custom field values (excluding bug fields already shown)
        let customFieldSection = "";
        const nonBugCustomFields = resolvedCustomFields.filter(
            (f) => !BUG_DEFECT_FIELDS.includes(f),
        );
        if (nonBugCustomFields.length > 0) {
            const lines: string[] = ["", "**Custom Fields:**"];
            for (const fieldId of nonBugCustomFields) {
                const label = getCustomFieldLabel(fieldId);
                const rawValue = (ticket.fields as any)[fieldId];
                const display = formatCustomFieldValue(rawValue);
                lines.push(`**${label}:** ${display}`);
            }
            customFieldSection = lines.join("\n");
        }

        const fullSummary = `${summary}${bugSection}${customFieldSection}`;

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
