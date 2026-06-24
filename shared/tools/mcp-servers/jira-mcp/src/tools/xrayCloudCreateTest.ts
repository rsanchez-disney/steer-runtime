import { xrayCloudPost } from "../utils/xrayCloudApi.js";

export const xrayCloudCreateTestSchema = {
    name: "xray_cloud_create_test",
    description: "Create a test case with steps in XRay Cloud. Returns the created test issue key.",
    inputSchema: {
        type: "object",
        properties: {
            projectKey: { type: "string", description: "Jira project key (e.g., DPAY)" },
            summary: { type: "string", description: "Test case title/summary" },
            testType: { type: "string", enum: ["Manual", "Cucumber", "Generic"], description: "Test type (default: Manual)" },
            steps: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        action: { type: "string", description: "Step action/instruction" },
                        data: { type: "string", description: "Test data (optional)" },
                        result: { type: "string", description: "Expected result" },
                    },
                    required: ["action", "result"],
                },
                description: "Array of test steps",
            },
            labels: { type: "array", items: { type: "string" }, description: "Labels to apply (optional)" },
        },
        required: ["projectKey", "summary", "steps"],
    },
};

export async function handleXrayCloudCreateTest(args: any): Promise<any> {
    try {
        const { projectKey, summary, testType = "Manual", steps, labels } = args;

        const payload: any = {
            testType,
            fields: {
                summary,
                project: { key: projectKey },
            },
            steps: steps.map((s: any) => ({
                action: s.action,
                data: s.data || "",
                result: s.result,
            })),
        };
        if (labels?.length) payload.fields.labels = labels;

        const result = await xrayCloudPost("/api/v2/import/test", payload);
        const key = result?.key || result?.testIssueId || JSON.stringify(result);

        return {
            content: [{ type: "text", text: `**Test Created:** ${key}\n\n**Summary:** ${summary}\n**Steps:** ${steps.length}\n**Type:** ${testType}` }],
        };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error creating XRay Cloud test: ${error.message}` }], isError: true };
    }
}
