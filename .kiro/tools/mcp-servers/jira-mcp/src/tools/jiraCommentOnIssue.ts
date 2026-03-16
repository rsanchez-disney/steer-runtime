import { JiraApiClient } from "../utils/jiraApi.js";
import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";

export const jiraCommentOnIssueSchema = {
    name: "jira_comment_on_issue",
    description: "Add a comment to a JIRA ticket",
    inputSchema: {
        type: "object",
        properties: {
            ticketId: {
                type: "string",
                description: "The JIRA ticket ID (e.g., COREWEB-1815)",
            },
            comment: {
                type: "string",
                description: "The comment text to add",
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save the comment response data (optional)",
            },
        },
        required: ["ticketId", "comment"],
    },
};

export async function handleJiraCommentOnIssue(args: any): Promise<any> {
    try {
        const { ticketId, comment, outputDir } = args as {
            ticketId: string;
            comment: string;
            outputDir?: string;
        };

        const apiClient = new JiraApiClient();
        const commentResponse = await apiClient.addJiraComment(
            ticketId,
            comment,
        );

        // Also fetch the updated ticket to show current state
        const ticket = await apiClient.fetchJiraTicket(ticketId);

        const summaryText = `**Comment Added to ${ticket.key}: ${ticket.fields.summary}**

**Comment:** ${comment}

**Current Status:** ${ticket.fields.status?.name || "Unknown"}
**Assignee:** ${ticket.fields.assignee?.displayName || "Unassigned"}`;

        // Save the comment response data if outputDir is provided
        let savedPath: string | null = null;
        if (outputDir) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filepath = join(
                outputDir,
                `${ticketId}_comment_${timestamp}.json`,
            );
            await mkdir(dirname(filepath), { recursive: true });

            const data = {
                ticketId,
                comment,
                commentResponse,
                ticket,
                timestamp: new Date().toISOString(),
                formattedSummary: summaryText,
            };

            await writeFile(filepath, JSON.stringify(data, null, 2));
            savedPath = filepath;
        }

        const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

        return {
            content: [
                {
                    type: "text",
                    text: `**Comment Added Successfully**

${summaryText}${savedInfo}`,
                },
            ],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error adding comment to JIRA ticket: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
