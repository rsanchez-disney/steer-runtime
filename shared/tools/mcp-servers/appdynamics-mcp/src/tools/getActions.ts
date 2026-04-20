import { apiClient } from "../utils/apiClient.js";

export const getActionsSchema = {
    name: "get_actions",
    description: "List configured alert actions (email, webhook, SNMP, etc.) for an application",
    inputSchema: {
        type: "object",
        properties: {
            appName: { type: "string", description: "The application name in AppDynamics" },
        },
        required: ["appName"],
    },
};

export async function handleGetActions(args: any) {
    const { appName } = args;
    const appId = await apiClient.resolveAppId(appName);

    const data = await apiClient.rawGet(
        `/controller/actions/${appId}`,
    );

    if (Array.isArray(data)) {
        const actions = data.map((a: any) => ({
            id: a.id,
            name: a.name,
            actionType: a.actionType,
            emails: a.emails,
            httpRequestUrl: a.httpRequestUrl,
        }));

        return {
            content: [{ type: "text", text: JSON.stringify({ application: appName, actionCount: actions.length, actions }, null, 2) }],
        };
    }

    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
