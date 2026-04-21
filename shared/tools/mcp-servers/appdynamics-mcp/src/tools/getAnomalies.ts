import { apiClient } from "../utils/apiClient.js";

export const getAnomaliesSchema = {
    name: "get_anomalies",
    description:
        "Get anomaly violations detected by AppDynamics AI for an application, including suspected root causes. Requires controller version 26.x+.",
    inputSchema: {
        type: "object",
        properties: {
            appName: {
                type: "string",
                description: "The application name in AppDynamics",
            },
            durationHours: {
                type: "number",
                description: "How many hours back to check for anomalies (default 24)",
                default: 24,
            },
            includeSuspectedCauses: {
                type: "boolean",
                description: "Whether to include AI-determined suspected causes (default true)",
                default: true,
            },
        },
        required: ["appName"],
    },
};

export async function handleGetAnomalies(args: any) {
    const { appName, durationHours = 24, includeSuspectedCauses = true } = args;
    const appId = await apiClient.resolveAppId(appName);

    const now = Date.now();
    const start = now - durationHours * 60 * 60 * 1000;

    let data: any;
    try {
        data = await apiClient.rawGet(
            `/controller/anomaly/rest/api/v1/applications/${appId}/anomalies`,
            {
                startTime: String(start),
                endTime: String(now),
                fetchSuspectedCause: String(includeSuspectedCauses),
            },
        );
    } catch (err: any) {
        if (err.message?.includes("404")) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(
                            {
                                application: appName,
                                app_id: appId,
                                error: "Anomaly Detection API not available",
                                message:
                                    "The Anomaly Detection API endpoint returned 404. This typically means " +
                                    "anomaly detection is not enabled on this controller or the controller " +
                                    "version does not support this API.",
                            },
                            null,
                            2,
                        ),
                    },
                ],
            };
        }
        throw err;
    }

    const violations = data?.violationListItem ?? [];

    const anomalies = violations.map((v: any) => {
        const anomaly: any = {
            id: v.id,
            status: v.status,
            description: v.description,
            startTime: v.startTime,
            endTime: v.endTime,
            duration_ms: v.duration,
            affectedEntityName: v.affectedEntityName,
            affectedEntityType: v.affectedEntityType,
        };

        if (includeSuspectedCauses && v.eventDetailMap) {
            anomaly.events = Object.entries(v.eventDetailMap).map(
                ([eventId, event]: [string, any]) => ({
                    eventId,
                    severity: event.eventSeverity,
                    type: event.eventType,
                    summary: event.eventSummary,
                    suspectedCauses: (event.suspectedCauses ?? []).map((cause: any) => ({
                        entityName: cause.entityName,
                        entityType: cause.entityType,
                        rcaSummary: cause.rcaSummary,
                        metrics: (cause.affectedEntityMetricIds ?? []).map(
                            (m: any) => m.metricName,
                        ),
                    })),
                }),
            );
        }

        return anomaly;
    });

    const active = anomalies.filter((a: any) => a.status === "OPEN");
    const resolved = anomalies.filter((a: any) => a.status === "RESOLVED");
    const withCauses = anomalies.filter(
        (a: any) =>
            a.events?.some((e: any) => e.suspectedCauses?.length > 0),
    );

    const result = {
        application: appName,
        app_id: appId,
        duration_hours: durationHours,
        summary: {
            total_anomalies: anomalies.length,
            active: active.length,
            resolved: resolved.length,
            with_suspected_causes: withCauses.length,
        },
        anomalies,
    };

    return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
}
