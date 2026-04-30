import { getClient, parseRepo } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
import { formatTimestamp, formatRepoId } from "../utils/formatting.js";

export const githubCreatePrSchema = {
    name: "github_create_pr",
    description: "Create a new GitHub pull request",
    inputSchema: {
        type: "object",
        properties: {
            repo: {
                type: "string",
                description: "Repository in format 'owner/repo' or full URL",
            },
            title: {
                type: "string",
                description: "PR title",
            },
            head: {
                type: "string",
                description: "Source branch name",
            },
            base: {
                type: "string",
                description: "Target branch name (default: main)",
            },
            body: {
                type: "string",
                description: "PR description",
            },
            draft: {
                type: "boolean",
                description: "Create as draft PR (default: false)",
            },
            labels: {
                type: "array",
                items: { type: "string" },
                description: "Array of label names to add to the PR (e.g., [\"upstream-candidate\", \"feature\"])",
            },
            outputDir: {
                type: "string",
                description: "Optional: Directory to save PR data",
            },
        },
        required: ["repo", "title", "head"],
    },
};

export async function handleGithubCreatePr(args: any) {
    const {
        repo,
        title,
        head,
        base = "main",
        body,
        draft = false,
        labels,
        outputDir,
    } = args as {
        repo: string;
        title: string;
        head: string;
        base?: string;
        body?: string;
        draft?: boolean;
        labels?: string[];
        outputDir?: string | false | null;
    };

    const { owner,
        repo: repoName,
    } = parseRepo(repo);
    const octokit = getClient();

    const { data: pr } = await octokit.pulls.create({
        owner,
        repo: repoName,
        title,
        head,
        base,
        body,
        draft,
    });

    if (labels && labels.length > 0) {
        await octokit.issues.addLabels({
            owner,
            repo: repoName,
            issue_number: pr.number,
            labels,
        });
    }

    let savedInfo = "";
    if (outputDir !== false && outputDir !== null) {
        const filename = `github-pr-created-${formatRepoId(`${owner}/${repoName}`)}-${pr.number}_${formatTimestamp()}.json`;
        const filepath = await saveToFile(pr, filename, outputDir);
        savedInfo = ` and saved to ${filepath}`;
    }

    return {
        content: [
            {
                type: "text",
                text: `GitHub PR #${pr.number} created successfully${savedInfo}\n\nTitle: ${pr.title}\nURL: ${pr.html_url}\nBranch: ${pr.head.ref} → ${pr.base.ref}${labels && labels.length > 0 ? `\nLabels: ${labels.join(", ")}` : ""}`,
            },
        ],
    };
}
