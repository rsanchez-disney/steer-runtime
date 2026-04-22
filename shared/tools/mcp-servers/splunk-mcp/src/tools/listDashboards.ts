import { apiClient } from "../utils/apiClient.js";

export const listDashboardsSchema = {
    name: "list_dashboards",
    description: "List dashboards available in a Splunk app",
    inputSchema: {
        type: "object",
        properties: {
            app: { type: "string", description: "Splunk app name (e.g. 'ticketing', 'search')", default: "search" },
            count: { type: "number", description: "Maximum dashboards to return (default 50)", default: 50 },
        },
        required: [],
    },
};

export async function handleListDashboards(args: any) {
    const { app = "search", count = 50 } = args;

    const data = await apiClient.get(`/servicesNS/-/${app}/data/ui/views`, {
        count: String(count),
    });
    const entries = data?.entry ?? [];

    const dashboards = entries.map((e: any) => ({
        name: e.name,
        label: e.content?.label || e.name,
        isDashboard: e.content?.isDashboard,
        isVisible: e.content?.isVisible,
        updated: e.updated,
    }));

    return {
        content: [{ type: "text", text: JSON.stringify({ app, count: dashboards.length, dashboards }, null, 2) }],
    };
}
