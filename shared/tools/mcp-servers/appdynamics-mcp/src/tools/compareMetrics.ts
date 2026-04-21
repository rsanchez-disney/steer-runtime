import { apiClient } from "../utils/apiClient.js";

export const compareMetricsSchema = {
    name: "compare_metrics",
    description: "Compare the same metric across two time ranges (e.g. before/after deployment, this hour vs last hour)",
    inputSchema: {
        type: "object",
        properties: {
            appName: { type: "string", description: "The application name in AppDynamics" },
            metricPath: { type: "string", description: "The metric path to compare" },
            currentDurationMinutes: { type: "number", description: "Current window duration in minutes (default 60)", default: 60 },
            baselineDurationMinutes: { type: "number", description: "Baseline window duration in minutes (default 60)", default: 60 },
            baselineOffsetMinutes: { type: "number", description: "How far back the baseline starts (default 1440 = 24h ago)", default: 1440 },
        },
        required: ["appName", "metricPath"],
    },
};

export async function handleCompareMetrics(args: any) {
    const { appName, metricPath, currentDurationMinutes = 60, baselineDurationMinutes = 60, baselineOffsetMinutes = 1440 } = args;

    // Current window
    const currentData = await apiClient.restGet(`/applications/${appName}/metric-data`, {
        "metric-path": metricPath,
        "time-range-type": "BEFORE_NOW",
        "duration-in-mins": String(currentDurationMinutes),
        rollup: "true",
    });

    // Baseline window
    const now = Date.now();
    const baselineEnd = now - baselineOffsetMinutes * 60 * 1000;
    const baselineStart = baselineEnd - baselineDurationMinutes * 60 * 1000;

    const baselineData = await apiClient.restGet(`/applications/${appName}/metric-data`, {
        "metric-path": metricPath,
        "time-range-type": "BETWEEN_TIMES",
        "start-time": String(baselineStart),
        "end-time": String(baselineEnd),
        rollup: "true",
    });

    const currentValues = Array.isArray(currentData) && currentData[0]?.metricValues?.[0];
    const baselineValues = Array.isArray(baselineData) && baselineData[0]?.metricValues?.[0];

    const comparison: any = {
        application: appName,
        metricPath,
        current: {
            window: `last ${currentDurationMinutes} minutes`,
            value: currentValues?.value ?? null,
            sum: currentValues?.sum ?? null,
            count: currentValues?.count ?? null,
            min: currentValues?.min ?? null,
            max: currentValues?.max ?? null,
        },
        baseline: {
            window: `${baselineOffsetMinutes} minutes ago, ${baselineDurationMinutes} min duration`,
            value: baselineValues?.value ?? null,
            sum: baselineValues?.sum ?? null,
            count: baselineValues?.count ?? null,
            min: baselineValues?.min ?? null,
            max: baselineValues?.max ?? null,
        },
    };

    // Calculate deviation
    if (currentValues?.value != null && baselineValues?.value != null && baselineValues.value > 0) {
        comparison.deviation = {
            ratio: +(currentValues.value / baselineValues.value).toFixed(2),
            percentChange: +(((currentValues.value - baselineValues.value) / baselineValues.value) * 100).toFixed(1),
        };
    }

    return {
        content: [{ type: "text", text: JSON.stringify(comparison, null, 2) }],
    };
}
