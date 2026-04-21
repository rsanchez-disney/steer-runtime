import { apiClient } from "../utils/apiClient.js";

export const closeCtaskSchema = {
    name: "close_ctask",
    description: "Close a CTASK with close notes",
    inputSchema: {
        type: "object",
        properties: {
            ctaskNumber: { type: "string", description: "The CTASK number (e.g. CTASK1234567)" },
            closeNotes: { type: "string", description: "Notes explaining the closure (default: Validated and closed.)" },
        },
        required: ["ctaskNumber"],
    },
};

export async function handleCloseCtask(args: any) {
    const { ctaskNumber, closeNotes = "Validated and closed." } = args;
    const sysId = await apiClient.getSysId("change_task", "number", ctaskNumber);
    await apiClient.patch(`/table/change_task/${sysId}`, {
        state: "3", // Closed
        work_notes: closeNotes,
        close_notes: closeNotes,
    });
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", ctask: ctaskNumber, state: "Closed", message: "CTASK closed" }) }],
    };
}
