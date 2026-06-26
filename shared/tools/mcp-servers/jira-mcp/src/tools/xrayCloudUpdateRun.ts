import { xrayCloudPost } from "../utils/xrayCloudApi.js";

export const xrayCloudUpdateRunSchema = {
    name: "xray_cloud_update_run",
    description: "Report pass/fail results for a test run in XRay Cloud. Supports step-level statuses and Scenario Outline iterations.",
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
                            description: "Step-level results for Manual tests (optional)",
                        },
                        iterations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string", description: "Iteration label (e.g. Iteration 1)" },
                                    status: { type: "string", enum: ["PASSED", "FAILED", "TODO", "EXECUTING", "ABORTED"] },
                                    parameters: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                name: { type: "string" },
                                                value: { type: "string" },
                                            },
                                            required: ["name", "value"],
                                        },
                                        description: "Examples table row values for this iteration",
                                    },
                                    steps: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                status: { type: "string", enum: ["PASSED", "FAILED", "TODO", "EXECUTING", "ABORTED"] },
                                                actualResult: { type: "string" },
                                            },
                                            required: ["status"],
                                        },
                                        description: "Step results within this iteration",
                                    },
                                },
                                required: ["status"],
                            },
                            description: "Per-iteration results for Scenario Outline tests (optional)",
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
                ...(t.iterations && { iterations: t.iterations }),
            })),
        };

        const result = await xrayCloudPost("/api/v2/import/execution", payload);

        const passed = tests.filter((t: any) => t.status === "PASSED").length;
        const failed = tests.filter((t: any) => t.status === "FAILED").length;
        const withIterations = tests.filter((t: any) => t.iterations?.length).length;

        let text = `**Test Run Updated:** ${testExecutionKey}\n\n**Results:** ${passed} passed, ${failed} failed, ${tests.length} total`;
        if (withIterations) {
            text += `\n**Scenario Outlines:** ${withIterations} test(s) with iteration-level results`;
        }

        return { content: [{ type: "text", text }] };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error updating XRay Cloud run: ${error.message}` }], isError: true };
    }
}
