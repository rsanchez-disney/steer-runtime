import { apiClient } from "../utils/apiClient.js";

export const queryIncidentsSchema = {
    name: "query_incidents",
    description: "Query incidents using ServiceNow encoded query strings",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string", description: "ServiceNow encoded query string" },
            fields: { type: "string", description: "Comma-separated list of fields to return", default: "number,short_description,state,priority,assignment_group" },
            limit: { type: "number", description: "Maximum number of results (default 50)", default: 50 },
        },
        required: ["query"],
    },
};

export async function handleQueryIncidents(args: any) {
    const {
        query,
        fields = "number,short_description,state,priority,assignment_group",
        limit = 50,
    } = args;

    const result = await apiClient.get("/table/incident", {
        sysparm_query: query,
        sysparm_fields: fields,
        sysparm_limit: String(limit),
        sysparm_display_value: "true",
    });
    const records = result?.result ?? [];
    return {
        content: [{ type: "text", text: JSON.stringify({ count: records.length, records }, null, 2) }],
    };
}
