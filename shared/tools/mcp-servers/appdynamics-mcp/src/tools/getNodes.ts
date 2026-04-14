import { apiClient } from "../utils/apiClient.js";

export const getNodesSchema = {
    name: "get_nodes",
    description: "List nodes for an application, optionally filtered by tier",
    inputSchema: {
        type: "object",
        properties: {
            appName: {
                type: "string",
                description: "The application name in AppDynamics",
            },
            tierName: {
                type: "string",
                description: "Optional tier name to filter nodes",
            },
        },
        required: ["appName"],
    },
};

export async function handleGetNodes(args: any) {
    const { appName, tierName } = args;
    const path = tierName
        ? `/applications/${appName}/tiers/${tierName}/nodes`
        : `/applications/${appName}/nodes`;

    const data = await apiClient.restGet(path);

    const nodes = Array.isArray(data)
        ? data.map((n: any) => ({
              id: n.id,
              name: n.name,
              tierName: n.tierName,
              machineName: n.machineName,
              machineAgentPresent: n.machineAgentPresent,
          }))
        : data;

    return {
        content: [{ type: "text", text: JSON.stringify(nodes, null, 2) }],
    };
}
