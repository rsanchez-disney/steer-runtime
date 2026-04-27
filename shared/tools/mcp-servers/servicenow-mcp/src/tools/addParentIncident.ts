import { apiClient } from "../utils/apiClient.js";

export const addParentIncidentSchema = {
    name: "add_parent_incident",
    description: "Link a child incident to a parent incident",
    inputSchema: {
        type: "object",
        properties: {
            incidentNumber: { type: "string", description: "The child incident number" },
            parentIncidentNumber: { type: "string", description: "The parent incident number" },
        },
        required: ["incidentNumber", "parentIncidentNumber"],
    },
};

export async function handleAddParentIncident(args: any) {
    const { incidentNumber, parentIncidentNumber } = args;
    const incSysId = await apiClient.getSysId("incident", "number", incidentNumber);
    const parentSysId = await apiClient.getSysId("incident", "number", parentIncidentNumber);
    await apiClient.patch(`/table/incident/${incSysId}`, { parent_incident: parentSysId });
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", incident: incidentNumber, parent_incident: parentIncidentNumber, message: "Parent incident linked" }) }],
    };
}
