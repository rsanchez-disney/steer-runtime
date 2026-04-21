import { getClient, parseRepo } from "../utils/apiClient.js";

export const githubCreateReviewSchema = {
    name: "github_create_review",
    description:
        "Create a pull request review with inline comments on specific lines of code. Supports COMMENT, APPROVE, or REQUEST_CHANGES events.",
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
            event: {
                type: "string",
                enum: ["COMMENT", "APPROVE", "REQUEST_CHANGES"],
                description:
                    "Review action: COMMENT (neutral), APPROVE, or REQUEST_CHANGES",
            },
            body: {
                type: "string",
                description: "Optional: Top-level review body text",
            },
            comments: {
                type: "array",
                description: "Inline comments to attach to specific lines",
                items: {
                    type: "object",
                    properties: {
                        path: {
                            type: "string",
                            description: "File path relative to repo root",
                        },
                        line: {
                            type: "number",
                            description:
                                "Line number in the diff to comment on (new file line)",
                        },
                        body: {
                            type: "string",
                            description: "Comment text (supports markdown)",
                        },
                        side: {
                            type: "string",
                            enum: ["LEFT", "RIGHT"],
                            description:
                                "Side of the diff: LEFT (deletion) or RIGHT (addition). Defaults to RIGHT",
                        },
                    },
                    required: ["path", "line", "body"],
                },
            },
        },
        required: ["repo", "prNumber", "event", "comments"],
    },
};

export async function handleGithubCreateReview(args: any) {
    const { repo, prNumber, event, body, comments } = args as {
        repo: string;
        prNumber: string;
        event: "COMMENT" | "APPROVE" | "REQUEST_CHANGES";
        body?: string;
        comments: Array<{
            path: string;
            line: number;
            body: string;
            side?: "LEFT" | "RIGHT";
        }>;
    };

    const { owner, repo: repoName } = parseRepo(repo);
    const octokit = getClient();
    const prNum = parseInt(prNumber, 10);
    if (isNaN(prNum)) {
        throw new Error(`Invalid PR number: "${prNumber}"`);
    }

    const reviewComments = (comments || []).map((c) => ({
        path: c.path,
        line: c.line,
        body: c.body,
        side: c.side || ("RIGHT" as const),
    }));

    const { data: review } = await octokit.pulls.createReview({
        owner,
        repo: repoName,
        pull_number: prNum,
        event: event || "COMMENT",
        comments: reviewComments,
        ...(body ? { body } : {}),
    });

    return {
        content: [
            {
                type: "text",
                text: `Review submitted on PR #${prNum} (${event})\n\nReview ID: ${review.id}\nState: ${review.state}\nComments: ${reviewComments.length} inline comment(s)\nURL: ${review.html_url}`,
            },
        ],
    };
}
