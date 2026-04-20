import { apiClient } from "../utils/apiClient.js";

export const getIncidentTimelineSchema = {
    name: "get_incident_timeline",
    description: "Get the full activity timeline for an incident (state changes, assignments, work notes, comments)",
    inputSchema: {
        type: "object",
        properties: {
            incidentNumber: { type: "string", description: "The incident number (e.g. INC28844834)" },
            limit: { type: "number", description: "Maximum timeline entries (default 100)", default: 100 },
        },
        required: ["incidentNumber"],
    },
};

export async function handleGetIncidentTimeline(args: any) {
    const { incidentNumber, limit = 100 } = args;
    const sysId = await apiClient.getSysId("incident", "number", incidentNumber);

    // Get audit history (state changes, field updates)
    const auditResult = await apiClient.get("/table/sys_audit", {
        sysparm_query: `documentkey=${sysId}^ORDERBYDESCsys_created_on`,
        sysparm_fields: "fieldname,oldvalue,newvalue,sys_created_on,user",
        sysparm_limit: String(limit),
        sysparm_display_value: "true",
    });

    const auditEntries = (auditResult?.result ?? []).map((e: any) => ({
        timestamp: e.sys_created_on?.display_value || e.sys_created_on,
        field: e.fieldname?.display_value || e.fieldname,
        oldValue: e.oldvalue?.display_value || e.oldvalue,
        newValue: e.newvalue?.display_value || e.newvalue,
        user: e.user?.display_value || e.user,
        type: "field_change",
    }));

    // Get journal entries (work notes + comments)
    const journalResult = await apiClient.get("/table/sys_journal_field", {
        sysparm_query: `element_id=${sysId}^elementINwork_notes,comments^ORDERBYDESCsys_created_on`,
        sysparm_fields: "value,element,sys_created_on,sys_created_by",
        sysparm_limit: String(limit),
    });

    const journalEntries = (journalResult?.result ?? []).map((e: any) => ({
        timestamp: e.sys_created_on,
        field: e.element,
        newValue: (e.value || "").substring(0, 500),
        user: e.sys_created_by,
        type: e.element === "work_notes" ? "work_note" : "comment",
    }));

    // Merge and sort by timestamp
    const timeline = [...auditEntries, ...journalEntries]
        .sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));

    return {
        content: [{ type: "text", text: JSON.stringify({ incident: incidentNumber, entryCount: timeline.length, timeline }, null, 2) }],
    };
}
