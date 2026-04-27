import { JiraApiClient } from "../utils/jiraApi.js";
import { saveData } from "../utils/fileUtils.js";

export const jiraGetLinkTypesSchema = {
    name: "jira_get_link_types",
    description:
        "Get all available issue link types from the JIRA instance (e.g., Test, Blocks, Relates)",
    inputSchema: {
        type: "object",
        properties: {
            outputDir: {
                type: ["string", "boolean", "null"],
                description: "Directory to save the link types data (optional)",
            },
        },
        required: [],
    },
};

export async function handleJiraGetLinkTypes(args: any): Promise<any> {
    try {
        const { outputDir } = args as { outputDir?: string };
        const apiClient = new JiraApiClient();
        const data = await apiClient.getJiraIssueLinkTypes();
        const linkTypes = data.issueLinkTypes || [];

        let summaryText = `**Available Issue Link Types**\n\n**Total Link Types:** ${linkTypes.length}\n\n`;
        linkTypes.forEach((lt: any, index: number) => {
            summaryText += `**${index + 1}. ${lt.name}**\n- Inward: ${lt.inward}\n- Outward: ${lt.outward}\n\n`;
        });

        const savedPath = await saveData(
            outputDir,
            `link_types_${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
            { fetchedAt: new Date().toISOString(), rawData: data, formattedSummary: summaryText },
            true,
        );

        const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";
        return { content: [{ type: "text", text: `${summaryText}${savedInfo}` }] };
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error fetching JIRA issue link types: ${error instanceof Error ? error.message : "Unknown error"}` }],
            isError: true,
        };
    }
}
