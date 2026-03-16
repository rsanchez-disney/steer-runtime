import { apiClient } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";

export const commentOnConfluencePageSchema = {
    name: "comment_on_confluence_page",
    description: "Add a comment to a Confluence page",
    inputSchema: {
        type: "object",
        properties: {
            pageId: {
                type: "string",
                description: "Page ID to comment on",
            },
            body: {
                type: "string",
                description: "Comment content in Confluence storage format",
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save data (optional, defaults to .amazonq/external-data). Pass false or null to skip saving",
            },
        },
        required: ["pageId", "body"],
    },
};

export async function handleCommentOnConfluencePage(args: any) {
    const { pageId, body, outputDir } = args;

    const commentData = {
        type: "comment",
        container: {
            id: pageId,
            type: "page",
        },
        body: {
            storage: {
                value: body,
                representation: "storage",
            },
        },
    };

    const data = await apiClient.makeRequest("content", {
        method: "POST",
        body: JSON.stringify(commentData),
    });

    const filename = `comment-${data.id}-on-page-${pageId}.json`;
    const filePath = await saveToFile(data, outputDir, filename);

    const savedInfo = filePath ? ` Data saved to: ${filePath}` : "";

    return {
        content: [
            {
                type: "text",
                text: `Successfully added comment to page ${pageId}. Comment ID: ${data.id}.${savedInfo}`,
            },
        ],
    };
}
