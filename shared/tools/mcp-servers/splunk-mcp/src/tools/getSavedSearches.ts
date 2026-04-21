import { apiClient } from "../utils/apiClient.js";

export const getSavedSearchesSchema = {
    name: "get_saved_searches",
    description: "List saved searches (reports and alerts) in a Splunk app",
    inputSchema: {
        type: "object",
        properties: {
            app: { type: "string", description: "Splunk app name (e.g. 'ticketing', 'search')", default: "search" },
            count: { type: "number", description: "Maximum number of saved searches to return (default 50)", default: 50 },
        },
        required: [],
    },
};

export async function handleGetSavedSearches(args: any) {
    const { app = "search", count = 50 } = args;

    const data = await apiClient.get(`/servicesNS/-/${app}/saved/searches`, {
        count: String(count),
    });
    const entries = data?.entry ?? [];

    const searches = entries.map((e: any) => ({
        name: e.name,
        search: e.content?.search,
        isScheduled: e.content?.is_scheduled,
        nextScheduledTime: e.content?.next_scheduled_time,
        disabled: e.content?.disabled,
    }));

    return {
        content: [{ type: "text", text: JSON.stringify({ count: searches.length, searches }, null, 2) }],
    };
}
