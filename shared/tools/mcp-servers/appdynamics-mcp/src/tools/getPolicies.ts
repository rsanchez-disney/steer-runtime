import { apiClient } from "../utils/apiClient.js";

export const getPoliciesSchema = {
    name: "get_policies",
    description: "List health rule policies and their conditions for an application",
    inputSchema: {
        type: "object",
        properties: {
            appName: { type: "string", description: "The application name in AppDynamics" },
        },
        required: ["appName"],
    },
};

export async function handleGetPolicies(args: any) {
    const { appName } = args;
    const appId = await apiClient.resolveAppId(appName);

    const data = await apiClient.rawGet(
        `/controller/healthrules/${appId}`,
    );

    if (Array.isArray(data)) {
        const policies = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            enabled: p.enabled,
            affectedEntityType: p.affectedEntityType,
            criticalCondition: p.criticalExecutionCriteria?.policyCondition?.type,
            warningCondition: p.warningExecutionCriteria?.policyCondition?.type,
        }));

        return {
            content: [{ type: "text", text: JSON.stringify({ application: appName, policyCount: policies.length, policies }, null, 2) }],
        };
    }

    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
