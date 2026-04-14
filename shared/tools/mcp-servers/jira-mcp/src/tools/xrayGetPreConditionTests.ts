import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayGetPreConditionTestsSchema = {
    name: "xray_get_precondition_tests",
    description:
        "Get all tests associated with an XRay Pre-Condition issue. Returns the test keys and summaries linked to a pre-condition.",
    inputSchema: {
        type: "object",
        properties: {
            preConditionKey: {
                type: "string",
                description:
                    "The JIRA Pre-Condition issue key (e.g., DPAY-3333)",
            },
        },
        required: ["preConditionKey"],
    },
};

export async function handleXrayGetPreConditionTests(args: any): Promise<any> {
    try {
        const { preConditionKey } = args as { preConditionKey: string };

        const apiClient = new JiraApiClient();
        const tests = await apiClient.getXrayPreConditionTests(preConditionKey);

        if (!Array.isArray(tests) || tests.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No tests found for Pre-Condition ${preConditionKey}.`,
                    },
                ],
            };
        }

        let text = `**Tests for Pre-Condition ${preConditionKey}** (${tests.length})\n\n`;

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
                    text: `Error getting pre-condition tests: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
