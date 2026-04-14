import { apiClient } from "../utils/apiClient.js";

export const createProblemSchema = {
    name: "create_problem",
    description: "Create a new problem record with assignment group, CI, priority",
    inputSchema: {
        type: "object",
        properties: {
            shortDescription: { type: "string", description: "Brief summary of the problem" },
            description: { type: "string", description: "Detailed description" },
            assignmentGroup: { type: "string", description: "Assignment group name" },
            priority: { type: "string", description: "Priority 1-4 (default: 4)", default: "4" },
            category: { type: "string", description: "Problem category" },
            ciName: { type: "string", description: "Configuration Item name" },
        },
        required: ["shortDescription"],
    },
};

export async function handleCreateProblem(args: any) {
    const { shortDescription, description, assignmentGroup, priority = "4", category, ciName } = args;

    const data: Record<string, string> = { short_description: shortDescription, priority };
    if (description) data.description = description;
    if (category) data.category = category;

    if (assignmentGroup) {
        data.assignment_group = await apiClient.getSysIdByName("sys_user_group", assignmentGroup);
    }
    if (ciName) {
        data.cmdb_ci = await apiClient.getSysIdByName("cmdb_ci", ciName);
    }

    const result = await apiClient.post("/table/problem", data);
    const record = result?.result ?? {};
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", number: record.number, sys_id: record.sys_id, message: `Problem ${record.number} created` }) }],
    };
}
