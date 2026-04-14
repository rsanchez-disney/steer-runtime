import { JiraApiClient } from "../utils/jiraApi.js";
import { saveData } from "../utils/fileUtils.js";

export const jiraGetProjectsSchema = {
    name: "jira_get_projects",
    description: "Get all JIRA projects",
    inputSchema: {
        type: "object",
        properties: {
            outputDir: {
                type: ["string", "boolean", "null"],
                description:
                    "Directory to save the projects data (optional, defaults to .amazonq/external-data)",
            },
        },
        required: [],
    },
};

export async function handleJiraGetProjects(args: any): Promise<any> {
    try {
        const { outputDir } = args as { outputDir?: string };

        const apiClient = new JiraApiClient();
        const projects = await apiClient.getJiraProjects();

        let summaryText = `**JIRA Projects**

**Total Projects:** ${projects.length}

`;

        projects.forEach((project: any, index: number) => {
            summaryText += `**${index + 1}. ${project.key}: ${project.name}**
- Lead: ${project.lead?.displayName || "Unknown"}
- Type: ${project.projectTypeKey || "Unknown"}
- Category: ${project.projectCategory?.name || "None"}

`;
        });

        // Save the projects data
        const savedPath = await saveData(
            outputDir,
            `projects_${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
            {
                fetchedAt: new Date().toISOString(),
                rawData: projects,
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
                    text: `Error fetching JIRA projects: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
