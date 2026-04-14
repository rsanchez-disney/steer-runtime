import { getGitHubUrl } from "../utils/apiClient.js";

export const githubListRemotesSchema = {
    name: "github_list_remotes",
    description: "Show the configured GitHub instance URL",
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};

export async function handleGithubListRemotes() {
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({ url: getGitHubUrl() }, null, 2),
            },
        ],
    };
}
