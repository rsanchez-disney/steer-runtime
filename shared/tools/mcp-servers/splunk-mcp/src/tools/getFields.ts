import { apiClient } from "../utils/apiClient.js";

export const getFieldsSchema = {
    name: "get_fields",
    description: "Get field summary for an index and/or sourcetype — shows field names, types, and value counts",
    inputSchema: {
        type: "object",
        properties: {
            index: { type: "string", description: "Index name" },
            sourcetype: { type: "string", description: "Sourcetype to analyze" },
            earliestTime: { type: "string", description: "Time range for field analysis (default -1h)", default: "-1h" },
            maxFields: { type: "number", description: "Maximum fields to return (default 50)", default: 50 },
        },
        required: [],
    },
};

export async function handleGetFields(args: any) {
    const { index, sourcetype, earliestTime = "-1h", maxFields = 50 } = args;

    let baseSearch = "";
    if (index && sourcetype) {
        baseSearch = `index=${index} sourcetype=${sourcetype}`;
    } else if (index) {
        baseSearch = `index=${index}`;
    } else if (sourcetype) {
        baseSearch = `sourcetype=${sourcetype}`;
    } else {
        baseSearch = `*`;
    }

    const query = `search ${baseSearch} | head 1000 | fieldsummary | table field count distinct_count is_exact modes`;

    const sid = await apiClient.createSearch(query, {
        earliest_time: earliestTime,
        latest_time: "now",
    });
    await apiClient.waitForSearch(sid, 30000);
    const results = await apiClient.getSearchResults(sid, maxFields);
    const fields = results?.results ?? [];

    return {
        content: [{ type: "text", text: JSON.stringify({ index, sourcetype, count: fields.length, fields }, null, 2) }],
    };
}
