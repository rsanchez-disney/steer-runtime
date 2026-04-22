import { JiraApiClient } from "../utils/jiraApi.js";

export const jiraGetChildIssuesSchema = {
    name: "jira_get_child_issues",
    description: "Get all child issues (sub-tasks, stories, etc.) of a parent JIRA ticket.",
    inputSchema: {
        type: "object",
        properties: {
            parentKey: {
                type: "string",
                description: "The parent JIRA ticket key (e.g., DPAY-1234)",
            },
            maxResults: {
                type: "number",
                description: "Maximum number of results (default: 100)",
            },
        },
        required: ["parentKey"],
    },
};

export async function handleJiraGetChildIssues(args: any): Promise<any> {
    try {
        const { parentKey, maxResults = 100 } = args as {
            parentKey: string;
            maxResults?: number;
        };
        if (!/^[A-Z][A-Z0-9_]+-\d+$/.test(parentKey)) {
            throw new Error(`Invalid JIRA key format: ${parentKey}`);
        }
        const apiClient = new JiraApiClient();
        const jql = `parent = ${parentKey} ORDER BY created ASC`;
        const result = await apiClient.searchJiraIssues(jql, maxResults, 0, [
            "issuetype",
        ]);

        const issues = result.issues || [];
        let text = `**Child Issues of ${parentKey}** (${result.total} total)\n\n`;
        issues.forEach((issue: any, i: number) => {
            const f = issue.fields || {};
            text += `**${i + 1}. ${issue.key}: ${f.summary || "(no summary)"}**\n`;
            text += `- Type: ${f.issuetype?.name || "Unknown"}\n`;
            text += `- Status: ${f.status?.name || "Unknown"}\n`;
            text += `- Assignee: ${f.assignee?.displayName || "Unassigned"}\n`;
            text += `- Priority: ${f.priority?.name || "Unknown"}\n\n`;
        });
        if (issues.length === 0) text += "No child issues found.\n";
        if (result.total > issues.length) {
            text += `\n_Showing ${issues.length} of ${result.total} children._\n`;
        }

        return { content: [{ type: "text", text }] };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
