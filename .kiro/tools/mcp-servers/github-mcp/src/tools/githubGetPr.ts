import { getClient, getRemoteFromRepo, remotes } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
import { formatTimestamp, formatRepoId } from "../utils/formatting.js";

export const githubGetPrSchema = {
    name: "github_get_pr",
    description: "Fetch a GitHub pull request by repo and PR number",
    inputSchema: {
        type: "object",
        properties: {
            repo: {
                type: "string",
                description: "Repository in format 'owner/repo' or full URL",
            },
            prNumber: {
                type: "string",
                description: "Pull request number",
            },
            remote: {
                type: "string",
                description: `Optional: Explicit remote hostname (${Object.keys(remotes).join(", ")})`,
            },
            outputDir: {
                type: "string",
                description: "Optional: Directory to save PR data",
            },
        },
        required: ["repo", "prNumber"],
    },
};

export async function handleGithubGetPr(args: any) {
    const {
        repo,
        prNumber,
        remote: explicitRemote,
        outputDir,
    } = args as {
        repo: string;
        prNumber: string;
        remote?: string;
        outputDir?: string | false | null;
    };

    const {
        remote,
        owner,
        repo: repoName,
    } = getRemoteFromRepo(repo, explicitRemote);
    const octokit = getClient(remote);
    const prNum = parseInt(prNumber);

    const { data: pr } = await octokit.pulls.get({
        owner,
        repo: repoName,
        pull_number: prNum,
    });

    let savedInfo = "";
    if (outputDir !== false && outputDir !== null) {
        const filename = `github-pr-${formatRepoId(`${owner}/${repoName}`)}-${prNumber}_${formatTimestamp()}.json`;
        const filepath = await saveToFile(pr, filename, outputDir);
        savedInfo = ` and saved to ${filepath}`;
    }

    return {
        content: [
            {
                type: "text",
                text: `GitHub PR #${prNumber} fetched successfully${savedInfo}\n\nTitle: ${pr.title}\nState: ${pr.state}\nAuthor: ${pr.user?.login}\nBranch: ${pr.head.ref} → ${pr.base.ref}`,
            },
        ],
    };
}
