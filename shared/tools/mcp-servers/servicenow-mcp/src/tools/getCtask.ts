import { apiClient } from "../utils/apiClient.js";

export const getCtaskSchema = {
    name: "get_ctask",
    description: "Get CTASK details by number",
    inputSchema: {
        type: "object",
        properties: {
            ctaskNumber: { type: "string", description: "The CTASK number (e.g. CTASK1234567)" },
        },
        required: ["ctaskNumber"],
    },
};

export async function handleGetCtask(args: any) {
    const { ctaskNumber } = args;
    const sysId = await apiClient.getSysId("change_task", "number", ctaskNumber);
    const result = await apiClient.get(`/table/change_task/${sysId}`, {
        sysparm_display_value: "true",
    });
    const r = result?.result ?? {};
    const fields = {
        number: r.number,
        short_description: r.short_description,
        state: r.state,
        assignment_group: r.assignment_group?.display_value ?? "",
        assigned_to: r.assigned_to?.display_value ?? "",
        change_request: r.change_request?.display_value ?? "",
        sys_created_on: r.sys_created_on,
    };
    return { content: [{ type: "text", text: JSON.stringify(fields, null, 2) }] };
}
