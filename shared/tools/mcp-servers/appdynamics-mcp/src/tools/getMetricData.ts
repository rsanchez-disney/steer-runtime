import { apiClient } from "../utils/apiClient.js";

export const getMetricDataSchema = {
    name: "get_metric_data",
    description: "Query a specific metric from AppDynamics by its full metric path",
    inputSchema: {
        type: "object",
        properties: {
            appName: {
                type: "string",
                description: "The application name in AppDynamics",
            },
            metricPath: {
                type: "string",
                description:
                    'The full metric path (e.g. "Overall Application Performance|Average Response Time (ms)")',
            },
            durationMinutes: {
                type: "number",
                description: "How many minutes of data to retrieve (default 60)",
                default: 60,
            },
            rollup: {
                type: "boolean",
                description: "Whether to rollup data into a single value (default true)",
                default: true,
            },
        },
        required: ["appName", "metricPath"],
    },
};

export async function handleGetMetricData(args: any) {
    const { appName, metricPath, durationMinutes = 60, rollup = true } = args;

    const data = await apiClient.restGet(`/applications/${appName}/metric-data`, {
        "metric-path": metricPath,
        "time-range-type": "BEFORE_NOW",
        "duration-in-mins": String(durationMinutes),
        rollup: String(rollup),
    });

    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
