import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayGetTestPlanTestsSchema = {
    name: "xray_get_test_plan_tests",
    description:
        "Get all tests associated with an XRay Test Plan issue",
    inputSchema: {
        type: "object",
        properties: {
            testPlanKey: {
                type: "string",
                description:
                    "The JIRA Test Plan issue key (e.g., DPAY-9999)",
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
        required: ["testPlanKey"],
    },
};

export async function handleXrayGetTestPlanTests(args: any): Promise<any> {
    try {
        const { testPlanKey, page, limit } = args as {
            testPlanKey: string;
            page?: number;
            limit?: number;
        };

        const apiClient = new JiraApiClient();
        const result = await apiClient.getXrayTestPlanTests(
            testPlanKey,
            page,
            limit,
        );

        const tests = Array.isArray(result) ? result : result?.issues || result;

        if (!Array.isArray(tests) || tests.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No tests found in Test Plan ${testPlanKey}.`,
                    },
                ],
            };
        }

        let text = `**Tests in Test Plan ${testPlanKey}** (${tests.length} tests)\n\n`;

        tests.forEach((test: any, index: number) => {
            text += `**${index + 1}. ${test.key}:** ${test.summary || "(no summary)"}\n`;
            if (test.status) text += `   - Status: ${test.status}\n`;
            if (test.type) text += `   - Type: ${test.type}\n`;
            if (test.assignee) text += `   - Assignee: ${test.assignee}\n`;
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
                    text: `Error getting test plan tests: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
