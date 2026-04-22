import { JiraApiClient } from "../utils/jiraApi.js";
import { saveData } from "../utils/fileUtils.js";

export const jiraLinkIssuesSchema = {
    name: "jira_link_issues",
    description:
        "Create a directional link between two JIRA issues (e.g., Test, Blocks, Relates)",
    inputSchema: {
        type: "object",
        properties: {
            inwardTicketId: {
                type: "string",
                description:
                    "The ticket key receiving the inward relationship (e.g., PROJ-100)",
            },
            outwardTicketId: {
                type: "string",
                description:
                    "The ticket key receiving the outward relationship (e.g., PROJ-200)",
            },
            linkType: {
                type: "string",
                description:
                    'The link type name configured in the Jira instance (e.g., "Test", "Blocks", "Relates")',
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save the link operation result (optional)",
            },
        },
        required: ["inwardTicketId", "outwardTicketId", "linkType"],
    },
};

export async function handleJiraLinkIssues(args: any): Promise<any> {
    try {
        const { inwardTicketId, outwardTicketId, linkType, outputDir } =
            args as {
                inwardTicketId: string;
                outwardTicketId: string;
                linkType: string;
                outputDir?: string;
            };

        const apiClient = new JiraApiClient();
        await apiClient.linkJiraIssues(
            inwardTicketId,
            outwardTicketId,
            linkType,
        );

        const summaryText = `**Issue Link Created Successfully**

**Link Type:** ${linkType}
**Inward Issue:** ${inwardTicketId}
**Outward Issue:** ${outwardTicketId}`;

        const savedPath = await saveData(
            outputDir,
            `link_${inwardTicketId}_${outwardTicketId}_${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
            {
                inwardTicketId,
                outwardTicketId,
                linkType,
                createdAt: new Date().toISOString(),
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
                    text: `Error linking JIRA issues: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
