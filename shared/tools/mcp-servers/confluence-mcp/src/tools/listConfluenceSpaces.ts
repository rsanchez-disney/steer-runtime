import { apiClient } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";

export const listConfluenceSpacesSchema = {
    name: "list_confluence_spaces",
    description: "List all Confluence spaces",
    inputSchema: {
        type: "object",
        properties: {
            start: {
                type: "number",
                description: "Start index for pagination",
                default: 0,
            },
            limit: {
                type: "number",
                description: "Number of results to return",
                default: 25,
            },
            expand: {
                type: "string",
                description: "Comma-separated list of properties to expand",
                default: "description.plain",
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

export async function handleListConfluenceSpaces(args: any) {
    const {
        start = 0,
        limit = 25,
        expand = "description.plain",
        outputDir,
    } = args;

    const params = new URLSearchParams({
        start: start.toString(),
        limit: limit.toString(),
        expand,
    });

    const data = await apiClient.makeRequest(`space?${params}`);
    const filename = `spaces-list-${Date.now()}.json`;
    const filePath = await saveToFile(data, outputDir, filename);

    const savedInfo = filePath ? ` Data saved to: ${filePath}` : "";

    return {
        content: [
            {
                type: "text",
                text: `Found ${data.results?.length || 0} spaces.${savedInfo}`,
            },
        ],
    };
}
