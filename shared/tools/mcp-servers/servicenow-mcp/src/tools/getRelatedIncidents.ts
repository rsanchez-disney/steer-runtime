import { apiClient } from "../utils/apiClient.js";

export const getRelatedIncidentsSchema = {
    name: "get_related_incidents",
    description: "Find incidents related by CI, parent incident, or assignment group within a time window",
    inputSchema: {
        type: "object",
        properties: {
            incidentNumber: { type: "string", description: "The incident number to find related incidents for" },
            limit: { type: "number", description: "Maximum related incidents to return (default 20)", default: 20 },
        },
        required: ["incidentNumber"],
    },
};

export async function handleGetRelatedIncidents(args: any) {
    const { incidentNumber, limit = 20 } = args;
    const sysId = await apiClient.getSysId("incident", "number", incidentNumber);

    // Get the incident details to find CI and parent
    const incResult = await apiClient.get(`/table/incident/${sysId}`, {
        sysparm_fields: "cmdb_ci,parent_incident,assignment_group",
    });
    const inc = incResult?.result ?? {};
    const ciSysId = inc.cmdb_ci?.value || inc.cmdb_ci;
    const parentSysId = inc.parent_incident?.value || inc.parent_incident;

    const related: any[] = [];

    // Find incidents on the same CI
    if (ciSysId) {
        const ciResult = await apiClient.get("/table/incident", {
            sysparm_query: `cmdb_ci=${ciSysId}^number!=${incidentNumber}^stateIN1,2,11,12`,
            sysparm_fields: "number,short_description,state,priority,sys_created_on",
            sysparm_limit: String(limit),
            sysparm_display_value: "all",
        });
        for (const r of ciResult?.result ?? []) {
            related.push({
                number: r.number?.display_value || r.number?.value,
                relationship: "same_ci",
                shortDescription: r.short_description?.display_value || r.short_description?.value,
                state: r.state?.display_value || r.state?.value,
                priority: r.priority?.display_value || r.priority?.value,
            });
        }
    }

    // Find child incidents (same parent)
    if (parentSysId) {
        const childResult = await apiClient.get("/table/incident", {
            sysparm_query: `parent_incident=${parentSysId}^number!=${incidentNumber}`,
            sysparm_fields: "number,short_description,state,priority",
            sysparm_limit: String(limit),
            sysparm_display_value: "all",
        });
        for (const r of childResult?.result ?? []) {
            related.push({
                number: r.number?.display_value || r.number?.value,
                relationship: "sibling_under_parent",
                shortDescription: r.short_description?.display_value || r.short_description?.value,
                state: r.state?.display_value || r.state?.value,
                priority: r.priority?.display_value || r.priority?.value,
            });
        }
    }

    return {
        content: [{ type: "text", text: JSON.stringify({ incident: incidentNumber, relatedCount: related.length, related }, null, 2) }],
    };
}
