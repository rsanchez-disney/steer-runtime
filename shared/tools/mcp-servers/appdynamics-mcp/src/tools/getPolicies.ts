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

    // Use the v1 alerting REST API which returns JSON natively
    const data = await apiClient.rawGet(
        `/controller/alerting/rest/v1/applications/${appId}/health-rules`,
    );

    if (Array.isArray(data)) {
        const policies = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            enabled: p.enabled,
            affectedEntityType: p.affects?.affectedEntityType,
            criticalEnabled: p.evalCriterias?.criticalCriteria != null,
            warningEnabled: p.evalCriterias?.warningCriteria != null,
        }));

        return {
            content: [{ type: "text", text: JSON.stringify({ application: appName, policyCount: policies.length, policies }, null, 2) }],
        };
    }

    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
