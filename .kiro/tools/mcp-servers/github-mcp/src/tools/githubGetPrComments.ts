import { getClient, getRemoteFromRepo, remotes } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
import { formatTimestamp, formatRepoId } from "../utils/formatting.js";

export const githubGetPrCommentsSchema = {
    name: "github_get_pr_comments",
    description: "Fetch comments from a GitHub pull request",
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
                description: "Optional: Directory to save comments data",
            },
        },
        required: ["repo", "prNumber"],
    },
};

export async function handleGithubGetPrComments(args: any) {
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

    const { data: comments } = await octokit.issues.listComments({
        owner,
        repo: repoName,
        issue_number: prNum,
    });

    let savedInfo = "";
    if (outputDir !== false && outputDir !== null) {
        const filename = `github-pr-comments-${formatRepoId(`${owner}/${repoName}`)}-${prNumber}_${formatTimestamp()}.json`;
        const filepath = await saveToFile(comments, filename, outputDir);
        savedInfo = ` and saved to ${filepath}`;
    }

    return {
        content: [
            {
                type: "text",
                text: `GitHub PR #${prNumber} comments fetched successfully${savedInfo}\n\nTotal comments: ${comments.length}`,
            },
        ],
    };
}
