import { apiClient } from "../utils/apiClient.js";

export const getChangeRequestSchema = {
    name: "get_change_request",
    description: "Get change request details by number — useful for correlating incidents with recent changes",
    inputSchema: {
        type: "object",
        properties: {
            changeNumber: { type: "string", description: "The change request number (e.g. CHG1234567)" },
        },
        required: ["changeNumber"],
    },
};

export async function handleGetChangeRequest(args: any) {
    const { changeNumber } = args;
    const sysId = await apiClient.getSysId("change_request", "number", changeNumber);

    const result = await apiClient.get(`/table/change_request/${sysId}`, {
        sysparm_display_value: "true",
    });
    const r = result?.result ?? {};

    const fields = {
        number: r.number,
        short_description: r.short_description,
        state: r.state,
        type: r.type,
        priority: r.priority,
        risk: r.risk,
        assignment_group: r.assignment_group?.display_value ?? "",
        assigned_to: r.assigned_to?.display_value ?? "",
        cmdb_ci: r.cmdb_ci?.display_value ?? "",
        start_date: r.start_date,
        end_date: r.end_date,
        close_code: r.close_code,
        close_notes: r.close_notes,
        sys_created_on: r.sys_created_on,
    };

    return { content: [{ type: "text", text: JSON.stringify(fields, null, 2) }] };
}
