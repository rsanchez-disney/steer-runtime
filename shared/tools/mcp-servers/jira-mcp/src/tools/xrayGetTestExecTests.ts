import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayGetTestExecTestsSchema = {
    name: "xray_get_test_exec_tests",
    description:
        "Get all tests associated with an XRay Test Execution issue, with optional detailed view including test run status",
    inputSchema: {
        type: "object",
        properties: {
            testExecKey: {
                type: "string",
                description:
                    "The JIRA Test Execution issue key (e.g., DPAY-5678)",
            },
            detailed: {
                type: "boolean",
                description:
                    "If true, returns detailed info including test run status (default: false)",
            },
            page: {
                type: "number",
                description: "Page number for pagination (starts at 1)",
            },
            limit: {
                type: "number",
                description: "Number of results per page",
            },
        },
        required: ["testExecKey"],
    },
};

export async function handleXrayGetTestExecTests(args: any): Promise<any> {
    try {
        const { testExecKey, detailed = false, page, limit } = args as {
            testExecKey: string;
            detailed?: boolean;
            page?: number;
            limit?: number;
        };

        const apiClient = new JiraApiClient();
        const result = await apiClient.getXrayTestExecTests(
            testExecKey,
            detailed,
            page,
            limit,
        );

        const tests = Array.isArray(result) ? result : result?.issues || result;

        if (!Array.isArray(tests) || tests.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No tests found in Test Execution ${testExecKey}.`,
                    },
                ],
            };
        }

        let text = `**Tests in Test Execution ${testExecKey}** (${tests.length} tests)\n\n`;

        tests.forEach((test: any, index: number) => {
            text += `**${index + 1}. ${test.key}:** ${test.summary || "(no summary)"}\n`;
            text += `   - Status: ${test.status || "Unknown"}\n`;
            if (test.assignee) text += `   - Assignee: ${test.assignee}\n`;
            if (test.type) text += `   - Type: ${test.type}\n`;
            if (test.defects?.length) {
                text += `   - Defects: ${test.defects.map((d: any) => d.key || d).join(", ")}\n`;
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
                    text: `Error getting test execution tests: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
