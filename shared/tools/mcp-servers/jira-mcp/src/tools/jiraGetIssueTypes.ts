import { JiraApiClient } from "../utils/jiraApi.js";
import { saveData } from "../utils/fileUtils.js";

export const jiraGetIssueTypesSchema = {
    name: "jira_get_issue_types",
    description: "Get all JIRA issue types",
    inputSchema: {
        type: "object",
        properties: {
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save the issue types data (optional, defaults to .amazonq/external-data)",
            },
        },
        required: [],
    },
};

export async function handleJiraGetIssueTypes(args: any): Promise<any> {
    try {
        const { outputDir } = args as { outputDir?: string };

        const apiClient = new JiraApiClient();
        const issueTypes = await apiClient.getJiraIssueTypes();

        let summaryText = `**JIRA Issue Types**

**Total Issue Types:** ${issueTypes.length}

`;

        issueTypes.forEach((issueType: any, index: number) => {
            summaryText += `**${index + 1}. ${issueType.name}**
- ID: ${issueType.id}
- Description: ${issueType.description || "No description"}
- Subtask: ${issueType.subtask ? "Yes" : "No"}

`;
        });

        // Save the issue types data
        const savedPath = await saveData(
            outputDir,
            `issue_types_${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
            {
                fetchedAt: new Date().toISOString(),
                rawData: issueTypes,
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
                    text: `Error fetching JIRA issue types: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
