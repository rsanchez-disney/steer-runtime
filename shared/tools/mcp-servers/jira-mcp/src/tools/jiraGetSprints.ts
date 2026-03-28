import { JiraApiClient } from "../utils/jiraApi.js";
import { saveData } from "../utils/fileUtils.js";

export const jiraGetSprintsSchema = {
    name: "jira_get_sprints",
    description: "Get sprints for a JIRA agile board",
    inputSchema: {
        type: "object",
        properties: {
            boardId: {
                type: "string",
                description: "Board ID to get sprints for",
            },
            state: {
                type: "string",
                description:
                    'Filter by sprint state: "active", "closed", "future" (optional)',
            },
            maxResults: {
                type: "number",
                description: "Maximum number of results (default: 50)",
            },
            startAt: {
                type: "number",
                description: "Starting index for pagination (default: 0)",
            },
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save the sprints data (optional, defaults to .amazonq/external-data)",
            },
        },
        required: ["boardId"],
    },
};

export async function handleJiraGetSprints(args: any): Promise<any> {
    try {
        const {
            boardId,
            state,
            maxResults = 50,
            startAt = 0,
            outputDir,
        } = args as {
            boardId: string;
            state?: string;
            maxResults?: number;
            startAt?: number;
            outputDir?: string;
        };

        const apiClient = new JiraApiClient();
        const sprints = await apiClient.getJiraSprints(
            boardId,
            state,
            startAt,
            maxResults,
        );

        let summaryText = `**Sprints for Board ${boardId}**`;
        if (state) summaryText += ` (State: ${state})`;

        summaryText += `

**Total Found:** ${sprints.total}
**Showing:** ${sprints.values.length} sprints (starting at ${startAt})

`;

        sprints.values.forEach((sprint: any, index: number) => {
            summaryText += `**${startAt + index + 1}. ${sprint.name}**
- ID: ${sprint.id}
- State: ${sprint.state}
- Start: ${sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : "Not set"}
- End: ${sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : "Not set"}
- Goal: ${sprint.goal || "No goal set"}

`;
        });

        // Save the sprints data
        const savedPath = await saveData(
            outputDir,
            `board_${boardId}_sprints_${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
            {
                boardId,
                filters: { state, maxResults, startAt },
                fetchedAt: new Date().toISOString(),
                rawData: sprints,
                formattedSummary: summaryText,
            },
            true,
        );

        const savedInfo = savedPath ? `\n\n**Saved to:** ${savedPath}` : "";

        return {
            content: [
                {
                    type: "text",
                    text: `${summaryText}${savedInfo}`,
                },
            ],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching JIRA sprints: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
