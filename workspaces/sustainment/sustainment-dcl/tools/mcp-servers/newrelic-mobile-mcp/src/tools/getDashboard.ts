import { apiClient } from "../utils/apiClient.js";

export const getDashboardSchema = {
    name: "get_dashboard",
    description: "Get a New Relic dashboard by GUID. Returns widget definitions and their NRQL queries.",
    inputSchema: {
        type: "object",
        properties: {
            dashboardGuid: { type: "string", description: "Dashboard entity GUID" },
        },
        required: ["dashboardGuid"],
    },
};

export async function handleGetDashboard(args: any) {
    const { dashboardGuid } = args;
    const query = `{
        actor {
            entity(guid: "${dashboardGuid}") {
                ... on DashboardEntity {
                    name
                    pages {
                        name
                        widgets {
                            title
                            rawConfiguration
                        }
                    }
                }
            }
        }
    }`;

    const data = await apiClient.graphql(query);
    return {
        content: [{ type: "text", text: JSON.stringify(data?.data?.actor?.entity ?? data, null, 2) }],
    };
}
