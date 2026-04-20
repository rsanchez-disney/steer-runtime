import { apiClient } from "../utils/apiClient.js";

export const getSourcetypesSchema = {
    name: "get_sourcetypes",
    description: "List sourcetypes available in a specific index or across all indexes",
    inputSchema: {
        type: "object",
        properties: {
            index: { type: "string", description: "Index name to filter sourcetypes (optional — lists all if omitted)" },
            count: { type: "number", description: "Maximum sourcetypes to return (default 100)", default: 100 },
        },
        required: [],
    },
};

export async function handleGetSourcetypes(args: any) {
    const { index, count = 100 } = args;

    // Use metadata search to get sourcetypes for a specific index
    if (index) {
        const sid = await apiClient.createSearch(
            `| metadata type=sourcetypes index=${index} | table sourcetype totalCount firstTime lastTime | sort -totalCount`,
            { earliest_time: "-24h", latest_time: "now" },
        );
        await apiClient.waitForSearch(sid, 30000);
        const results = await apiClient.getSearchResults(sid, count);
        const sourcetypes = results?.results ?? [];
        return {
            content: [{ type: "text", text: JSON.stringify({ index, count: sourcetypes.length, sourcetypes }, null, 2) }],
        };
    }

    // List all known sourcetypes from the REST API
    const data = await apiClient.get("/services/saved/sourcetypes", { count: String(count) });
    const entries = data?.entry ?? [];
    const sourcetypes = entries.map((e: any) => ({
        name: e.name,
        description: e.content?.description || "",
    }));

    return {
        content: [{ type: "text", text: JSON.stringify({ count: sourcetypes.length, sourcetypes }, null, 2) }],
    };
}
