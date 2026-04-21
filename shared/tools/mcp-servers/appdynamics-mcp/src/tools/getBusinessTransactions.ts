import { apiClient } from "../utils/apiClient.js";

export const getBusinessTransactionsSchema = {
    name: "get_business_transactions",
    description: "List all business transactions for an application",
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

export async function handleGetBusinessTransactions(args: any) {
    const { appName } = args;
    const data = await apiClient.restGet(`/applications/${appName}/business-transactions`);

    const bts = Array.isArray(data)
        ? data.map((bt: any) => ({
              id: bt.id,
              name: bt.name,
              tierName: bt.tierName,
              entryPointType: bt.entryPointType,
          }))
        : data;

    return {
        content: [{ type: "text", text: JSON.stringify(bts, null, 2) }],
    };
}
