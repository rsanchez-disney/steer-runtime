import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayGetTestPreConditionsSchema = {
    name: "xray_get_test_preconditions",
    description:
        "Get all pre-conditions associated with an XRay Test issue. Returns pre-condition keys, summaries, types, and conditions.",
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

export async function handleXrayGetTestPreConditions(args: any): Promise<any> {
    try {
        const { testKey } = args as { testKey: string };

        const apiClient = new JiraApiClient();
        const preConditions = await apiClient.getXrayTestPreConditions(testKey);

        if (!Array.isArray(preConditions) || preConditions.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No pre-conditions found for ${testKey}.`,
                    },
                ],
            };
        }

        let text = `**Pre-Conditions for ${testKey}** (${preConditions.length})\n\n`;

        preConditions.forEach((pc: any, index: number) => {
            text += `**${index + 1}. ${pc.key}:** ${pc.summary || pc.condition || "(no description)"}\n`;
            if (pc.type) text += `   - Type: ${pc.type}\n`;
            if (pc.condition) text += `   - Condition: ${pc.condition}\n`;
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
                    text: `Error getting XRay pre-conditions: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
