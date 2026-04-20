import { apiClient } from "../utils/apiClient.js";

export const getCiDetailsSchema = {
    name: "get_ci_details",
    description: "Get Configuration Item details including owner, environment, class, and relationships",
    inputSchema: {
        type: "object",
        properties: {
            ciName: { type: "string", description: "The CI name (e.g. 'DLR Capacity Managed Events')" },
        },
        required: ["ciName"],
    },
};

export async function handleGetCiDetails(args: any) {
    const { ciName } = args;

    const result = await apiClient.get("/table/cmdb_ci", {
        sysparm_query: `name=${ciName}`,
        sysparm_fields: "sys_id,name,sys_class_name,operational_status,environment,owned_by,managed_by,support_group,business_criticality,short_description",
        sysparm_limit: "1",
        sysparm_display_value: "true",
    });

    const records = result?.result ?? [];
    if (!records.length) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: `CI '${ciName}' not found` }) }],
        };
    }

    const ci = records[0];
    return {
        content: [{ type: "text", text: JSON.stringify({
            name: ci.name,
            className: ci.sys_class_name,
            operationalStatus: ci.operational_status,
            environment: ci.environment,
            ownedBy: ci.owned_by?.display_value ?? ci.owned_by,
            managedBy: ci.managed_by?.display_value ?? ci.managed_by,
            supportGroup: ci.support_group?.display_value ?? ci.support_group,
            businessCriticality: ci.business_criticality,
            description: ci.short_description,
        }, null, 2) }],
    };
}
