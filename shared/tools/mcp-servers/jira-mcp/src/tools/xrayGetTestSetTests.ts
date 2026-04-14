import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayGetTestSetTestsSchema = {
    name: "xray_get_test_set_tests",
    description:
        "Get all tests associated with an XRay Test Set issue",
    inputSchema: {
        type: "object",
        properties: {
            testSetKey: {
                type: "string",
                description:
                    "The JIRA Test Set issue key (e.g., DPAY-7777)",
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
        required: ["testSetKey"],
    },
};

export async function handleXrayGetTestSetTests(args: any): Promise<any> {
    try {
        const { testSetKey, page, limit } = args as {
            testSetKey: string;
            page?: number;
            limit?: number;
        };

        const apiClient = new JiraApiClient();
        const result = await apiClient.getXrayTestSetTests(
            testSetKey,
            page,
            limit,
        );

        const tests = Array.isArray(result) ? result : result?.issues || result;

        if (!Array.isArray(tests) || tests.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No tests found in Test Set ${testSetKey}.`,
                    },
                ],
            };
        }

        let text = `**Tests in Test Set ${testSetKey}** (${tests.length} tests)\n\n`;

        tests.forEach((test: any, index: number) => {
            text += `**${index + 1}. ${test.key}:** ${test.summary || "(no summary)"}\n`;
            if (test.status) text += `   - Status: ${test.status}\n`;
            if (test.type) text += `   - Type: ${test.type}\n`;
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
                    text: `Error getting test set tests: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
