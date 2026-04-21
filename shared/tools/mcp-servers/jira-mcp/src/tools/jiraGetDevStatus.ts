import { JiraApiClient } from "../utils/jiraApi.js";

export const jiraGetDevStatusSchema = {
    name: "jira_get_dev_status",
    description:
        "Get the Development Panel data for a JIRA ticket — linked pull requests, branches, and commits from GitHub. This is the same data shown in the JIRA Development Panel sidebar.",
    inputSchema: {
        type: "object",
        properties: {
            ticketId: {
                type: "string",
                description: "The JIRA ticket ID (e.g., OPS-26420)",
            },
        },
        required: ["ticketId"],
    },
};

export async function handleJiraGetDevStatus(args: any): Promise<any> {
    try {
        const { ticketId } = args as { ticketId: string };

        const apiClient = new JiraApiClient();

        // First, get the issue's internal numeric ID (dev-status API requires it)
        const ticket = await apiClient.fetchJiraTicket(ticketId, ["summary"]);
        const issueId = ticket.id;

        if (!issueId) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Could not resolve internal issue ID for ${ticketId}.`,
                    },
                ],
                isError: true,
            };
        }

        const devStatus = await apiClient.getDevStatus(issueId);

        // Format the output
        const lines: string[] = [
            `**Development Status for ${ticketId}** (issue ID: ${issueId})`,
            "",
        ];

        const detail = devStatus?.detail;
        if (!detail || detail.length === 0) {
            lines.push("No development data found for this ticket.");
            return {
                content: [{ type: "text", text: lines.join("\n") }],
            };
        }

        for (const provider of detail) {
            const instanceName =
                provider.instanceName || provider.name || "Unknown";
            lines.push(`## ${instanceName}`);
            lines.push("");

            // Pull Requests
            const prs = provider.pullRequests || [];
            if (prs.length > 0) {
                lines.push(`**Pull Requests (${prs.length}):**`);
                for (const pr of prs) {
                    const status = pr.status || "UNKNOWN";
                    const repo = pr.repositoryName || pr.destination?.repository?.name || "";
                    const url = pr.url || "";
                    const title = pr.name || pr.title || "(no title)";
                    const author = pr.author?.name || pr.author?.login || "";
                    const sourceBranch = pr.source?.branch || "";
                    const targetBranch = pr.destination?.branch || "";

                    lines.push(
                        `- [${status}] **${title}** (${repo})`,
                    );
                    if (sourceBranch || targetBranch) {
                        lines.push(
                            `  Branch: ${sourceBranch} → ${targetBranch}`,
                        );
                    }
                    if (author) lines.push(`  Author: ${author}`);
                    if (url) lines.push(`  URL: ${url}`);
                    lines.push("");
                }
            }

            // Branches
            const branches = provider.branches || [];
            if (branches.length > 0) {
                lines.push(`**Branches (${branches.length}):**`);
                for (const branch of branches) {
                    const repo = branch.repository?.name || "";
                    const name = branch.name || "(unnamed)";
                    const url = branch.url || "";
                    lines.push(`- **${name}** (${repo})`);
                    if (url) lines.push(`  URL: ${url}`);
                }
                lines.push("");
            }

            // Commits
            const commits = provider.commits || [];
            if (commits.length > 0) {
                lines.push(`**Commits (${commits.length}):**`);
                for (const commit of commits) {
                    const msg = commit.message || "(no message)";
                    const author = commit.author?.name || "";
                    const hash = commit.id?.substring(0, 8) || "";
                    const url = commit.url || "";
                    lines.push(`- \`${hash}\` ${msg}`);
                    if (author) lines.push(`  Author: ${author}`);
                    if (url) lines.push(`  URL: ${url}`);
                }
                lines.push("");
            }
        }

        return {
            content: [{ type: "text", text: lines.join("\n") }],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error fetching dev status: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
