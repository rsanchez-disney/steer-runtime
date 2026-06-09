import { apiClient } from "../utils/apiClient.js";

export const getTopCrashesSchema = {
    name: "get_top_crashes",
    description: "Get top N crashes for a specific app version and segment. Returns crash signatures with occurrence counts.",
    inputSchema: {
        type: "object",
        properties: {
            appVersion: { type: "string", description: "App version (e.g., 5.44.0)" },
            platform: { type: "string", enum: ["iOS", "Android"], description: "Platform" },
            buildVariant: { type: "string", description: "Build variant: AppStore (iOS) or release (Android)" },
            segment: { type: "string", enum: ["Total", "AtHome", "Onboard"], description: "Experience segment" },
            since: { type: "string", description: "Start datetime (e.g., '2026-04-28 12:00:00')" },
            limit: { type: "number", description: "Number of top crashes (default 3)", default: 3 },
            appBuild: { type: "string", description: "Android appBuild (optional)" },
            buildNumber: { type: "string", description: "Android buildNumber (optional)" },
        },
        required: ["appVersion", "platform", "segment", "since"],
    },
};

export async function handleGetTopCrashes(args: any) {
    const { appVersion, platform, buildVariant, segment, since, limit = 3, appBuild, buildNumber } = args;

    let where = `appVersion = '${appVersion}'`;
    if (buildVariant) where += ` AND buildVariant = '${buildVariant}'`;
    if (appBuild) where += ` AND appBuild = '${appBuild}'`;
    if (buildNumber) where += ` AND buildNumber = '${buildNumber}'`;

    if (segment === "AtHome") {
        where += ` AND experience = 'AtHome'`;
    } else if (segment === "Onboard") {
        where += ` AND experience = 'Onboard'`;
    }

    const osFilter = platform === "iOS" ? "iOS" : "Android";
    where += ` AND osName = '${osFilter}'`;

    const query = `SELECT count(*) FROM MobileCrash WHERE ${where} SINCE '${since}' FACET crashException, crashMessage LIMIT ${limit}`;

    const data = await apiClient.nrql(query);
    const results = data?.data?.actor?.account?.nrql?.results;
    return {
        content: [{ type: "text", text: JSON.stringify({ platform, appVersion, segment, topCrashes: results ?? data }, null, 2) }],
    };
}
