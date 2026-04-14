import { apiClient } from "../utils/apiClient.js";

export const getSnapshotsSchema = {
    name: "get_snapshots",
    description: "Get recent transaction snapshots for an application (slow/error transactions)",
    inputSchema: {
        type: "object",
        properties: {
            appName: {
                type: "string",
                description: "The application name in AppDynamics",
            },
            durationMinutes: {
                type: "number",
                description: "How many minutes back to search (default 30)",
                default: 30,
            },
            maxResults: {
                type: "number",
                description: "Maximum number of snapshots to return (default 20)",
                default: 20,
            },
        },
        required: ["appName"],
    },
};

export async function handleGetSnapshots(args: any) {
    const { appName, durationMinutes = 30, maxResults = 20 } = args;

    const data = await apiClient.restGet(`/applications/${appName}/request-snapshots`, {
        "time-range-type": "BEFORE_NOW",
        "duration-in-mins": String(durationMinutes),
        "maximum-results": String(maxResults),
    });

    if (Array.isArray(data)) {
        const snaps = data.map((s: any) => ({
            id: s.id,
            businessTransactionName: s.businessTransactionName,
            URL: s.URL,
            timeTakenInMilliSecs: s.timeTakenInMilliSecs,
            errorOccurred: s.errorOccurred,
            userExperience: s.userExperience,
        }));
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ count: snaps.length, snapshots: snaps }, null, 2),
                },
            ],
        };
    }

    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
