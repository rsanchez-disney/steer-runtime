import { apiClient } from "../utils/apiClient.js";

export const searchKnowledgeBaseSchema = {
    name: "search_knowledge_base",
    description: "Search ServiceNow Knowledge Base articles for known solutions and workarounds",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string", description: "Search text (keywords, error messages, etc.)" },
            limit: { type: "number", description: "Maximum articles to return (default 10)", default: 10 },
        },
        required: ["query"],
    },
};

export async function handleSearchKnowledgeBase(args: any) {
    const { query, limit = 10 } = args;

    const result = await apiClient.get("/table/kb_knowledge", {
        sysparm_query: `workflow_state=published^text LIKE ${query}^ORshort_description LIKE ${query}`,
        sysparm_fields: "number,short_description,text,sys_updated_on,kb_category",
        sysparm_limit: String(limit),
        sysparm_display_value: "true",
    });

    const articles = (result?.result ?? []).map((a: any) => ({
        number: a.number,
        title: a.short_description,
        category: a.kb_category?.display_value ?? a.kb_category,
        updatedOn: a.sys_updated_on,
        snippet: (a.text || "").replace(/<[^>]+>/g, "").substring(0, 300),
    }));

    return {
        content: [{ type: "text", text: JSON.stringify({ query, count: articles.length, articles }, null, 2) }],
    };
}
