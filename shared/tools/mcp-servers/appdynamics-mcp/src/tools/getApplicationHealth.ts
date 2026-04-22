import { apiClient } from "../utils/apiClient.js";

export const getApplicationHealthSchema = {
    name: "get_application_health",
    description:
        "Get the overall health summary for an application. Returns health rule violations in the last hour.",
    inputSchema: {
        type: "object",
        properties: {
            appName: {
                type: "string",
                description: "The application name in AppDynamics",
            },
        },
        required: ["appName"],
    },
};

export async function handleGetApplicationHealth(args: any) {
    const { appName } = args;
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const violations = await apiClient.restGet(
        `/applications/${appName}/problems/healthrule-violations`,
        {
            "time-range-type": "BETWEEN_TIMES",
            "start-time": String(oneHourAgo),
            "end-time": String(now),
        },
    );

    const result = {
        application: appName,
        time_range: "last 1 hour",
        health_rule_violations: Array.isArray(violations) ? violations.length : 0,
        violations: Array.isArray(violations) ? violations : [],
    };

    return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
}
