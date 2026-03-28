import { JiraApiClient } from "../utils/jiraApi.js";
import { saveData } from "../utils/fileUtils.js";

export const jiraSearchIssuesSchema = {
    name: "jira_search_issues",
    description: "Search JIRA issues using JQL (JIRA Query Language)",
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
            outputDir,
        } = args as {
            jql: string;
            maxResults?: number;
            startAt?: number;
            outputDir?: string;
        };

        const apiClient = new JiraApiClient();
        const searchResults = await apiClient.searchJiraIssues(
            jql,
            maxResults,
            startAt,
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
- Project: ${issue.fields.project?.key || "Unknown"}

`;
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
