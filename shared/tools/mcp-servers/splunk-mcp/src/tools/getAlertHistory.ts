import { apiClient } from "../utils/apiClient.js";

export const getAlertHistorySchema = {
    name: "get_alert_history",
    description: "Get trigger history for a specific alert — shows how often it fires and detects patterns",
    inputSchema: {
        type: "object",
        properties: {
            alertName: { type: "string", description: "Name of the alert (saved search name)" },
            app: { type: "string", description: "Splunk app containing the alert", default: "search" },
            count: { type: "number", description: "Maximum history entries to return (default 50)", default: 50 },
        },
        required: ["alertName"],
    },
};

export async function handleGetAlertHistory(args: any) {
    const { alertName, app = "search", count = 50 } = args;

    const data = await apiClient.get(
        `/servicesNS/-/${app}/alerts/fired_alerts/${encodeURIComponent(alertName)}`,
        { count: String(count) },
    );
    const entries = data?.entry ?? [];

    const history = entries.map((e: any) => ({
        triggerTime: e.published,
        sid: e.content?.sid,
        resultCount: e.content?.triggered_alerts,
        severity: e.content?.severity,
        expirationTime: e.content?.expiration_time_rendered,
    }));

    // Calculate frequency stats
    const totalTriggers = history.length;
    let avgIntervalMs = 0;
    if (history.length > 1) {
        const times = history
            .map((h: any) => new Date(h.triggerTime).getTime())
            .filter((t: number) => !isNaN(t))
            .sort((a: number, b: number) => b - a);
        if (times.length > 1) {
            const intervals = [];
            for (let i = 0; i < times.length - 1; i++) {
                intervals.push(times[i] - times[i + 1]);
            }
            avgIntervalMs = intervals.reduce((a: number, b: number) => a + b, 0) / intervals.length;
        }
    }

    const summary = {
        alertName,
        totalTriggers,
        avgIntervalMinutes: avgIntervalMs > 0 ? Math.round(avgIntervalMs / 60000) : null,
        oldestTrigger: history.length > 0 ? history[history.length - 1]?.triggerTime : null,
        newestTrigger: history.length > 0 ? history[0]?.triggerTime : null,
    };

    return {
        content: [{ type: "text", text: JSON.stringify({ summary, history }, null, 2) }],
    };
}
