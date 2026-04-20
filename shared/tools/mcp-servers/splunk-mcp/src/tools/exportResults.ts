import { apiClient } from "../utils/apiClient.js";

export const exportResultsSchema = {
    name: "export_results",
    description: "Run a search and export results in CSV format (useful for reports and incident documentation)",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string", description: "SPL search query" },
            earliestTime: { type: "string", description: "Earliest time (e.g. '-1h', '-24h')", default: "-1h" },
            latestTime: { type: "string", description: "Latest time", default: "now" },
            maxResults: { type: "number", description: "Maximum results to export (default 500)", default: 500 },
            maxWaitSeconds: { type: "number", description: "Maximum seconds to wait (default 120)", default: 120 },
        },
        required: ["query"],
    },
};

export async function handleExportResults(args: any) {
    const { query, earliestTime = "-1h", latestTime = "now", maxResults = 500, maxWaitSeconds = 120 } = args;

    const sid = await apiClient.createSearch(query, {
        earliest_time: earliestTime,
        latest_time: latestTime,
    });

    await apiClient.waitForSearch(sid, maxWaitSeconds * 1000);
    const results = await apiClient.getSearchResults(sid, maxResults);
    const events = results?.results ?? [];

    if (!events.length) {
        return {
            content: [{ type: "text", text: "No results found for the query." }],
        };
    }

    // Build CSV
    const headers = Object.keys(events[0]).filter((k) => !k.startsWith("_"));
    const csvLines = [headers.join(",")];
    for (const event of events) {
        const row = headers.map((h) => {
            const val = String(event[h] ?? "").replace(/"/g, '""');
            return val.includes(",") || val.includes('"') || val.includes("\n") ? `"${val}"` : val;
        });
        csvLines.push(row.join(","));
    }

    const csv = csvLines.join("\n");
    return {
        content: [{ type: "text", text: `CSV Export (${events.length} rows):\n\n${csv}` }],
    };
}
