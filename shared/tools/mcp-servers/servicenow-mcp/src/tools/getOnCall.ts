import { apiClient } from "../utils/apiClient.js";

export const getOnCallSchema = {
    name: "get_on_call",
    description: "Get the current on-call person/rotation for an assignment group",
    inputSchema: {
        type: "object",
        properties: {
            groupName: { type: "string", description: "Assignment group name (e.g. 'app-global-cme')" },
        },
        required: ["groupName"],
    },
};

export async function handleGetOnCall(args: any) {
    const { groupName } = args;

    // Get group sys_id
    const groupSysId = await apiClient.getSysIdByName("sys_user_group", groupName);

    // Query on-call rotation
    const result = await apiClient.get("/table/cmn_rota_member", {
        sysparm_query: `group=${groupSysId}`,
        sysparm_fields: "member,roster,order",
        sysparm_limit: "10",
        sysparm_display_value: "true",
    });

    const members = (result?.result ?? []).map((m: any) => ({
        member: m.member?.display_value ?? m.member,
        roster: m.roster?.display_value ?? m.roster,
        order: m.order,
    }));

    // Also get group manager
    const groupResult = await apiClient.get(`/table/sys_user_group/${groupSysId}`, {
        sysparm_fields: "name,manager,email",
        sysparm_display_value: "true",
    });
    const group = groupResult?.result ?? {};

    return {
        content: [{ type: "text", text: JSON.stringify({
            group: groupName,
            manager: group.manager?.display_value ?? group.manager,
            email: group.email,
            rotationMembers: members,
        }, null, 2) }],
    };
}
