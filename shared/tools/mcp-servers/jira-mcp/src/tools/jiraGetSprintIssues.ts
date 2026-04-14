import { JiraApiClient } from "../utils/jiraApi.js";
import { saveData } from "../utils/fileUtils.js";

export const jiraGetSprintIssuesSchema = {
    name: "jira_get_sprint_issues",
    description: "Get issues in a specific JIRA sprint",
    inputSchema: {
        type: "object",
        properties: {
            sprintId: {
                type: "string",
                description: "Sprint ID to get issues for",
            },
            maxResults: {
                type: "number",
                description: "Maximum number of results (default: 50)",
            },
            startAt: {
                type: "number",
                description: "Starting index for pagination (default: 0)",
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save the sprint issues data (optional, defaults to .amazonq/external-data)",
            },
        },
        required: ["sprintId"],
    },
};

export async function handleJiraGetSprintIssues(args: any): Promise<any> {
    try {
        const {
            sprintId,
            maxResults = 50,
            startAt = 0,
            outputDir,
        } = args as {
            sprintId: string;
            maxResults?: number;
            startAt?: number;
            outputDir?: string;
        };

        const apiClient = new JiraApiClient();
        const sprintIssues = await apiClient.getJiraSprintIssues(
            sprintId,
            startAt,
            maxResults,
        );

        let summaryText = `**Issues in Sprint ${sprintId}**

**Total Found:** ${sprintIssues.total}
**Showing:** ${sprintIssues.issues.length} issues (starting at ${startAt})

`;

        sprintIssues.issues.forEach((issue: any, index: number) => {
            summaryText += `**${startAt + index + 1}. ${issue.key}: ${issue.fields.summary}**
- Status: ${issue.fields.status?.name || "Unknown"}
- Assignee: ${issue.fields.assignee?.displayName || "Unassigned"}
- Priority: ${issue.fields.priority?.name || "Unknown"}
- Type: ${issue.fields.issuetype?.name || "Unknown"}
- Project: ${issue.fields.project?.key || "Unknown"}

`;
        });

        // Save the sprint issues data
        const savedPath = await saveData(
            outputDir,
            `sprint_${sprintId}_issues_${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
            {
                sprintId,
                filters: { maxResults, startAt },
                fetchedAt: new Date().toISOString(),
                rawData: sprintIssues,
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
                    text: `Error fetching JIRA sprint issues: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
