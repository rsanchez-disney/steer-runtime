import { xrayCloudGraphQL, validateIssueKey } from "../utils/xrayCloudApi.js";

export const xrayCloudGetTestStepsSchema = {
    name: "xray_cloud_get_test_steps",
    description: "Get test steps for a test case from XRay Cloud. Supports both Manual and Cucumber test types.",
    inputSchema: {
        type: "object",
        properties: {
            testKey: { type: "string", description: "Test issue key (e.g., DPAY-100)" },
        },
        required: ["testKey"],
    },
};

export async function handleXrayCloudGetTestSteps(args: any): Promise<any> {
    try {
        const { testKey } = args;
        validateIssueKey(testKey, "testKey");

        const query = `
            query($jql: String!, $limit: Int) {
                getTests(jql: $jql, limit: $limit) {
                    results {
                        issueId
                        testType { name }
                        gherkin
                        steps {
                            id
                            action
                            data
                            result
                        }
                    }
                }
            }
        `;

        const data = await xrayCloudGraphQL(query, { jql: `key = ${testKey}`, limit: 1 });
        const test = data?.getTests?.results?.[0];
        if (!test) return { content: [{ type: "text", text: `No test found for key: ${testKey}` }] };

        const testType = test.testType?.name || "Unknown";

        if (testType === "Cucumber" && test.gherkin) {
            const text = `**Test Steps for ${testKey}**\n**Type:** Cucumber\n\n\`\`\`gherkin\n${test.gherkin}\n\`\`\``;
            return { content: [{ type: "text", text }] };
        }

        const steps = test.steps || [];
        let text = `**Test Steps for ${testKey}** (${steps.length} steps)\n**Type:** ${testType}\n\n`;
        steps.forEach((s: any, i: number) => {
            text += `**Step ${i + 1}:**\n`;
            text += `  Action: ${s.action}\n`;
            if (s.data) text += `  Data: ${s.data}\n`;
            text += `  Expected: ${s.result}\n\n`;
        });

        return { content: [{ type: "text", text }] };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error getting XRay Cloud test steps: ${error.message}` }], isError: true };
    }
}
