import { apiClient } from "../utils/apiClient.js";

export const addWorkNoteSchema = {
    name: "add_work_note",
    description: "Add a work note to a ServiceNow incident",
    inputSchema: {
        type: "object",
        properties: {
            incidentNumber: { type: "string", description: "The incident number (e.g. INC28829968)" },
            workNote: { type: "string", description: "The work note text to add" },
        },
        required: ["incidentNumber", "workNote"],
    },
};

export async function handleAddWorkNote(args: any) {
    const { incidentNumber, workNote } = args;
    const sysId = await apiClient.getSysId("incident", "number", incidentNumber);
    await apiClient.patch(`/table/incident/${sysId}`, { work_notes: workNote });
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", incident: incidentNumber, message: "Work note added" }) }],
    };
}
