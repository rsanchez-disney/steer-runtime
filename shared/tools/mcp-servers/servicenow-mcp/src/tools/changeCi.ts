import { apiClient } from "../utils/apiClient.js";

export const changeCiSchema = {
    name: "change_ci",
    description: "Change the Configuration Item (CI) on a ServiceNow incident",
    inputSchema: {
        type: "object",
        properties: {
            incidentNumber: { type: "string", description: "The incident number (e.g. INC28829968)" },
            ciName: { type: "string", description: "The name of the CI to set" },
        },
        required: ["incidentNumber", "ciName"],
    },
};

export async function handleChangeCi(args: any) {
    const { incidentNumber, ciName } = args;
    const incSysId = await apiClient.getSysId("incident", "number", incidentNumber);
    const ciSysId = await apiClient.getSysIdByName("cmdb_ci", ciName);
    await apiClient.patch(`/table/incident/${incSysId}`, { cmdb_ci: ciSysId });
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", incident: incidentNumber, ci: ciName, message: "Configuration Item updated" }) }],
    };
}
