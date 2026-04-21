import { apiClient } from "../utils/apiClient.js";

export const getTiersSchema = {
    name: "get_tiers",
    description: "List all tiers for an application",
    inputSchema: {
        type: "object",
        properties: {
            appName: {
                type: "string",
                description: "The application name in AppDynamics",
            },
        },
        required: ["appName"],
    },
};

export async function handleGetTiers(args: any) {
    const { appName } = args;
    const data = await apiClient.restGet(`/applications/${appName}/tiers`);

    const tiers = Array.isArray(data)
        ? data.map((t: any) => ({
              id: t.id,
              name: t.name,
              numberOfNodes: t.numberOfNodes,
          }))
        : data;

    return {
        content: [{ type: "text", text: JSON.stringify(tiers, null, 2) }],
    };
}
