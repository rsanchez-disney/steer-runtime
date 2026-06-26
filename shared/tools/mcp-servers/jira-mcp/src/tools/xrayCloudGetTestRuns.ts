import { xrayCloudGraphQL, validateIssueKey } from "../utils/xrayCloudApi.js";

export const xrayCloudGetTestRunsSchema = {
    name: "xray_cloud_get_test_runs",
    description: "Get test run results for a test case from XRay Cloud.",
    inputSchema: {
        type: "object",
        properties: {
            testKey: { type: "string", description: "Test issue key (e.g., DPAY-100)" },
            limit: { type: "number", description: "Max runs to return (default: 10)" },
        },
        required: ["testKey"],
    },
};

export async function handleXrayCloudGetTestRuns(args: any): Promise<any> {
    try {
        const { testKey, limit = 10 } = args;
        validateIssueKey(testKey, "testKey");

        const query = `
            query($testIssueIds: [String!]!, $limit: Int) {
                getTestRuns(testIssueIds: $testIssueIds, limit: $limit) {
                    results {
                        id
                        status { name color }
                        testExecution { issueId jira(fields: ["key", "summary"]) { key } }
                        startedOn
                        finishedOn
                        executedBy { accountId }
                        steps {
                            id
                            status { name }
                            actualResult
                        }
                    }
                }
            }
        `;

        const data = await xrayCloudGraphQL(query, { testIssueIds: [testKey], limit });
        const runs = data?.getTestRuns?.results || [];

        if (!runs.length) return { content: [{ type: "text", text: `No test runs found for: ${testKey}` }] };

        let text = `**Test Runs for ${testKey}** (${runs.length} runs)\n\n`;
        runs.forEach((r: any, i: number) => {
            const execKey = r.testExecution?.jira?.key || "Unknown";
            text += `**Run ${i + 1}:** ${r.status?.name || "?"} — Execution: ${execKey}\n`;
            if (r.startedOn) text += `  Started: ${r.startedOn}\n`;
            if (r.finishedOn) text += `  Finished: ${r.finishedOn}\n`;
            if (r.steps?.length) {
                const passed = r.steps.filter((s: any) => s.status?.name === "PASSED").length;
                text += `  Steps: ${passed}/${r.steps.length} passed\n`;
            }
            text += "\n";
        });

        return { content: [{ type: "text", text }] };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error getting XRay Cloud test runs: ${error.message}` }], isError: true };
    }
}
