import { apiClient } from "../utils/apiClient.js";

export const getErrorRateSchema = {
    name: "get_error_rate",
    description: "Get the overall error rate and error count for an application",
    inputSchema: {
        type: "object",
        properties: {
            appName: {
                type: "string",
                description: "The application name in AppDynamics",
            },
            durationMinutes: {
                type: "number",
                description: "How many minutes of data to retrieve (default 60)",
                default: 60,
            },
        },
        required: ["appName"],
    },
};

export async function handleGetErrorRate(args: any) {
    const { appName, durationMinutes = 60 } = args;
    const params = {
        "time-range-type": "BEFORE_NOW",
        "duration-in-mins": String(durationMinutes),
        rollup: "true",
    };

    const errors = await apiClient.restGet(`/applications/${appName}/metric-data`, {
        ...params,
        "metric-path": "Overall Application Performance|Number of Errors",
    });

    const calls = await apiClient.restGet(`/applications/${appName}/metric-data`, {
        ...params,
        "metric-path": "Overall Application Performance|Number of Calls",
    });

    const result = {
        application: appName,
        duration_minutes: durationMinutes,
        errors,
        calls,
    };

    return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
}
