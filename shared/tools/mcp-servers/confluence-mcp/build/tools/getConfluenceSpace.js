import { apiClient } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
export const getConfluenceSpaceSchema = {
    name: "get_confluence_space",
    description: "Get information about a Confluence space",
    inputSchema: {
        type: "object",
        properties: {
            spaceKey: {
                type: "string",
                description: "Space key",
            },
            expand: {
                type: "string",
                description: "Comma-separated list of properties to expand",
                default: "description.plain,homepage",
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description: "Directory to save data (optional, defaults to .amazonq/external-data). Pass false or null to skip saving",
            },
        },
        required: ["spaceKey"],
    },
};
export async function handleGetConfluenceSpace(args) {
    const { spaceKey, expand = "description.plain,homepage", outputDir } = args;
    const params = new URLSearchParams({ expand });
    const data = await apiClient.makeRequest(`space/${spaceKey}?${params}`);
    const filename = `space-${spaceKey}.json`;
    const filePath = await saveToFile(data, outputDir, filename);
    const savedInfo = filePath ? ` Data saved to: ${filePath}` : "";
    return {
        content: [
            {
                type: "text",
                text: `Successfully retrieved space information.${savedInfo}`,
            },
        ],
    };
}
//# sourceMappingURL=getConfluenceSpace.js.map