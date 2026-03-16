import { getClient, getRemoteFromRepo, remotes } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
import { formatTimestamp, formatRepoId } from "../utils/formatting.js";

export const githubSearchPrsSchema = {
    name: "github_search_prs",
    description: "Search pull requests in a repository",
    inputSchema: {
        type: "object",
        properties: {
            repo: {
                type: "string",
                description: "Repository in format 'owner/repo' or full URL",
            },
            state: {
                type: "string",
                description:
                    "Filter by state: 'open', 'closed', 'all' (default: 'open')",
            },
            head: {
                type: "string",
                description: "Filter by head branch",
            },
            base: {
                type: "string",
                description: "Filter by base branch",
            },
            sort: {
                type: "string",
                description:
                    "Sort by: 'created', 'updated', 'popularity', 'long-running' (default: 'created')",
            },
            direction: {
                type: "string",
                description:
                    "Sort direction: 'asc' or 'desc' (default: 'desc')",
            },
            remote: {
                type: "string",
                description: `Optional: Explicit remote hostname (${Object.keys(remotes).join(", ")})`,
            },
            outputDir: {
                type: "string",
                description: "Optional: Directory to save search results",
            },
        },
        required: ["repo"],
    },
};

export async function handleGithubSearchPrs(args: any) {
    const {
        repo,
        state = "open",
        head,
        base,
        sort = "created",
        direction = "desc",
        remote: explicitRemote,
        outputDir,
    } = args as {
        repo: string;
        state?: string;
        head?: string;
        base?: string;
        sort?: string;
        direction?: string;
        remote?: string;
        outputDir?: string | false | null;
    };

    const {
        remote,
        owner,
        repo: repoName,
    } = getRemoteFromRepo(repo, explicitRemote);
    const octokit = getClient(remote);

    const { data: prs } = await octokit.pulls.list({
        owner,
        repo: repoName,
        state: state as any,
        head,
        base,
        sort: sort as any,
        direction: direction as any,
    });

    let savedInfo = "";
    if (outputDir !== false && outputDir !== null) {
        const filename = `github-prs-search-${formatRepoId(`${owner}/${repoName}`)}_${formatTimestamp()}.json`;
        const filepath = await saveToFile(prs, filename, outputDir);
        savedInfo = ` and saved to ${filepath}`;
    }

    return {
        content: [
            {
                type: "text",
                text: `GitHub PRs search completed successfully${savedInfo}\n\nTotal PRs found: ${prs.length}\nState: ${state}`,
            },
        ],
    };
}
