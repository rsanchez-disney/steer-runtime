import { remotes, defaultRemote } from "../utils/apiClient.js";

export const githubListRemotesSchema = {
    name: "github_list_remotes",
    description: "List all configured GitHub remotes",
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};

export async function handleGithubListRemotes() {
    const configs = Object.entries(remotes).map(([host, config]) => ({
        hostname: host,
        apiUrl: config.apiUrl,
    }));

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(
                    {
                        remotes: Object.keys(remotes),
                        default: defaultRemote,
                        configs,
                    },
                    null,
                    2,
                ),
            },
        ],
    };
}
