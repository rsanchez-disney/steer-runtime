import { JiraApiClient } from "../utils/jiraApi.js";

export const jiraGetDevStatusSchema = {
    name: "jira_get_dev_status",
    description:
        "Get the Development Panel data for a JIRA ticket — linked pull requests, branches, and commits from GitHub. Server-only (not available on Jira Cloud).",
    inputSchema: {
        type: "object",
        properties: {
            ticketId: {
                type: "string",
                description: "The JIRA ticket ID (e.g., PROJ-123)",
            },
        },
        required: ["ticketId"],
    },
};

export async function handleJiraGetDevStatus(args: any): Promise<any> {
    try {
        const { ticketId } = args as { ticketId: string };
        const apiClient = new JiraApiClient();

        const ticket = await apiClient.fetchJiraTicket(ticketId, ["summary"]);
        const issueId = ticket.id;

        if (!issueId) {
            return {
                content: [{ type: "text", text: `Could not resolve internal issue ID for ${ticketId}.` }],
                isError: true,
            };
        }

        const devStatus = await apiClient.getDevStatus(issueId);
        const lines: string[] = [`**Development Status for ${ticketId}** (issue ID: ${issueId})`, ""];

        const detail = devStatus?.detail;
        if (!detail || detail.length === 0) {
            lines.push("No development data found for this ticket.");
            return { content: [{ type: "text", text: lines.join("\n") }] };
        }

        for (const provider of detail) {
            lines.push(`## ${provider.instanceName || provider.name || "Unknown"}`, "");

            for (const pr of provider.pullRequests || []) {
                const status = pr.status || "UNKNOWN";
                const repo = pr.repositoryName || pr.destination?.repository?.name || "";
                lines.push(`- [${status}] **${pr.name || pr.title || "(no title)"}** (${repo})`);
                if (pr.source?.branch || pr.destination?.branch)
                    lines.push(`  Branch: ${pr.source?.branch || ""} → ${pr.destination?.branch || ""}`);
                if (pr.author?.name || pr.author?.login)
                    lines.push(`  Author: ${pr.author?.name || pr.author?.login}`);
                if (pr.url) lines.push(`  URL: ${pr.url}`);
                lines.push("");
            }

            for (const branch of provider.branches || []) {
                lines.push(`- **${branch.name || "(unnamed)"}** (${branch.repository?.name || ""})`);
                if (branch.url) lines.push(`  URL: ${branch.url}`);
            }
            if (provider.branches?.length) lines.push("");

            for (const commit of provider.commits || []) {
                lines.push(`- \`${(commit.id || "").substring(0, 8)}\` ${commit.message || "(no message)"}`);
                if (commit.author?.name) lines.push(`  Author: ${commit.author.name}`);
                if (commit.url) lines.push(`  URL: ${commit.url}`);
            }
            if (provider.commits?.length) lines.push("");
        }

        return { content: [{ type: "text", text: lines.join("\n") }] };
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error fetching dev status: ${error instanceof Error ? error.message : "Unknown error"}` }],
            isError: true,
        };
    }
}
