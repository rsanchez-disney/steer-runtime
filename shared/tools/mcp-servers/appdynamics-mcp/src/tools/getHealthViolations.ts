import { apiClient } from "../utils/apiClient.js";

export const getHealthViolationsSchema = {
    name: "get_health_violations",
    description: "Get health rule violations for an application within a time range",
    inputSchema: {
        type: "object",
        properties: {
            appName: {
                type: "string",
                description: "The application name in AppDynamics",
            },
            durationMinutes: {
                type: "number",
                description: "How many minutes back to check (default 60)",
                default: 60,
            },
        },
        required: ["appName"],
    },
};

export async function handleGetHealthViolations(args: any) {
    const { appName, durationMinutes = 60 } = args;
    const now = Date.now();
    const start = now - durationMinutes * 60 * 1000;

    const data = await apiClient.restGet(
        `/applications/${appName}/problems/healthrule-violations`,
        {
            "time-range-type": "BETWEEN_TIMES",
            "start-time": String(start),
            "end-time": String(now),
        },
    );

    if (Array.isArray(data)) {
        const violations = data.map((v: any) => ({
            id: v.id,
            name: v.name,
            severity: v.severity,
            status: v.status,
            startTimeInMillis: v.startTimeInMillis,
            detectedTimeInMillis: v.detectedTimeInMillis,
            affectedEntityName: v.affectedEntityDefinition?.name,
        }));
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ count: violations.length, violations }, null, 2),
                },
            ],
        };
    }

    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
