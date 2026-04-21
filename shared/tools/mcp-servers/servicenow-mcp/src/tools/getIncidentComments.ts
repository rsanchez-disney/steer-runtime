import { apiClient } from "../utils/apiClient.js";

export const getIncidentCommentsSchema = {
    name: "get_incident_comments",
    description: "Get all comments and work notes history for an incident",
    inputSchema: {
        type: "object",
        properties: {
            incidentNumber: { type: "string", description: "The incident number (e.g. INC28844834)" },
            limit: { type: "number", description: "Maximum entries to return (default 50)", default: 50 },
        },
        required: ["incidentNumber"],
    },
};

export async function handleGetIncidentComments(args: any) {
    const { incidentNumber, limit = 50 } = args;
    const sysId = await apiClient.getSysId("incident", "number", incidentNumber);

    const result = await apiClient.get("/table/sys_journal_field", {
        sysparm_query: `element_id=${sysId}^elementINwork_notes,comments^ORDERBYDESCsys_created_on`,
        sysparm_fields: "value,element,sys_created_on,sys_created_by",
        sysparm_limit: String(limit),
        sysparm_display_value: "all",
    });

    const entries = (result?.result ?? []).map((e: any) => ({
        type: e.element?.display_value || e.element?.value,
        createdOn: e.sys_created_on?.display_value || e.sys_created_on?.value,
        createdBy: e.sys_created_by?.display_value || e.sys_created_by?.value,
        text: e.value?.display_value || e.value?.value,
    }));

    return {
        content: [{ type: "text", text: JSON.stringify({ incident: incidentNumber, count: entries.length, entries }, null, 2) }],
    };
}
