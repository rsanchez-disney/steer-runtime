import { apiClient } from "../utils/apiClient.js";

export const getAdoptionRateSchema = {
    name: "get_adoption_rate",
    description: "Get adoption rate for a specific app version — percentage of sessions on this version vs all versions.",
    inputSchema: {
        type: "object",
        properties: {
            appVersion: { type: "string", description: "App version (e.g., 5.44.0)" },
            platform: { type: "string", enum: ["iOS", "Android"], description: "Platform" },
            since: { type: "string", description: "Start datetime (e.g., '2026-04-28 12:00:00')" },
        },
        required: ["appVersion", "platform", "since"],
    },
};

export async function handleGetAdoptionRate(args: any) {
    const { appVersion, platform, since } = args;
    const osFilter = platform === "iOS" ? "iOS" : "Android";

    const query = `SELECT percentage(count(*), WHERE appVersion = '${appVersion}') as adoptionRate, filter(count(*), WHERE appVersion = '${appVersion}') as versionSessions, count(*) as totalSessions FROM MobileSession WHERE osName = '${osFilter}' SINCE '${since}'`;

    const data = await apiClient.nrql(query);
    const results = data?.data?.actor?.account?.nrql?.results;
    return {
        content: [{ type: "text", text: JSON.stringify({ platform, appVersion, adoption: results ?? data }, null, 2) }],
    };
}
