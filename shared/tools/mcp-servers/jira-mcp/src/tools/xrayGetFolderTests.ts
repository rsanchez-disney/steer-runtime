import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayGetFolderTestsSchema = {
    name: "xray_get_folder_tests",
    description:
        "List all tests in a specific Test Repository folder",
    inputSchema: {
        type: "object",
        properties: {
            projectKey: {
                type: "string",
                description: "The JIRA project key (e.g., DPAY)",
            },
            folderId: {
                type: "string",
                description: "The ID of the folder to list tests from",
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
        required: ["projectKey", "folderId"],
    },
};

export async function handleXrayGetFolderTests(args: any): Promise<any> {
    try {
        const { projectKey, folderId, page, limit } = args as {
            projectKey: string;
            folderId: string;
            page?: number;
            limit?: number;
        };

        const apiClient = new JiraApiClient();
        const result = await apiClient.getXrayFolderTests(projectKey, folderId, page, limit);

        const tests = result?.tests || result || [];

        if (!Array.isArray(tests) || tests.length === 0) {
            return {
                content: [{ type: "text", text: `No tests found in folder ${folderId} for project ${projectKey}.` }],
            };
        }

        let text = `**Tests in Folder ${folderId} (${projectKey})**\n\n`;
        text += `Found ${tests.length} test(s):\n\n`;

        for (const test of tests) {
            const key = test.key || test.testKey || "unknown";
            const summary = test.summary || test.name || "";
            text += `- ${key}${summary ? `: ${summary}` : ""}\n`;
        }

        if (result?.totalCount !== undefined) {
            text += `\nTotal: ${result.totalCount}`;
            if (page) text += ` | Page: ${page}`;
            if (limit) text += ` | Limit: ${limit}`;
            text += "\n";
        }

        return {
            content: [{ type: "text", text }],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error getting folder tests: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
