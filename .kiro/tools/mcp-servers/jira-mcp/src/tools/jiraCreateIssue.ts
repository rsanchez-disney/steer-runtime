import { JiraApiClient } from "../utils/jiraApi.js";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const jiraCreateIssueSchema = {
    name: "jira_create_issue",
    description: "Create a new JIRA issue",
    inputSchema: {
        type: "object",
        properties: {
            projectKey: {
                type: "string",
                description: 'Project key (e.g., "COREWEB")',
            },
            summary: {
                type: "string",
                description: "Issue summary/title",
            },
            issueType: {
                type: "string",
                description: 'Issue type (e.g., "Bug", "Story", "Task")',
            },
            description: {
                type: "string",
                description: "Issue description (optional)",
            },
            assignee: {
                type: "string",
                description: "Username of assignee (optional)",
            },
            epicLink: {
                type: "string",
                description:
                    'Epic ticket ID to link to (e.g., "SEWEB-46018") - NOTE: Epic Link field ID needs configuration per JIRA instance (optional)',
            },
            components: {
                type: "array",
                items: { type: "string" },
                description:
                    'Array of component names (e.g., ["Client Platforms & Misc"]) (optional)',
            },
            labels: {
                type: "array",
                items: { type: "string" },
                description:
                    'Array of label names (e.g., ["SPORTSWEB", "olympics", "2026"]) (optional)',
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save the created issue data (optional)",
            },
        },
        required: ["projectKey", "summary", "issueType"],
    },
};

export async function handleJiraCreateIssue(args: any): Promise<any> {
    try {
        const {
            projectKey,
            summary,
            issueType,
            description,
            assignee,
            epicLink,
            components,
            labels,
            outputDir,
        } = args as {
            projectKey: string;
            summary: string;
            issueType: string;
            description?: string;
            assignee?: string;
            epicLink?: string;
            components?: string[];
            labels?: string[];
            outputDir?: string;
        };

        const apiClient = new JiraApiClient();
        const createResponse = await apiClient.createJiraIssue(
            projectKey,
            summary,
            issueType,
            description,
            assignee,
            epicLink,
            components,
            labels,
        );

        // Fetch the created issue to get full details
        const ticket = await apiClient.fetchJiraTicket(createResponse.key);

        let summaryText = `**Issue Created Successfully: ${ticket.key}**

**${ticket.key}: ${ticket.fields.summary}**

**Status:** ${ticket.fields.status?.name || "Unknown"}
**Assignee:** ${ticket.fields.assignee?.displayName || "Unassigned"}
**Priority:** ${ticket.fields.priority?.name || "Unknown"}
**Type:** ${issueType}
**Project:** ${projectKey}`;

        if (epicLink) {
            summaryText += `\n**Epic Link:** ${epicLink} (WARNING: Not set - field ID needs configuration)`;
        }

        if (components && components.length > 0) {
            summaryText += `\n**Components:** ${components.join(", ")}`;
        }

        if (labels && labels.length > 0) {
            summaryText += `\n**Labels:** ${labels.join(", ")}`;
        }

        summaryText += `\n\n**Description:**
${ticket.fields.description || "No description provided"}`;

        // Save the created issue data if outputDir is provided
        let savedPath: string | null = null;
        if (outputDir) {
            await mkdir(outputDir, { recursive: true });
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filename = `${createResponse.key}_created_${timestamp}.json`;
            const filepath = join(outputDir, filename);

            const data = {
                createdIssue: createResponse,
                fullTicketData: ticket,
                customFields: { epicLink, components, labels },
                warnings: epicLink
                    ? [
                          "Epic Link field ID not configured for this JIRA instance",
                      ]
                    : [],
                createdAt: new Date().toISOString(),
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
                    text: `${summaryText}

**Issue URL:** https://myjira.disney.com/browse/${createResponse.key}${savedInfo}`,
                },
            ],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error creating JIRA issue: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
