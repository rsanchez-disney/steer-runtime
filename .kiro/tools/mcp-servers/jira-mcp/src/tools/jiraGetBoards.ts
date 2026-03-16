import { JiraApiClient } from "../utils/jiraApi.js";
import { saveData } from "../utils/fileUtils.js";

export const jiraGetBoardsSchema = {
    name: "jira_get_boards",
    description: "Get JIRA agile boards",
    inputSchema: {
        type: "object",
        properties: {
            projectKey: {
                type: "string",
                description: "Filter by project key (optional)",
            },
            boardType: {
                type: "string",
                description:
                    'Filter by board type: "scrum" or "kanban" (optional)',
            },
            name: {
                type: "string",
                description: "Filter by board name (optional)",
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
                    "Directory to save the boards data (optional, defaults to .amazonq/external-data)",
            },
        },
        required: [],
    },
};

export async function handleJiraGetBoards(args: any): Promise<any> {
    try {
        const {
            projectKey,
            boardType,
            name,
            maxResults = 50,
            startAt = 0,
            outputDir,
        } = args as {
            projectKey?: string;
            boardType?: string;
            name?: string;
            maxResults?: number;
            startAt?: number;
            outputDir?: string;
        };

        const apiClient = new JiraApiClient();
        const boards = await apiClient.getJiraBoards(
            projectKey,
            boardType,
            name,
            startAt,
            maxResults,
        );

        let summaryText = `**JIRA Agile Boards**`;
        if (projectKey) summaryText += ` (Project: ${projectKey})`;
        if (boardType) summaryText += ` (Type: ${boardType})`;
        if (name) summaryText += ` (Name filter: ${name})`;

        summaryText += `

**Total Found:** ${boards.total}
**Showing:** ${boards.values.length} boards (starting at ${startAt})

`;

        boards.values.forEach((board: any, index: number) => {
            summaryText += `**${startAt + index + 1}. ${board.name}**
- ID: ${board.id}
- Type: ${board.type}
- Location: ${board.location?.displayName || "Unknown"}

`;
        });

        // Save the boards data
        const savedPath = await saveData(
            outputDir,
            `boards_${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
            {
                filters: {
                    projectKey,
                    boardType,
                    name,
                    maxResults,
                    startAt,
                },
                fetchedAt: new Date().toISOString(),
                rawData: boards,
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
                    text: `Error fetching JIRA boards: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
