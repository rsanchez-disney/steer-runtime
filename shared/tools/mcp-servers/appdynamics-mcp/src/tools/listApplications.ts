import { apiClient } from "../utils/apiClient.js";

export const listApplicationsSchema = {
    name: "list_applications",
    description: "List all applications monitored by AppDynamics",
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};

export async function handleListApplications() {
    const data = await apiClient.restGet("/applications");
    const apps = Array.isArray(data)
        ? data.map((a: any) => ({ id: a.id, name: a.name }))
        : data;

    return {
        content: [{ type: "text", text: JSON.stringify(apps, null, 2) }],
    };
}
