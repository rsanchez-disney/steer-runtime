import { apiClient } from "../utils/apiClient.js";

export const getErrorsSchema = {
    name: "get_errors",
    description: "List specific error types with counts for an application within a time range",
    inputSchema: {
        type: "object",
        properties: {
            appName: { type: "string", description: "The application name in AppDynamics" },
            durationMinutes: { type: "number", description: "How many minutes back to check (default 60)", default: 60 },
        },
        required: ["appName"],
    },
};

export async function handleGetErrors(args: any) {
    const { appName, durationMinutes = 60 } = args;

    // Get error metric data per error type using wildcard
    const data = await apiClient.restGet(`/applications/${appName}/metric-data`, {
        "metric-path": "Errors|*|Errors per Minute",
        "time-range-type": "BEFORE_NOW",
        "duration-in-mins": String(durationMinutes),
        rollup: "true",
    });

    if (Array.isArray(data)) {
        const errors = data
            .filter((m: any) => m.metricValues?.length > 0 && m.metricValues[0].sum > 0)
            .map((m: any) => ({
                metricPath: m.metricPath,
                errorName: m.metricPath?.split("|")?.[1] || "unknown",
                totalErrors: m.metricValues[0].sum,
                errorsPerMinute: m.metricValues[0].value,
                maxPerMinute: m.metricValues[0].max,
            }))
            .sort((a: any, b: any) => b.totalErrors - a.totalErrors);

        return {
            content: [{ type: "text", text: JSON.stringify({ application: appName, durationMinutes, errorCount: errors.length, errors }, null, 2) }],
        };
    }

    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
