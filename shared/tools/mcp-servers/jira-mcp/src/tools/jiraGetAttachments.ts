import { JiraApiClient } from "../utils/jiraApi.js";
import { saveTicketData } from "../utils/fileUtils.js";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const jiraGetAttachmentsSchema = {
    name: "jira_get_attachments",
    description:
        "Get attachments from a JIRA ticket. Can list attachments or download a specific one. For images, downloads and saves to disk so they can be viewed.",
    inputSchema: {
        type: "object",
        properties: {
            ticketId: {
                type: "string",
                description: "The JIRA ticket ID (e.g., REMY-41705)",
            },
            download: {
                type: "boolean",
                description:
                    "If true, downloads all attachments to outputDir. If false (default), just lists them.",
            },
            attachmentFilename: {
                type: "string",
                description:
                    "Optional: Download only the attachment with this filename",
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save downloaded attachments (defaults to .amazonq/external-data/attachments/{ticketId})",
            },
        },
        required: ["ticketId"],
    },
};

export async function handleJiraGetAttachments(args: any): Promise<any> {
    try {
        const { ticketId, download, attachmentFilename, outputDir } = args as {
            ticketId: string;
            download?: boolean;
            attachmentFilename?: string;
            outputDir?: string | boolean | null;
        };

        const apiClient = new JiraApiClient();
        const attachments = await apiClient.getJiraAttachments(ticketId);

        if (attachments.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `**${ticketId}** has no attachments.`,
                    },
                ],
            };
        }

        // Build attachment list
        const attachmentList = attachments.map((att: any, i: number) => {
            const sizeKB = Math.round((att.size || 0) / 1024);
            return `${i + 1}. **${att.filename}** (${att.mimeType}, ${sizeKB}KB) - Created: ${att.created}`;
        });

        let summaryText = `**Attachments for ${ticketId}** (${attachments.length} files)\n\n${attachmentList.join("\n")}`;

        // Download if requested
        if (download) {
            const saveDir =
                typeof outputDir === "string"
                    ? outputDir
                    : `/tmp/jira-mcp/attachments/${ticketId}`;

            await mkdir(saveDir, { recursive: true });

            const downloaded: string[] = [];

            for (const att of attachments) {
                // Skip if filtering by filename and doesn't match
                if (
                    attachmentFilename &&
                    att.filename !== attachmentFilename
                ) {
                    continue;
                }

                try {
                    const buffer = await apiClient.downloadAttachment(
                        att.content,
                    );
                    const filePath = join(saveDir, att.filename);
                    await writeFile(filePath, buffer);
                    downloaded.push(
                        `✅ ${att.filename} → ${filePath}`,
                    );
                } catch (err) {
                    downloaded.push(
                        `❌ ${att.filename} → Failed: ${err instanceof Error ? err.message : "Unknown error"}`,
                    );
                }
            }

            summaryText += `\n\n**Downloaded to ${saveDir}:**\n${downloaded.join("\n")}`;
        }

        return {
            content: [
                {
                    type: "text",
                    text: summaryText,
                },
            ],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error getting attachments: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
