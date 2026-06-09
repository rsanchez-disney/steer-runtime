import { apiClient } from "../utils/apiClient.js";

export const nrqlQuerySchema = {
    name: "nrql_query",
    description: "Run a NRQL query against New Relic. Use for crash rates, adoption rates, error counts, or any custom metric.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "The NRQL query to execute (e.g., SELECT percentage(count(*), WHERE category = 'Crash') FROM MobileCrash SINCE '2026-04-28')",
            },
        },
        required: ["query"],
    },
};

export async function handleNrqlQuery(args: any) {
    const { query } = args;
    const data = await apiClient.nrql(query);
    const results = data?.data?.actor?.account?.nrql?.results;
    return {
        content: [{ type: "text", text: JSON.stringify(results ?? data, null, 2) }],
    };
}
