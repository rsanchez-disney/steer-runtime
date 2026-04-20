import { apiClient } from "../utils/apiClient.js";

export const getAlertsSchema = {
    name: "get_alerts",
    description: "Get recently fired alerts from Splunk",
    inputSchema: {
        type: "object",
        properties: {
            count: { type: "number", description: "Maximum number of alerts to return (default 20)", default: 20 },
        },
        required: [],
    },
};

export async function handleGetAlerts(args: any) {
    const { count = 20 } = args;

    const data = await apiClient.get("/services/alerts/fired_alerts", {
        count: String(count),
    });
    const entries = data?.entry ?? [];

    const alerts = entries.map((e: any) => ({
        name: e.name,
        triggeredAlertCount: e.content?.triggered_alert_count,
        severity: e.content?.alert_severity,
        published: e.published,
    }));

    return {
        content: [{ type: "text", text: JSON.stringify({ count: alerts.length, alerts }, null, 2) }],
    };
}
