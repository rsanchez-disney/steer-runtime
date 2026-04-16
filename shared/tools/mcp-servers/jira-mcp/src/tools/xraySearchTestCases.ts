import { JiraApiClient } from "../utils/jiraApi.js";

export const xraySearchTestCasesSchema = {
    name: "xray_search_test_cases",
    description:
        "Search for XRay Test Cases using JQL. Automatically adds issuetype=Test filter. Returns test cases with full Jira fields including priority, status, labels, components, assignee, and all custom/XRay fields.",
    inputSchema: {
        type: "object",
        properties: {
            jql: {
                type: "string",
                description:
                    'JQL query to filter test cases. The issuetype=Test filter is added automatically. Example: "project = DPAY AND status = Open"',
            },
            maxResults: {
                type: "number",
                description: "Maximum number of results (default: 50)",
            },
            startAt: {
                type: "number",
                description: "Starting index for pagination (default: 0)",
            },
        },
        required: ["jql"],
    },
};

export async function handleXraySearchTestCases(args: any): Promise<any> {
    try {
        const { jql, maxResults = 50, startAt = 0 } = args as {
            jql: string;
            maxResults?: number;
            startAt?: number;
        };

        // Append issuetype = Test if not already present
        const hasIssueType = /issuetype\s*[=!]/i.test(jql);
        const fullJql = hasIssueType
            ? jql
            : `issuetype = Test AND (${jql})`;

        const apiClient = new JiraApiClient();

        const extraFields = [
            "labels",
            "components",
            "fixVersions",
            "reporter",
            "description",
        ];

        const result = await apiClient.searchJiraIssues(
            fullJql,
            maxResults,
            startAt,
            extraFields,
        );

        const issues = result.issues || [];

        if (issues.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No test cases found for JQL: ${fullJql}`,
                    },
                ],
            };
        }

        let text = `**XRay Test Cases** (${issues.length} of ${result.total} total)\n`;
        text += `JQL: \`${fullJql}\`\n\n`;

        issues.forEach((issue: any, index: number) => {
            const f = issue.fields || {};
            text += `**${index + 1}. ${issue.key}: ${f.summary || "(no summary)"}**\n`;
            text += `   - Status: ${f.status?.name || "Unknown"}\n`;
            text += `   - Priority: ${f.priority?.name || "Unknown"}\n`;
            text += `   - Assignee: ${f.assignee?.displayName || "Unassigned"}\n`;
            text += `   - Reporter: ${f.reporter?.displayName || "Unknown"}\n`;
            if (f.labels?.length) text += `   - Labels: ${f.labels.join(", ")}\n`;
            if (f.components?.length) text += `   - Components: ${f.components.map((c: any) => c.name).join(", ")}\n`;
            if (f.fixVersions?.length) text += `   - Fix Versions: ${f.fixVersions.map((v: any) => v.name).join(", ")}\n`;
            text += `   - Created: ${f.created || "Unknown"}\n`;
            text += `   - Updated: ${f.updated || "Unknown"}\n`;
            text += "\n";
        });

        if (result.total > issues.length) {
            text += `\n_Showing ${startAt + 1}-${startAt + issues.length} of ${result.total}. Use startAt=${startAt + maxResults} for next page._\n`;
        }

        return {
            content: [{ type: "text", text }],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error searching test cases: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
