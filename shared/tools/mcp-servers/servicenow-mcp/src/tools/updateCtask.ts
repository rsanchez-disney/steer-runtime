import { apiClient } from "../utils/apiClient.js";

export const updateCtaskSchema = {
    name: "update_ctask",
    description: "Update arbitrary fields on a CTASK (JSON input)",
    inputSchema: {
        type: "object",
        properties: {
            ctaskNumber: { type: "string", description: "The CTASK number (e.g. CTASK1234567)" },
            fieldsJson: { type: "string", description: 'JSON string of field names and values to update' },
        },
        required: ["ctaskNumber", "fieldsJson"],
    },
};

export async function handleUpdateCtask(args: any) {
    const { ctaskNumber, fieldsJson } = args;
    const sysId = await apiClient.getSysId("change_task", "number", ctaskNumber);
    const fields = JSON.parse(fieldsJson);
    await apiClient.patch(`/table/change_task/${sysId}`, fields);
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", ctask: ctaskNumber, updated_fields: Object.keys(fields), message: "CTASK updated" }) }],
    };
}
