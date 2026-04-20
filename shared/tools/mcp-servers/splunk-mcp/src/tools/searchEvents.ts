import { apiClient } from "../utils/apiClient.js";

export const searchEventsSchema = {
    name: "search_events",
    description: "Run a Splunk search query (SPL) and return results. Waits for the search to complete.",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string", description: "SPL search query (e.g. 'index=main error | head 10')" },
            earliestTime: { type: "string", description: "Earliest time (e.g. '-15m', '-1h', '2026-04-14T00:00:00')", default: "-15m" },
            latestTime: { type: "string", description: "Latest time (e.g. 'now', '-5m')", default: "now" },
            maxResults: { type: "number", description: "Maximum results to return (default 100)", default: 100 },
            maxWaitSeconds: { type: "number", description: "Maximum seconds to wait for search completion (default 60)", default: 60 },
        },
        required: ["query"],
    },
};

export async function handleSearchEvents(args: any) {
    const { query, earliestTime = "-15m", latestTime = "now", maxResults = 100, maxWaitSeconds = 60 } = args;

    const sid = await apiClient.createSearch(query, {
        earliest_time: earliestTime,
        latest_time: latestTime,
    });

    await apiClient.waitForSearch(sid, maxWaitSeconds * 1000);
    const results = await apiClient.getSearchResults(sid, maxResults);
    const events = results?.results ?? [];

    return {
        content: [{ type: "text", text: JSON.stringify({ sid, count: events.length, results: events }, null, 2) }],
    };
}
