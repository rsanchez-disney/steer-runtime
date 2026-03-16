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

    return summary.join("\n");
}
