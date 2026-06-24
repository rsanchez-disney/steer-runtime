import { xrayCloudPost } from "../utils/xrayCloudApi.js";

export const xrayCloudUpdateRunSchema = {
    name: "xray_cloud_update_run",
    description: "Report pass/fail results for a test run in XRay Cloud. Updates step-level statuses within an existing execution.",
    inputSchema: {
        type: "object",
        properties: {
            testExecutionKey: { type: "string", description: "Existing Test Execution issue key" },
            tests: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        testKey: { type: "string", description: "Test issue key" },
                        status: { type: "string", enum: ["PASSED", "FAILED", "TODO", "EXECUTING", "ABORTED"], description: "Overall test status" },
                        comment: { type: "string", description: "Run comment (optional)" },
                        steps: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    status: { type: "string", enum: ["PASSED", "FAILED", "TODO", "EXECUTING", "ABORTED"] },
                                    actualResult: { type: "string", description: "Actual result observed" },
                                },
                                required: ["status"],
                            },
                            description: "Step-level results (optional)",
                        },
                    },
                    required: ["testKey", "status"],
                },
                description: "Array of test results to report",
            },
        },
        required: ["testExecutionKey", "tests"],
    },
};

export async function handleXrayCloudUpdateRun(args: any): Promise<any> {
    try {
        const { testExecutionKey, tests } = args;

        const payload = {
            testExecutionKey,
            tests: tests.map((t: any) => ({
                testKey: t.testKey,
                status: t.status,
                ...(t.comment && { comment: t.comment }),
                ...(t.steps && { steps: t.steps }),
            })),
        };

        const result = await xrayCloudPost("/api/v2/import/execution", payload);

        const passed = tests.filter((t: any) => t.status === "PASSED").length;
        const failed = tests.filter((t: any) => t.status === "FAILED").length;

        return {
            content: [{ type: "text", text: `**Test Run Updated:** ${testExecutionKey}\n\n**Results:** ${passed} passed, ${failed} failed, ${tests.length} total` }],
        };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error updating XRay Cloud run: ${error.message}` }], isError: true };
    }
}
