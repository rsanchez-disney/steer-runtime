import { apiClient } from "../utils/apiClient.js";

export const runDashboardPanelSchema = {
    name: "run_dashboard_panel",
    description: "Get a dashboard's panel queries and run a specific panel's search by index (0-based). Useful for executing existing dashboard logic programmatically.",
    inputSchema: {
        type: "object",
        properties: {
            dashboardName: { type: "string", description: "Dashboard name (ID)" },
            app: { type: "string", description: "Splunk app containing the dashboard", default: "search" },
            panelIndex: { type: "number", description: "Panel index to run (0-based)", default: 0 },
            earliestTime: { type: "string", description: "Override earliest time (uses panel default if omitted)" },
            latestTime: { type: "string", description: "Override latest time (uses panel default if omitted)" },
            maxResults: { type: "number", description: "Maximum results (default 100)", default: 100 },
            maxWaitSeconds: { type: "number", description: "Maximum seconds to wait (default 60)", default: 60 },
        },
        required: ["dashboardName"],
    },
};

export async function handleRunDashboardPanel(args: any) {
    const { dashboardName, app = "search", panelIndex = 0, earliestTime, latestTime, maxResults = 100, maxWaitSeconds = 60 } = args;

    // Get dashboard definition
    const data = await apiClient.get(`/servicesNS/-/${app}/data/ui/views/${encodeURIComponent(dashboardName)}`);
    const entry = data?.entry?.[0];

    if (!entry) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: `Dashboard '${dashboardName}' not found in app '${app}'` }) }],
        };
    }

    const xml = entry.content?.["eai:data"] || "";

    // Extract searches
    const searchRegex = /<search[^>]*>([\s\S]*?)<\/search>/g;
    const queryRegex = /<query>([\s\S]*?)<\/query>/;
    const earliestRegex = /<earliest>([\s\S]*?)<\/earliest>/;
    const latestRegex = /<latest>([\s\S]*?)<\/latest>/;

    const panels: Array<{ search: string; earliest?: string; latest?: string }> = [];
    let searchMatch;
    while ((searchMatch = searchRegex.exec(xml)) !== null) {
        const searchBlock = searchMatch[1];
        const queryMatch = queryRegex.exec(searchBlock);
        if (queryMatch) {
            const eMatch = earliestRegex.exec(searchBlock);
            const lMatch = latestRegex.exec(searchBlock);
            panels.push({
                search: queryMatch[1].trim(),
                earliest: eMatch?.[1]?.trim(),
                latest: lMatch?.[1]?.trim(),
            });
        }
    }

    if (panelIndex >= panels.length) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: `Panel index ${panelIndex} out of range. Dashboard has ${panels.length} panels (0-${panels.length - 1}).` }) }],
        };
    }

    const panel = panels[panelIndex];
    const searchEarliest = earliestTime || panel.earliest || "-15m";
    const searchLatest = latestTime || panel.latest || "now";

    // Run the panel's search
    const sid = await apiClient.createSearch(panel.search, {
        earliest_time: searchEarliest,
        latest_time: searchLatest,
    });

    await apiClient.waitForSearch(sid, maxWaitSeconds * 1000);
    const results = await apiClient.getSearchResults(sid, maxResults);
    const events = results?.results ?? [];

    return {
        content: [{ type: "text", text: JSON.stringify({
            dashboard: dashboardName,
            panelIndex,
            query: panel.search,
            timeRange: { earliest: searchEarliest, latest: searchLatest },
            count: events.length,
            results: events,
        }, null, 2) }],
    };
}
