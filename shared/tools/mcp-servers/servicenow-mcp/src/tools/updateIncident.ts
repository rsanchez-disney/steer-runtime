import { apiClient } from "../utils/apiClient.js";

export const updateIncidentSchema = {
    name: "update_incident",
    description: "Update arbitrary fields on a ServiceNow incident (JSON input)",
    inputSchema: {
        type: "object",
        properties: {
            incidentNumber: { type: "string", description: "The incident number" },
            fieldsJson: { type: "string", description: 'JSON string of field names and values (e.g. \'{"priority": "2"}\')' },
        },
        required: ["incidentNumber", "fieldsJson"],
    },
};

export async function handleUpdateIncident(args: any) {
    const { incidentNumber, fieldsJson } = args;
    const incSysId = await apiClient.getSysId("incident", "number", incidentNumber);
    const fields = JSON.parse(fieldsJson);
    await apiClient.patch(`/table/incident/${incSysId}`, fields);
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", incident: incidentNumber, updated_fields: Object.keys(fields), message: "Incident updated" }) }],
    };
}
