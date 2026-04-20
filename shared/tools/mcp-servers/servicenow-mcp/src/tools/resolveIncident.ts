import { apiClient } from "../utils/apiClient.js";

export const resolveIncidentSchema = {
    name: "resolve_incident",
    description: "Resolve a ServiceNow incident with close notes and close code",
    inputSchema: {
        type: "object",
        properties: {
            incidentNumber: { type: "string", description: "The incident number" },
            closeNotes: { type: "string", description: "Notes explaining the resolution" },
            closeCode: { type: "string", description: "The close code (default: Closed/Resolved by caller)" },
            causedByChange: { type: "string", description: "The caused-by change number (default: CHG_NOCHG)" },
        },
        required: ["incidentNumber", "closeNotes"],
    },
};

export async function handleResolveIncident(args: any) {
    const {
        incidentNumber,
        closeNotes,
        closeCode = "Closed/Resolved by caller",
        causedByChange = "CHG_NOCHG",
    } = args;

    const incSysId = await apiClient.getSysId("incident", "number", incidentNumber);
    const updateData: Record<string, string> = {
        state: "6", // Resolved
        close_notes: closeNotes,
        close_code: closeCode,
    };

    if (causedByChange && causedByChange !== "CHG_NOCHG") {
        try {
            const chgSysId = await apiClient.getSysId("change_request", "number", causedByChange);
            updateData.caused_by = chgSysId;
        } catch {
            // If CHG not found, skip it
        }
    }

    await apiClient.patch(`/table/incident/${incSysId}`, updateData);
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", incident: incidentNumber, state: "Resolved", close_notes: closeNotes, message: "Incident resolved" }) }],
    };
}
