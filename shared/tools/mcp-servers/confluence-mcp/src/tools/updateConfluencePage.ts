import { apiClient } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";

export const updateConfluencePageSchema = {
    name: "update_confluence_page",
    description: "Update an existing Confluence page",
    inputSchema: {
        type: "object",
        properties: {
            pageId: {
                type: "string",
                description: "Page ID to update",
            },
            title: {
                type: "string",
                description: "New page title",
            },
            body: {
                type: "string",
                description: "New page content in Confluence storage format",
            },
            version: {
                type: "number",
                description: "Current version number of the page",
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save data (optional, defaults to .amazonq/external-data). Pass false or null to skip saving",
            },
        },
        required: ["pageId", "title", "body", "version"],
    },
};

export async function handleUpdateConfluencePage(args: any) {
    const { pageId, title, body, version, outputDir } = args;

    const pageData = {
        version: { number: version },
        title,
        type: "page",
        body: {
            storage: {
                value: body,
                representation: "storage",
            },
        },
    };

    const data = await apiClient.makeRequest(`content/${pageId}`, {
        method: "PUT",
        body: JSON.stringify(pageData),
    });

    const filename = `updated-page-${pageId}.json`;
    const filePath = await saveToFile(data, outputDir, filename);

    const savedInfo = filePath ? ` Data saved to: ${filePath}` : "";

    return {
        content: [
            {
                type: "text",
                text: `Successfully updated page "${title}" (ID: ${pageId}).${savedInfo}`,
            },
        ],
    };
}
