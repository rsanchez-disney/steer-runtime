import { apiClient } from "../utils/apiClient.js";

export const getBackendsSchema = {
    name: "get_backends",
    description: "List backend/exit point calls (databases, HTTP services, queues) for an application",
    inputSchema: {
        type: "object",
        properties: {
            appName: { type: "string", description: "The application name in AppDynamics" },
        },
        required: ["appName"],
    },
};

export async function handleGetBackends(args: any) {
    const { appName } = args;
    const data = await apiClient.restGet(`/applications/${appName}/backends`);

    const backends = Array.isArray(data)
        ? data.map((b: any) => ({
              id: b.id,
              name: b.name,
              exitPointType: b.exitPointType,
              properties: b.properties,
          }))
        : data;

    return {
        content: [{ type: "text", text: JSON.stringify(backends, null, 2) }],
    };
}
