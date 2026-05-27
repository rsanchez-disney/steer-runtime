import { getGitLabUrl } from "../utils/apiClient.js";

export const gitlabListRemotesSchema = {
    name: "gitlab_list_remotes",
    description: "Show the configured GitLab instance URL",
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};

export async function handleGitlabListRemotes() {
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({ url: getGitLabUrl() }, null, 2),
            },
        ],
    };
}
