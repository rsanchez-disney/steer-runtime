import { JiraApiClient } from "../utils/jiraApi.js";
import { saveData } from "../utils/fileUtils.js";
import {
    CUSTOM_FIELD_ALIASES,
    resolveCustomFieldIds,
    getCustomFieldLabel,
    formatCustomFieldValue,
} from "../utils/customFields.js";

export const jiraSearchIssuesSchema = {
    name: "jira_search_issues",
    description:
        "Search JIRA issues using JQL (JIRA Query Language) with support for custom fields",
    inputSchema: {
        type: "object",
        properties: {
            jql: {
                type: "string",
                description:
                    'JQL query string (e.g., "project = COREWEB AND status = Open")',
            },
            maxResults: {
                type: "number",
                description:
                    "Maximum number of results to return (default: 50)",
            },
            startAt: {
                type: "number",
                description: "Starting index for pagination (default: 0)",
            },
            customFields: {
                type: "array",
                items: { type: "string" },
                description: `Optional: Array of custom field IDs to include in results (e.g., ["customfield_20001", "customfield_10803"]). You can also use aliases: ${Object.keys(CUSTOM_FIELD_ALIASES).map((a) => `"${a}"`).join(", ")}`,
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save the search results (optional, defaults to .amazonq/external-data)",
            },
        },
        required: ["jql"],
    },
};

export async function handleJiraSearchIssues(args: any): Promise<any> {
    try {
        const {
            jql,
            maxResults = 50,
            startAt = 0,
            customFields,
            outputDir,
        } = args as {
            jql: string;
            maxResults?: number;
            startAt?: number;
            customFields?: string[];
            outputDir?: string;
        };

        const resolvedCustomFields = customFields
            ? resolveCustomFieldIds(customFields)
            : [];

        const apiClient = new JiraApiClient();
        const searchResults = await apiClient.searchJiraIssues(
            jql,
            maxResults,
            startAt,
            resolvedCustomFields,
        );

        let summaryText = `**Search Results for JQL: "${jql}"**

**Total Found:** ${searchResults.total}
**Showing:** ${searchResults.issues.length} issues (starting at ${startAt})

`;

        searchResults.issues.forEach((issue: any, index: number) => {
            summaryText += `**${startAt + index + 1}. ${issue.key}: ${issue.fields.summary}**
- Status: ${issue.fields.status?.name || "Unknown"}
- Assignee: ${issue.fields.assignee?.displayName || "Unassigned"}
- Priority: ${issue.fields.priority?.name || "Unknown"}
- Type: ${issue.fields.issuetype?.name || "Unknown"}
- Project: ${issue.fields.project?.key || "Unknown"}`;

            // Append custom field values per issue
            for (const fieldId of resolvedCustomFields) {
                const label = getCustomFieldLabel(fieldId);
                const display = formatCustomFieldValue(issue.fields[fieldId]);
                summaryText += `\n- ${label}: ${display}`;
            }

            summaryText += "\n\n";
        });

        // Save the search results
        const savedPath = await saveData(
            outputDir,
            `search_${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
            {
                jql,
                maxResults,
                startAt,
                searchedAt: new Date().toISOString(),
                rawData: searchResults,
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
                    text: `Error searching JIRA issues: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
