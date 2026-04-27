import { apiClient } from "../utils/apiClient.js";

export const getDashboardsSchema = {
    name: "get_dashboards",
    description: "List custom dashboards in AppDynamics",
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};

export async function handleGetDashboards() {
    const data = await apiClient.rawGet("/controller/restui/dashboards/getAllDashboardsByType/false");

    if (Array.isArray(data)) {
        const dashboards = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            createdBy: d.createdBy,
            modifiedOn: d.modifiedOn,
        }));

        return {
            content: [{ type: "text", text: JSON.stringify({ count: dashboards.length, dashboards }, null, 2) }],
        };
    }

    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
