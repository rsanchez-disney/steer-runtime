import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayGetTestStatusesSchema = {
    name: "xray_get_test_statuses",
    description:
        "Get all available XRay test statuses configured in the JIRA instance. Returns status names, descriptions, and colors for test run results.",
    inputSchema: {
        type: "object",
        properties: {},
    },
};

export async function handleXrayGetTestStatuses(args: any): Promise<any> {
    try {
        const apiClient = new JiraApiClient();
        const statuses = await apiClient.getXrayTestStatuses();

        if (!Array.isArray(statuses) || statuses.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: "No XRay test statuses found.",
                    },
                ],
            };
        }

        let text = `**XRay Test Statuses** (${statuses.length})\n\n`;

        statuses.forEach((status: any, index: number) => {
            text += `**${index + 1}. ${status.name || "Unknown"}**\n`;
            if (status.description) text += `   - Description: ${status.description}\n`;
            if (status.color) text += `   - Color: ${status.color}\n`;
            if (status.final !== undefined) text += `   - Final: ${status.final}\n`;
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
                    text: `Error getting XRay test statuses: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
