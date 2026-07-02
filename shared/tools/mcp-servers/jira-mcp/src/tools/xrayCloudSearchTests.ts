import { xrayCloudGraphQL } from "../utils/xrayCloudApi.js";

export const xrayCloudSearchTestsSchema = {
    name: "xray_cloud_search_tests",
    description: "Search test cases in XRay Cloud using JQL. Returns Gherkin preview for Cucumber tests.",
    inputSchema: {
        type: "object",
        properties: {
            jql: { type: "string", description: "JQL query (e.g., 'project = DPAY AND summary ~ \"login\"')" },
            limit: { type: "number", description: "Max results (default: 20)" },
        },
        required: ["jql"],
    },
};

export async function handleXrayCloudSearchTests(args: any): Promise<any> {
    try {
        const { jql, limit = 20 } = args;

        const query = `
            query($jql: String!, $limit: Int!) {
                getTests(jql: $jql, limit: $limit) {
                    total
                    results {
                        issueId
                        jira(fields: ["key", "summary", "status", "labels"])
                        testType { name }
                        gherkin
                    }
                }
            }
        `;

        const data = await xrayCloudGraphQL(query, { jql, limit });
        const results = data?.getTests?.results || [];
        const total = data?.getTests?.total ?? results.length;

        if (!results.length) return { content: [{ type: "text", text: `No tests found for JQL: ${jql}` }] };

        let text = `**Test Search Results** (${results.length} of ${total} total)\n**JQL:** ${jql}\n\n`;
        for (const t of results) {
            const key = t.jira?.key || t.issueId;
            const summary = t.jira?.summary || "";
            const type = t.testType?.name || "?";
            text += `- **${key}** — ${summary} [${type}]\n`;
            if (type === "Cucumber" && t.gherkin) {
                const preview = t.gherkin.split("\n").slice(0, 3).join("\n").slice(0, 200);
                text += `  \`\`\`gherkin\n  ${preview}\n  \`\`\`\n`;
            }
        }

        return { content: [{ type: "text", text }] };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error searching XRay Cloud tests: ${error.message}` }], isError: true };
    }
}
