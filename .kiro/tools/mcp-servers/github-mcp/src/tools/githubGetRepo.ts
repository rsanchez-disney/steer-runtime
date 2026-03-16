import { getClient, getRemoteFromRepo, remotes } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
import { formatTimestamp, formatRepoId } from "../utils/formatting.js";

export const githubGetRepoSchema = {
    name: "github_get_repo",
    description: "Fetch GitHub repository information",
    inputSchema: {
        type: "object",
        properties: {
            repo: {
                type: "string",
                description: "Repository in format 'owner/repo' or full URL",
            },
            remote: {
                type: "string",
                description: `Optional: Explicit remote hostname (${Object.keys(remotes).join(", ")})`,
            },
            outputDir: {
                type: "string",
                description: "Optional: Directory to save repo data",
            },
        },
        required: ["repo"],
    },
};

export async function handleGithubGetRepo(args: any) {
    const {
        repo,
        remote: explicitRemote,
        outputDir,
    } = args as {
        repo: string;
        remote?: string;
        outputDir?: string | false | null;
    };

    const {
        remote,
        owner,
        repo: repoName,
    } = getRemoteFromRepo(repo, explicitRemote);
    const octokit = getClient(remote);

    const { data: repoData } = await octokit.repos.get({
        owner,
        repo: repoName,
    });

    let savedInfo = "";
    if (outputDir !== false && outputDir !== null) {
        const filename = `github-repo-${formatRepoId(`${owner}/${repoName}`)}_${formatTimestamp()}.json`;
        const filepath = await saveToFile(repoData, filename, outputDir);
        savedInfo = ` and saved to ${filepath}`;
    }

    return {
        content: [
            {
                type: "text",
                text: `GitHub repository ${owner}/${repoName} fetched successfully${savedInfo}\n\nName: ${repoData.name}\nDescription: ${repoData.description}\nDefault Branch: ${repoData.default_branch}`,
            },
        ],
    };
}
