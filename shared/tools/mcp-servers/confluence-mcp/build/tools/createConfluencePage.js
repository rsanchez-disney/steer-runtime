import { apiClient } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
export const createConfluencePageSchema = {
    name: "create_confluence_page",
    description: "Create a new Confluence page",
    inputSchema: {
        type: "object",
        properties: {
            spaceKey: {
                type: "string",
                description: "Space key where the page will be created",
            },
            title: {
                type: "string",
                description: "Page title",
            },
            body: {
                type: "string",
                description: "Page content in Confluence storage format",
            },
            parentId: {
                type: "string",
                description: "Parent page ID (optional)",
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description: "Directory to save data (optional, defaults to .amazonq/external-data). Pass false or null to skip saving",
            },
        },
        required: ["spaceKey", "title", "body"],
    },
};
export async function handleCreateConfluencePage(args) {
    const { spaceKey, title, body, parentId, outputDir } = args;
    const pageData = {
        type: "page",
        title,
        space: { key: spaceKey },
        body: {
            storage: {
                value: body,
                representation: "storage",
            },
        },
    };
    if (parentId) {
        pageData.ancestors = [{ id: parentId }];
    }
    const data = await apiClient.makeRequest("content", {
        method: "POST",
        body: JSON.stringify(pageData),
    });
    const filename = `created-page-${data.id}.json`;
    const filePath = await saveToFile(data, outputDir, filename);
    const savedInfo = filePath ? ` Data saved to: ${filePath}` : "";
    return {
        content: [
            {
                type: "text",
                text: `Successfully created page "${title}" with ID ${data.id}.${savedInfo}`,
            },
        ],
    };
}
//# sourceMappingURL=createConfluencePage.js.map