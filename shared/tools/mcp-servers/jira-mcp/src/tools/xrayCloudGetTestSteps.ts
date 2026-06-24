import { xrayCloudGraphQL } from "../utils/xrayCloudApi.js";

export const xrayCloudGetTestStepsSchema = {
    name: "xray_cloud_get_test_steps",
    description: "Get test steps for a test case from XRay Cloud.",
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

        const query = `
            query {
                getTests(jql: "key = ${testKey}", limit: 1) {
                    results {
                        issueId
                        testType { name }
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

        const data = await xrayCloudGraphQL(query);
        const test = data?.getTests?.results?.[0];
        if (!test) return { content: [{ type: "text", text: `No test found for key: ${testKey}` }] };

        const steps = test.steps || [];
        let text = `**Test Steps for ${testKey}** (${steps.length} steps)\n**Type:** ${test.testType?.name || "Unknown"}\n\n`;
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
