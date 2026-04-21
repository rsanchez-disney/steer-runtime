import { apiClient } from "../utils/apiClient.js";

export const changeAssignmentGroupSchema = {
    name: "change_assignment_group",
    description: "Change the assignment group on a ServiceNow incident and set state to Assigned",
    inputSchema: {
        type: "object",
        properties: {
            incidentNumber: { type: "string", description: "The incident number (e.g. INC28829968)" },
            assignmentGroup: { type: "string", description: "The assignment group name" },
            assignedToEmail: { type: "string", description: "Optional email of the person to assign to" },
        },
        required: ["incidentNumber", "assignmentGroup"],
    },
};

export async function handleChangeAssignmentGroup(args: any) {
    const { incidentNumber, assignmentGroup, assignedToEmail } = args;
    const incSysId = await apiClient.getSysId("incident", "number", incidentNumber);
    const agSysId = await apiClient.getSysIdByName("sys_user_group", assignmentGroup);

    const updateData: Record<string, string> = {
        assignment_group: agSysId,
        state: "11", // Assigned
    };

    if (assignedToEmail) {
        const userSysId = await apiClient.getUserSysIdByEmail(assignedToEmail);
        if (userSysId) updateData.assigned_to = userSysId;
    }

    await apiClient.patch(`/table/incident/${incSysId}`, updateData);
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", incident: incidentNumber, assignment_group: assignmentGroup, state: "Assigned", message: "Assignment group updated" }) }],
    };
}
