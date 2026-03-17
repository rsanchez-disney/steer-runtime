import { apiClient } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";

export const getConfluencePageSchema = {
    name: "get_confluence_page",
    description: "Get a Confluence page by ID or title",
    inputSchema: {
        type: "object",
        properties: {
            pageId: {
                type: "string",
                description: "Page ID (if getting by ID)",
            },
            spaceKey: {
                type: "string",
                description: "Space key (required if getting by title)",
            },
            title: {
                type: "string",
                description: "Page title (if getting by title)",
            },
            expand: {
                type: "string",
                description: "Comma-separated list of properties to expand",
                default: "body.storage,version,space",
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save data (optional, defaults to .amazonq/external-data). Pass false or null to skip saving",
            },
        },
        required: [],
    },
};

export async function handleGetConfluencePage(args: any) {
    const {
        pageId,
        spaceKey,
        title,
        expand = "body.storage,version,space",
        outputDir,
    } = args;

    let data;
    let filename;

    if (pageId) {
        const params = new URLSearchParams({ expand });
        data = await apiClient.makeRequest(`content/${pageId}?${params}`);
        filename = `page-${pageId}.json`;
    } else if (spaceKey && title) {
        const params = new URLSearchParams({ spaceKey, title, expand });
        const result = await apiClient.makeRequest(`content?${params}`);
        data = result.results?.[0] || {};
        filename = `page-${spaceKey}-${title.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    } else {
        throw new Error(
            "Either pageId or both spaceKey and title must be provided",
        );
    }

    const filePath = await saveToFile(data, outputDir, filename);
    const savedInfo = filePath ? ` Data saved to: ${filePath}` : "";

    return {
        content: [
            {
                type: "text",
                text: `Successfully retrieved Confluence page.${savedInfo}`,
            },
        ],
    };
}
