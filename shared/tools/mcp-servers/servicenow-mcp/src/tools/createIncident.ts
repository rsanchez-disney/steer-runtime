import { apiClient } from "../utils/apiClient.js";

export const createIncidentSchema = {
    name: "create_incident",
    description: "Create a new incident with assignment group, CI, priority, caller",
    inputSchema: {
        type: "object",
        properties: {
            shortDescription: { type: "string", description: "Brief summary of the incident" },
            description: { type: "string", description: "Detailed description" },
            assignmentGroup: { type: "string", description: "Assignment group name" },
            callerEmail: { type: "string", description: "Email of the caller/requester" },
            priority: { type: "string", description: "Priority 1-4 (default: 4)", default: "4" },
            category: { type: "string", description: "Incident category" },
            subcategory: { type: "string", description: "Incident subcategory" },
            ciName: { type: "string", description: "Configuration Item name" },
        },
        required: ["shortDescription"],
    },
};

export async function handleCreateIncident(args: any) {
    const {
        shortDescription, description, assignmentGroup,
        callerEmail, priority = "4", category, subcategory, ciName,
    } = args;

    const data: Record<string, string> = { short_description: shortDescription, priority };
    if (description) data.description = description;
    if (category) data.category = category;
    if (subcategory) data.subcategory = subcategory;

    if (assignmentGroup) {
        data.assignment_group = await apiClient.getSysIdByName("sys_user_group", assignmentGroup);
    }
    if (callerEmail) {
        const userId = await apiClient.getUserSysIdByEmail(callerEmail);
        if (userId) data.caller_id = userId;
    }
    if (ciName) {
        data.cmdb_ci = await apiClient.getSysIdByName("cmdb_ci", ciName);
    }

    const result = await apiClient.post("/table/incident", data);
    const record = result?.result ?? {};
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", number: record.number, sys_id: record.sys_id, message: `Incident ${record.number} created` }) }],
    };
}
