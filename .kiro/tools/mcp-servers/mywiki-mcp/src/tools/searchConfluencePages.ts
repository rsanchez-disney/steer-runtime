import { apiClient } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";

export const searchConfluencePagesSchema = {
    name: "search_mywiki_pages",
    description:
        "Search MyWiki pages using CQL (Confluence Query Language)",
    inputSchema: {
        type: "object",
        properties: {
            cql: {
                type: "string",
                description: "CQL query string",
            },
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
                default: "version,space",
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description: "Directory to save the search results",
            },
        },
        required: ["cql"],
    },
};

export async function handleSearchConfluencePages(args: any) {
    const {
        cql,
        start = 0,
        limit = 25,
        expand = "version,space",
        outputDir,
    } = args;

    const params = new URLSearchParams({
        cql,
        start: start.toString(),
        limit: limit.toString(),
        expand,
    });

    const data = await apiClient.makeRequest(`content/search?${params}`);
    const filename = `search-results-${Date.now()}.json`;
    const filePath = await saveToFile(data, outputDir, filename);

    const savedInfo = filePath ? ` Search results saved to: ${filePath}` : "";

    return {
        content: [
            {
                type: "text",
                text: `Found ${data.results?.length || 0} pages.${savedInfo}`,
            },
        ],
    };
}
