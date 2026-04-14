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

    let fields: Record<string, any>;
    try {
        fields = JSON.parse(fieldsJson);
    } catch {
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "error", incident: incidentNumber, message: `Invalid JSON in fieldsJson: ${fieldsJson}` }) }],
        };
    }

    if (!fields || typeof fields !== "object" || Array.isArray(fields) || !Object.keys(fields).length) {
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "error", incident: incidentNumber, message: "fieldsJson must be a non-empty JSON object (e.g. '{\"priority\": \"2\"}')." }) }],
        };
    }

    const incSysId = await apiClient.getSysId("incident", "number", incidentNumber);
    await apiClient.patch(`/table/incident/${incSysId}`, fields);
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", incident: incidentNumber, updated_fields: Object.keys(fields), message: "Incident updated" }) }],
    };
}
