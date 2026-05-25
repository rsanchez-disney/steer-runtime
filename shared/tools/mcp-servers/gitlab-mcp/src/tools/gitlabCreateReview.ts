import { getClient, parseProject } from "../utils/apiClient.js";

export const gitlabCreateReviewSchema = {
    name: "gitlab_create_review",
    description:
        "Create a merge request review by posting inline discussion threads on specific lines of code. Optionally approve or unapprove the MR.",
    inputSchema: {
        type: "object",
        properties: {
            project: {
                type: "string",
                description: "Project in format 'namespace/project' or full URL",
            },
            mrIid: {
                type: "string",
                description: "Merge request IID",
            },
            approve: {
                type: "boolean",
                description: "Whether to approve the MR after posting comments (default: false)",
            },
            body: {
                type: "string",
                description: "Optional: Top-level comment on the MR",
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
                            description: "Line number (new file side)",
                        },
                        body: {
                            type: "string",
                            description: "Comment text (supports markdown)",
                        },
                    },
                    required: ["path", "line", "body"],
                },
            },
        },
        required: ["project", "mrIid", "comments"],
    },
};

export async function handleGitlabCreateReview(args: any) {
    const { project, mrIid, approve = false, body, comments } = args as {
        project: string;
        mrIid: string;
        approve?: boolean;
        body?: string;
        comments: Array<{ path: string; line: number; body: string }>;
    };

    const projectPath = parseProject(project);
    const gl = getClient();
    const iid = parseInt(mrIid);

    // Post top-level comment if provided
    if (body) {
        await gl.MergeRequestNotes.create(projectPath, iid, body);
    }

    // Post inline discussion threads
    for (const comment of comments || []) {
        await gl.MergeRequestDiscussions.create(projectPath, iid, comment.body, {
            position: {
                baseSha: "HEAD~1",
                headSha: "HEAD",
                startSha: "HEAD~1",
                positionType: "text",
                newPath: comment.path,
                newLine: String(comment.line),
            },
        } as any);
    }

    // Approve if requested
    if (approve) {
        await gl.MergeRequestApprovals.approve(projectPath, iid);
    }

    return {
        content: [
            {
                type: "text",
                text: `Review posted on MR !${mrIid}${approve ? " (approved)" : ""}\n\nInline comments: ${(comments || []).length}${body ? "\nTop-level comment: posted" : ""}`,
            },
        ],
    };
}
