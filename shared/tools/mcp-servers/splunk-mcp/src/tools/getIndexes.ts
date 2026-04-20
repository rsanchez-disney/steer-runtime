import { apiClient } from "../utils/apiClient.js";

export const getIndexesSchema = {
    name: "get_indexes",
    description: "List available Splunk indexes with event counts and sizes",
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};

export async function handleGetIndexes() {
    const data = await apiClient.get("/services/data/indexes", { count: "0" });
    const entries = data?.entry ?? [];

    const indexes = entries.map((e: any) => ({
        name: e.name,
        totalEventCount: e.content?.totalEventCount,
        currentDBSizeMB: e.content?.currentDBSizeMB,
        disabled: e.content?.disabled,
    }));

    return {
        content: [{ type: "text", text: JSON.stringify(indexes, null, 2) }],
    };
}
