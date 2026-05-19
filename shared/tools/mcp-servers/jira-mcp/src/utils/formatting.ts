import { CUSTOM_FIELD_ALIASES } from "./customFields.js";
import type { JiraTicket } from "./types.js";

export function formatDate(dateString?: string): string {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function buildFormattedSummary(
    ticket: JiraTicket,
    requestedFields: string[],
): string {
    const summary = [`**${ticket.key}: ${ticket.fields.summary}**`, ""];

    if (requestedFields.includes("status") && ticket.fields.status) {
        summary.push(`**Status:** ${ticket.fields.status.name}`);
    }
    if (requestedFields.includes("assignee")) {
        summary.push(
            `**Assignee:** ${ticket.fields.assignee?.displayName || "Unassigned"}`,
        );
    }
    if (requestedFields.includes("reporter")) {
        summary.push(
            `**Reporter:** ${ticket.fields.reporter?.displayName || "Unknown"}`,
        );
    }
    if (requestedFields.includes("priority") && ticket.fields.priority) {
        summary.push(`**Priority:** ${ticket.fields.priority.name}`);
    }
    if (requestedFields.includes("created")) {
        summary.push(`**Created:** ${formatDate(ticket.fields.created)}`);
    }
    if (requestedFields.includes("updated")) {
        summary.push(`**Updated:** ${formatDate(ticket.fields.updated)}`);
    }
    if (requestedFields.includes("labels") && ticket.fields.labels?.length) {
        summary.push(`**Labels:** ${ticket.fields.labels.join(", ")}`);
    }
    if (
        requestedFields.includes("components") &&
        ticket.fields.components?.length
    ) {
        const componentNames = ticket.fields.components
            .map((c) => c.name)
            .join(", ");
        summary.push(`**Components:** ${componentNames}`);
    }

    if (requestedFields.includes("description") && ticket.fields.description) {
        summary.push("", "**Description:**", ticket.fields.description);
    }

    if (
        requestedFields.includes("comment") &&
        ticket.fields.comment?.comments?.length
    ) {
        summary.push(
            "",
            `**Comments (${ticket.fields.comment.comments.length}):**`,
        );
        ticket.fields.comment.comments.forEach(
            (comment: any, index: number) => {
                summary.push(
                    "",
                    `**Comment ${index + 1}** by ${comment.author?.displayName || "Unknown"} on ${formatDate(comment.created)}:`,
                    comment.body || "(no content)",
                );
            },
        );
    }

    if (requestedFields.includes("fixVersions") && ticket.fields.fixVersions?.length) {
        summary.push(`**Fix Versions:** ${ticket.fields.fixVersions.map((v: any) => v.name).join(", ")}`);
    }
    if (requestedFields.includes("storyPoints")) {
        const sp = (ticket.fields as any)[CUSTOM_FIELD_ALIASES.storyPoints];
        if (sp !== null && sp !== undefined) {
            summary.push(`**Story Points:** ${sp}`);
        }
    }
    if (requestedFields.includes("issuetype") && ticket.fields.issuetype) {
        summary.push(`**Issue Type:** ${ticket.fields.issuetype.name}`);
    }
    if (requestedFields.includes("parent") && ticket.fields.parent) {
        summary.push(`**Parent:** ${ticket.fields.parent.key} - ${ticket.fields.parent.fields?.summary || "Unknown"}`);
    }
    if (requestedFields.includes("subtasks") && ticket.fields.subtasks?.length) {
        summary.push("", `**Sub-tasks (${ticket.fields.subtasks.length}):**`);
        ticket.fields.subtasks.forEach((st: any) => {
            summary.push(`- ${st.key}: ${st.fields?.summary || "Unknown"} [${st.fields?.status?.name || "Unknown"}]`);
        });
    }
    if (requestedFields.includes("issuelinks") && ticket.fields.issuelinks?.length) {
        summary.push("", `**Issue Links (${ticket.fields.issuelinks.length}):**`);
        ticket.fields.issuelinks.forEach((link: any) => {
            if (link.outwardIssue) {
                const label = link.type?.outward || "relates to";
                const key = link.outwardIssue.key;
                const status = link.outwardIssue.fields?.status?.name || "Unknown";
                const linkSummary = link.outwardIssue.fields?.summary || "Unknown";
                summary.push(`- ${label} ${key} (${status}) — ${linkSummary}`);
            }
            if (link.inwardIssue) {
                const label = link.type?.inward || "relates to";
                const key = link.inwardIssue.key;
                const status = link.inwardIssue.fields?.status?.name || "Unknown";
                const linkSummary = link.inwardIssue.fields?.summary || "Unknown";
                summary.push(`- ${label} ${key} (${status}) — ${linkSummary}`);
            }
        });
    }
        return summary.join("\n");
}
