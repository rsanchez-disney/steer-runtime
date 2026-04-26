import { apiClient } from "../utils/apiClient.js";

export const searchDocumentsSchema = {
    name: "sharepoint_search_documents",
    description: "Search for documents across SharePoint by keyword",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string", description: "Search query" },
        },
        required: ["query"],
    },
};

export async function handleSearchDocuments(args: any): Promise<any> {
    try {
        const { query } = args as { query: string };
        const body = {
            requests: [{
                entityTypes: ["driveItem"],
                query: { queryString: query },
            }],
        };
        const data = await apiClient.graphRequest("/search/query", { method: "POST", body: JSON.stringify(body) });
        const hits = data.value?.[0]?.hitsContainers?.[0]?.hits || [];
        const results = hits.map((h: any) => {
            const r = h.resource;
            return `- **${r.name}** — ${r.webUrl}\n  Modified: ${r.lastModifiedDateTime} | Size: ${((r.size || 0) / 1024).toFixed(1)} KB`;
        });
        return { content: [{ type: "text", text: `**Search results for "${query}"** (${hits.length} found)\n\n${results.join("\n") || "No results."}` }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
