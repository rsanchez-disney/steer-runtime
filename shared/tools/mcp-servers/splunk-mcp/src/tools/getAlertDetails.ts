import { apiClient } from "../utils/apiClient.js";

export const getAlertDetailsSchema = {
    name: "get_alert_details",
    description: "Get full details of a specific fired alert including trigger time, severity, results count, and actions taken",
    inputSchema: {
        type: "object",
        properties: {
            alertName: { type: "string", description: "Name of the alert (saved search name)" },
            app: { type: "string", description: "Splunk app containing the alert", default: "search" },
        },
        required: ["alertName"],
    },
};

export async function handleGetAlertDetails(args: any) {
    const { alertName, app = "search" } = args;

    // Get the saved search definition (alert config)
    const searchData = await apiClient.get(
        `/servicesNS/-/${app}/saved/searches/${encodeURIComponent(alertName)}`,
    );
    const searchEntry = searchData?.entry?.[0]?.content;

    // Get fired instances
    const firedData = await apiClient.get(
        `/servicesNS/-/${app}/alerts/fired_alerts/${encodeURIComponent(alertName)}`,
        { count: "10" },
    );
    const firedEntries = firedData?.entry ?? [];

    const alertConfig = {
        name: alertName,
        search: searchEntry?.search,
        cronSchedule: searchEntry?.cron_schedule,
        isScheduled: searchEntry?.is_scheduled,
        alertType: searchEntry?.alert_type,
        alertSeverity: searchEntry?.alert?.severity,
        alertCondition: searchEntry?.alert_condition,
        alertThreshold: searchEntry?.alert_threshold,
        alertComparator: searchEntry?.alert_comparator,
        actions: searchEntry?.actions,
        disabled: searchEntry?.disabled,
    };

    const triggers = firedEntries.map((e: any) => ({
        triggerTime: e.published,
        sid: e.content?.sid,
        resultCount: e.content?.triggered_alerts,
        severity: e.content?.severity,
    }));

    return {
        content: [{ type: "text", text: JSON.stringify({ config: alertConfig, recentTriggers: triggers }, null, 2) }],
    };
}
