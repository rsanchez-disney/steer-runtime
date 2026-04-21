import { apiClient } from "../utils/apiClient.js";

export const addCtaskWorkNoteSchema = {
    name: "add_ctask_work_note",
    description: "Add a work note to a CTASK",
    inputSchema: {
        type: "object",
        properties: {
            ctaskNumber: { type: "string", description: "The CTASK number (e.g. CTASK1234567)" },
            workNote: { type: "string", description: "The work note text to add" },
        },
        required: ["ctaskNumber", "workNote"],
    },
};

export async function handleAddCtaskWorkNote(args: any) {
    const { ctaskNumber, workNote } = args;
    const sysId = await apiClient.getSysId("change_task", "number", ctaskNumber);
    await apiClient.patch(`/table/change_task/${sysId}`, { work_notes: workNote });
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", ctask: ctaskNumber, message: "Work note added to CTASK" }) }],
    };
}
