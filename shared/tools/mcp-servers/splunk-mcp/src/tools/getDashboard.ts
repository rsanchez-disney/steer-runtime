import { apiClient } from "../utils/apiClient.js";

export const getDashboardSchema = {
    name: "get_dashboard",
    description: "Get a dashboard definition including panel search queries. Extracts SPL queries from each panel for reuse.",
    inputSchema: {
        type: "object",
        properties: {
            name: { type: "string", description: "Dashboard name (ID)" },
            app: { type: "string", description: "Splunk app containing the dashboard", default: "search" },
        },
        required: ["name"],
    },
};

export async function handleGetDashboard(args: any) {
    const { name, app = "search" } = args;

    const data = await apiClient.get(`/servicesNS/-/${app}/data/ui/views/${encodeURIComponent(name)}`);
    const entry = data?.entry?.[0];

    if (!entry) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: `Dashboard '${name}' not found in app '${app}'` }) }],
        };
    }

    const xml = entry.content?.["eai:data"] || "";
    const label = entry.content?.label || name;

    // Extract search queries from the XML
    const panels: Array<{ title: string; search: string; earliest?: string; latest?: string }> = [];
    const searchRegex = /<search[^>]*>([\s\S]*?)<\/search>/g;
    const queryRegex = /<query>([\s\S]*?)<\/query>/;
    const earliestRegex = /<earliest>([\s\S]*?)<\/earliest>/;
    const latestRegex = /<latest>([\s\S]*?)<\/latest>/;
    const titleRegex = /<title>([\s\S]*?)<\/title>/g;

    // Get all titles
    const titles: string[] = [];
    let titleMatch;
    while ((titleMatch = titleRegex.exec(xml)) !== null) {
        titles.push(titleMatch[1].trim());
    }

    let searchMatch;
    let panelIndex = 0;
    while ((searchMatch = searchRegex.exec(xml)) !== null) {
        const searchBlock = searchMatch[1];
        const queryMatch = queryRegex.exec(searchBlock);
        if (queryMatch) {
            const earliestMatch = earliestRegex.exec(searchBlock);
            const latestMatch = latestRegex.exec(searchBlock);
            panels.push({
                title: titles[panelIndex] || `Panel ${panelIndex + 1}`,
                search: queryMatch[1].trim(),
                earliest: earliestMatch?.[1]?.trim(),
                latest: latestMatch?.[1]?.trim(),
            });
        }
        panelIndex++;
    }

    return {
        content: [{ type: "text", text: JSON.stringify({ name, label, app, panelCount: panels.length, panels }, null, 2) }],
    };
}
