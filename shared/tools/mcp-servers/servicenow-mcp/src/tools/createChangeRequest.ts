import { apiClient } from "../utils/apiClient.js";

export const createChangeRequestSchema = {
    name: "create_change_request",
    description: "Create a new change request (normal/standard/emergency) with dates, CI, assignment group",
    inputSchema: {
        type: "object",
        properties: {
            shortDescription: { type: "string", description: "Brief summary of the change" },
            description: { type: "string", description: "Detailed description and justification" },
            assignmentGroup: { type: "string", description: "Assignment group name" },
            priority: { type: "string", description: "Priority 1-4 (default: 4)", default: "4" },
            changeType: { type: "string", description: "Type: normal, standard, or emergency (default: normal)", default: "normal" },
            category: { type: "string", description: "Change category" },
            ciName: { type: "string", description: "Configuration Item name affected" },
            requestedByEmail: { type: "string", description: "Email of the person requesting the change" },
            startDate: { type: "string", description: "Planned start (YYYY-MM-DD HH:MM:SS)" },
            endDate: { type: "string", description: "Planned end (YYYY-MM-DD HH:MM:SS)" },
        },
        required: ["shortDescription"],
    },
};

export async function handleCreateChangeRequest(args: any) {
    const {
        shortDescription, description, assignmentGroup, priority = "4",
        changeType = "normal", category, ciName, requestedByEmail, startDate, endDate,
    } = args;

    const typeMap: Record<string, string> = { normal: "normal", standard: "standard", emergency: "emergency" };
    const data: Record<string, string> = {
        short_description: shortDescription,
        priority,
        type: typeMap[changeType.toLowerCase()] ?? "normal",
    };
    if (description) data.description = description;
    if (category) data.category = category;
    if (startDate) data.start_date = startDate;
    if (endDate) data.end_date = endDate;

    if (assignmentGroup) {
        data.assignment_group = await apiClient.getSysIdByName("sys_user_group", assignmentGroup);
    }
    if (ciName) {
        data.cmdb_ci = await apiClient.getSysIdByName("cmdb_ci", ciName);
    }
    if (requestedByEmail) {
        const userId = await apiClient.getUserSysIdByEmail(requestedByEmail);
        if (userId) data.requested_by = userId;
    }

    const result = await apiClient.post("/table/change_request", data);
    const record = result?.result ?? {};
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", number: record.number, sys_id: record.sys_id, message: `Change Request ${record.number} created` }) }],
    };
}
