import { getClient, parseRepo } from "../utils/apiClient.js";
import { saveToFile } from "../utils/fileUtils.js";
import { formatTimestamp, formatRepoId } from "../utils/formatting.js";

export const githubUpdatePrSchema = {
    name: "github_update_pr",
    description:
        "Update a GitHub pull request (title, description, assignees, reviewers, labels)",
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
            title: {
                type: "string",
                description: "New PR title",
            },
            body: {
                type: "string",
                description: "New PR description",
            },
            state: {
                type: "string",
                description: "PR state: 'open' or 'closed'",
            },
            assignees: {
                type: "array",
                items: { type: "string" },
                description: "Array of usernames to assign",
            },
            reviewers: {
                type: "array",
                items: { type: "string" },
                description: "Array of usernames to request review from",
            },
            labels: {
                type: "array",
                items: { type: "string" },
                description: "Array of label names to add to the PR",
            },
            outputDir: {
                type: "string",
                description: "Optional: Directory to save updated PR data",
            },
        },
        required: ["repo", "prNumber"],
    },
};

export async function handleGithubUpdatePr(args: any) {
    const {
        repo,
        prNumber,
        title,
        body,
        state,
        assignees,
        reviewers,
        labels,
        outputDir,
    } = args as {
        repo: string;
        prNumber: string;
        title?: string;
        body?: string;
        state?: string;
        assignees?: string[];
        reviewers?: string[];
        labels?: string[];
        outputDir?: string | false | null;
    };

    const { owner,
        repo: repoName,
    } = parseRepo(repo);
    const octokit = getClient();
    const prNum = parseInt(prNumber);

    const updateData: any = {
        owner,
        repo: repoName,
        pull_number: prNum,
    };

    if (title) updateData.title = title;
    if (body) updateData.body = body;
    if (state) updateData.state = state;

    const { data: pr } = await octokit.pulls.update(updateData);

    if (assignees) {
        await octokit.issues.addAssignees({
            owner,
            repo: repoName,
            issue_number: prNum,
            assignees,
        });
    }

    if (reviewers) {
        await octokit.pulls.requestReviewers({
            owner,
            repo: repoName,
            pull_number: prNum,
            reviewers,
        });
    }

    if (labels && labels.length > 0) {
        await octokit.issues.addLabels({
            owner,
            repo: repoName,
            issue_number: prNum,
            labels,
        });
    }

    let savedInfo = "";
    if (outputDir !== false && outputDir !== null) {
        const filename = `github-pr-updated-${formatRepoId(`${owner}/${repoName}`)}-${prNumber}_${formatTimestamp()}.json`;
        const filepath = await saveToFile(pr, filename, outputDir);
        savedInfo = ` and saved to ${filepath}`;
    }

    return {
        content: [
            {
                type: "text",
                text: `GitHub PR #${prNumber} updated successfully${savedInfo}\n\nTitle: ${pr.title}\nState: ${pr.state}${labels && labels.length > 0 ? `\nLabels added: ${labels.join(", ")}` : ""}`,
            },
        ],
    };
}
