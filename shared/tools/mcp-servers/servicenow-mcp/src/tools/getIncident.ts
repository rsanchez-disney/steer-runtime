import { apiClient } from "../utils/apiClient.js";

export const getIncidentSchema = {
    name: "get_incident",
    description: "Get details of a ServiceNow incident by its number",
    inputSchema: {
        type: "object",
        properties: {
            incidentNumber: {
                type: "string",
                description: "The incident number (e.g. INC28829968)",
            },
        },
        required: ["incidentNumber"],
    },
};

export async function handleGetIncident(args: any) {
    const { incidentNumber } = args;
    const sysId = await apiClient.getSysId("incident", "number", incidentNumber);
    const result = await apiClient.get(`/table/incident/${sysId}`, {
        sysparm_display_value: "true",
    });
    const r = result?.result ?? {};
    const fields = {
        number: r.number,
        short_description: r.short_description,
        state: r.state,
        priority: r.priority,
        assignment_group: r.assignment_group?.display_value ?? "",
        assigned_to: r.assigned_to?.display_value ?? "",
        cmdb_ci: r.cmdb_ci?.display_value ?? "",
        parent_incident: r.parent_incident?.display_value ?? "",
        sys_created_on: r.sys_created_on,
    };
    return { content: [{ type: "text", text: JSON.stringify(fields, null, 2) }] };
}
