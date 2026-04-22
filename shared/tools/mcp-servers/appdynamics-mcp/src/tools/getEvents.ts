import { apiClient } from "../utils/apiClient.js";

export const getEventsSchema = {
    name: "get_events",
    description: "Get application events (deployments, config changes, alerts, app crashes) within a time range",
    inputSchema: {
        type: "object",
        properties: {
            appName: { type: "string", description: "The application name in AppDynamics" },
            durationMinutes: { type: "number", description: "How many minutes back to check (default 60)", default: 60 },
            eventTypes: { type: "string", description: "Comma-separated event types (default: APPLICATION_DEPLOYMENT,APPLICATION_CONFIG_CHANGE,APP_SERVER_RESTART)", default: "APPLICATION_DEPLOYMENT,APPLICATION_CONFIG_CHANGE,APP_SERVER_RESTART" },
            severities: { type: "string", description: "Comma-separated severities (default: INFO,WARN,ERROR)", default: "INFO,WARN,ERROR" },
        },
        required: ["appName"],
    },
};

export async function handleGetEvents(args: any) {
    const {
        appName,
        durationMinutes = 60,
        eventTypes = "APPLICATION_DEPLOYMENT,APPLICATION_CONFIG_CHANGE,APP_SERVER_RESTART",
        severities = "INFO,WARN,ERROR",
    } = args;

    const now = Date.now();
    const start = now - durationMinutes * 60 * 1000;

    const data = await apiClient.restGet(`/applications/${appName}/events`, {
        "time-range-type": "BETWEEN_TIMES",
        "start-time": String(start),
        "end-time": String(now),
        "event-types": eventTypes,
        severities,
    });

    if (Array.isArray(data)) {
        const events = data.map((e: any) => ({
            id: e.id,
            type: e.type,
            subType: e.subType,
            severity: e.severity,
            summary: e.summary,
            eventTime: e.eventTime,
            affectedEntities: e.affectedEntities?.map((ae: any) => ({
                name: ae.name,
                type: ae.entityType,
            })),
        }));

        return {
            content: [{ type: "text", text: JSON.stringify({ application: appName, durationMinutes, eventCount: events.length, events }, null, 2) }],
        };
    }

    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
