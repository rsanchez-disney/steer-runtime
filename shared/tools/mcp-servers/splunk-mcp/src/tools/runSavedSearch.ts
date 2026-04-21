import { apiClient } from "../utils/apiClient.js";

export const runSavedSearchSchema = {
    name: "run_saved_search",
    description: "Dispatch (run) a saved search and return its results",
    inputSchema: {
        type: "object",
        properties: {
            name: { type: "string", description: "Name of the saved search to run" },
            app: { type: "string", description: "Splunk app containing the saved search", default: "search" },
            earliestTime: { type: "string", description: "Override earliest time", default: "-15m" },
            latestTime: { type: "string", description: "Override latest time", default: "now" },
            maxResults: { type: "number", description: "Maximum results to return (default 100)", default: 100 },
            maxWaitSeconds: { type: "number", description: "Maximum seconds to wait (default 60)", default: 60 },
        },
        required: ["name"],
    },
};

export async function handleRunSavedSearch(args: any) {
    const { name, app = "search", earliestTime = "-15m", latestTime = "now", maxResults = 100, maxWaitSeconds = 60 } = args;

    const dispatchResult = await apiClient.post(
        `/servicesNS/-/${app}/saved/searches/${encodeURIComponent(name)}/dispatch`,
        {
            "dispatch.earliest_time": earliestTime,
            "dispatch.latest_time": latestTime,
        },
    );

    const sid = dispatchResult?.sid;
    if (!sid) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: "Failed to dispatch saved search", details: dispatchResult }) }],
        };
    }

    await apiClient.waitForSearch(sid, maxWaitSeconds * 1000);
    const results = await apiClient.getSearchResults(sid, maxResults);
    const events = results?.results ?? [];

    return {
        content: [{ type: "text", text: JSON.stringify({ sid, savedSearch: name, count: events.length, results: events }, null, 2) }],
    };
}
