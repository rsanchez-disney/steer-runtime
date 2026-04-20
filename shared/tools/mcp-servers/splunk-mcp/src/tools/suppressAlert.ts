import { apiClient } from "../utils/apiClient.js";

export const suppressAlertSchema = {
    name: "suppress_alert",
    description: "Temporarily disable (suppress) an alert. Use during maintenance windows or known issues to reduce noise. Can also re-enable. WARNING: This is a destructive operation — disabling an alert stops all notifications. Always confirm with the user before suppressing.",
    inputSchema: {
        type: "object",
        properties: {
            alertName: { type: "string", description: "Name of the alert (saved search name)" },
            app: { type: "string", description: "Splunk app containing the alert", default: "search" },
            action: { type: "string", description: "'disable' to suppress, 'enable' to re-enable", default: "disable" },
        },
        required: ["alertName"],
    },
};

export async function handleSuppressAlert(args: any) {
    const { alertName, app = "search", action = "disable" } = args;

    const disabled = action === "disable" ? "1" : "0";

    await apiClient.post(
        `/servicesNS/-/${app}/saved/searches/${encodeURIComponent(alertName)}`,
        { disabled },
    );

    return {
        content: [{ type: "text", text: JSON.stringify({
            status: "success",
            alert: alertName,
            action: action === "disable" ? "suppressed" : "re-enabled",
            message: action === "disable"
                ? `Alert '${alertName}' has been suppressed (disabled). Remember to re-enable after maintenance.`
                : `Alert '${alertName}' has been re-enabled.`,
        }, null, 2) }],
    };
}
