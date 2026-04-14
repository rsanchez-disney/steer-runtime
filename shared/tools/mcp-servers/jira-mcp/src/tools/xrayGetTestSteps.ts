import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayGetTestStepsSchema = {
    name: "xray_get_test_steps",
    description:
        "Get all test steps for an XRay Test issue, including action, data, expected result, and attachments for each step",
    inputSchema: {
        type: "object",
        properties: {
            testKey: {
                type: "string",
                description:
                    "The JIRA Test issue key (e.g., DPAY-1234)",
            },
        },
        required: ["testKey"],
    },
};

export async function handleXrayGetTestSteps(args: any): Promise<any> {
    try {
        const { testKey } = args as { testKey: string };

        const apiClient = new JiraApiClient();
        const steps = await apiClient.getXrayTestSteps(testKey);

        if (!Array.isArray(steps) || steps.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No test steps found for ${testKey}.`,
                    },
                ],
            };
        }

        let text = `**Test Steps for ${testKey}** (${steps.length} steps)\n\n`;

        steps.forEach((step: any, index: number) => {
            const stepIndex = step.index ?? index + 1;
            text += `**Step ${stepIndex}:**\n`;
            text += `- Action: ${step.fields?.action || step.action || "(none)"}\n`;
            text += `- Data: ${step.fields?.data || step.data || "(none)"}\n`;
            text += `- Expected Result: ${step.fields?.["expected result"] || step.fields?.expectedResult || step.result || "(none)"}\n`;

            if (step.attachments && step.attachments.length > 0) {
                text += `- Attachments: ${step.attachments.length} file(s)\n`;
                step.attachments.forEach((att: any) => {
                    text += `  - ${att.filename || att.fileName || "unnamed"}\n`;
                });
            }

            if (step.customFields && Object.keys(step.customFields).length > 0) {
                text += `- Custom Fields: ${JSON.stringify(step.customFields)}\n`;
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
                    text: `Error getting XRay test steps: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
