import { apiClient } from "../utils/apiClient.js";

export const oneshotSearchSchema = {
    name: "oneshot_search",
    description: "Run a quick blocking search that returns results immediately (best for simple queries with small result sets)",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string", description: "SPL search query" },
            earliestTime: { type: "string", description: "Earliest time (e.g. '-15m', '-1h')", default: "-15m" },
            latestTime: { type: "string", description: "Latest time (e.g. 'now')", default: "now" },
            maxResults: { type: "number", description: "Maximum results (default 50)", default: 50 },
        },
        required: ["query"],
    },
};

export async function handleOneshotSearch(args: any) {
    const { query, earliestTime = "-15m", latestTime = "now", maxResults = 50 } = args;

    const data = await apiClient.post("/services/search/jobs/oneshot", {
        search: query.startsWith("search") ? query : `search ${query}`,
        earliest_time: earliestTime,
        latest_time: latestTime,
        count: String(maxResults),
    });

    const results = data?.results ?? [];
    return {
        content: [{ type: "text", text: JSON.stringify({ count: results.length, results }, null, 2) }],
    };
}
