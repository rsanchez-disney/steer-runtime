import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayGetTestRunsSchema = {
    name: "xray_get_test_runs",
    description:
        "Export XRay test run results. Filter by test execution, test, test plan, or test environment. Returns execution status, defects, and step results.",
    inputSchema: {
        type: "object",
        properties: {
            testExecKey: {
                type: "string",
                description:
                    "Test Execution issue key to filter by (e.g., DPAY-5678)",
            },
            testKey: {
                type: "string",
                description:
                    "Test issue key to filter by (e.g., DPAY-1234)",
            },
            testPlanKey: {
                type: "string",
                description:
                    "Test Plan issue key to filter by (e.g., DPAY-9999)",
            },
            testEnvironments: {
                type: "string",
                description:
                    "Test environment name to filter by (e.g., QA, Staging)",
            },
            page: {
                type: "number",
                description: "Page number for pagination",
            },
            limit: {
                type: "number",
                description: "Number of results per page",
            },
        },
    },
};

export async function handleXrayGetTestRuns(args: any): Promise<any> {
    try {
        const {
            testExecKey,
            testKey,
            testPlanKey,
            testEnvironments,
            page,
            limit,
        } = args as {
            testExecKey?: string;
            testKey?: string;
            testPlanKey?: string;
            testEnvironments?: string;
            page?: number;
            limit?: number;
        };

        if (!testExecKey && !testKey && !testPlanKey) {
            return {
                content: [
                    {
                        type: "text",
                        text: "At least one of testExecKey, testKey, or testPlanKey must be provided.",
                    },
                ],
                isError: true,
            };
        }

        const apiClient = new JiraApiClient();
        const result = await apiClient.getXrayTestRuns(
            testExecKey,
            testKey,
            testPlanKey,
            testEnvironments,
            page,
            limit,
        );

        const runs = Array.isArray(result) ? result : result?.testRuns || result;

        if (!Array.isArray(runs) || runs.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No test runs found for the given filters.",
                    },
                ],
            };
        }

        let text = `**Test Runs** (${runs.length} results)\n\n`;

        runs.forEach((run: any, index: number) => {
            text += `**${index + 1}. ${run.testKey || run.key || "Unknown"}**\n`;
            text += `   - Status: ${run.status || "Unknown"}\n`;
            if (run.testExecKey) text += `   - Test Execution: ${run.testExecKey}\n`;
            if (run.assignee) text += `   - Assignee: ${run.assignee}\n`;
            if (run.executedBy) text += `   - Executed By: ${run.executedBy}\n`;
            if (run.startedOn) text += `   - Started: ${run.startedOn}\n`;
            if (run.finishedOn) text += `   - Finished: ${run.finishedOn}\n`;
            if (run.comment) text += `   - Comment: ${run.comment}\n`;
            if (run.defects?.length) {
                text += `   - Defects: ${run.defects.map((d: any) => d.key || d).join(", ")}\n`;
            }
            if (run.steps?.length) {
                text += `   - Steps (${run.steps.length}):\n`;
                run.steps.forEach((step: any, si: number) => {
                    text += `     ${si + 1}. ${step.status || "Unknown"} — ${step.comment || "(no comment)"}\n`;
                });
            }
            text += "\n";
        });

        return {
            content: [{ type: "text", text }],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error getting test runs: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
