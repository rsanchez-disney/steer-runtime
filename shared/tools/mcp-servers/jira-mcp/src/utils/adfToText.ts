/**
 * Converts Atlassian Document Format (ADF) to plain text.
 * Jira Cloud (API v3) returns description/comment bodies as ADF objects,
 * while Jira Server (API v2) returns plain strings.
 *
 * This normalizes both formats to a plain text string.
 */

interface AdfNode {
    type: string;
    text?: string;
    content?: AdfNode[];
    attrs?: Record<string, unknown>;
}

/**
 * Extracts plain text from an ADF document or returns the value as-is if it's already a string.
 * Returns empty string for null/undefined.
 */
export function adfToText(value: unknown): string {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value !== "object") return String(value);

    const doc = value as AdfNode;
    if (doc.type === "doc" && Array.isArray(doc.content)) {
        return extractTextFromNodes(doc.content).trim();
    }

    // Fallback: if it's an object but not a recognized ADF doc, stringify it
    try {
        return JSON.stringify(value);
    } catch {
        return "[complex content]";
    }
}

function extractTextFromNodes(nodes: AdfNode[]): string {
    const parts: string[] = [];

    for (const node of nodes) {
        switch (node.type) {
            case "paragraph":
                parts.push(extractInlineText(node.content) + "\n");
                break;
            case "heading":
                parts.push(extractInlineText(node.content) + "\n");
                break;
            case "bulletList":
            case "orderedList":
                if (node.content) {
                    for (const item of node.content) {
                        parts.push("- " + extractInlineText(item.content) + "\n");
                    }
                }
                break;
            case "listItem":
                parts.push("- " + extractInlineText(node.content) + "\n");
                break;
            case "blockquote":
                parts.push("> " + extractTextFromNodes(node.content || []) + "\n");
                break;
            case "codeBlock":
                parts.push("```\n" + extractInlineText(node.content) + "\n```\n");
                break;
            case "table":
                if (node.content) {
                    for (const row of node.content) {
                        if (row.content) {
                            const cells = row.content.map(cell => extractInlineText(cell.content));
                            parts.push("| " + cells.join(" | ") + " |\n");
                        }
                    }
                }
                break;
            case "rule":
                parts.push("---\n");
                break;
            case "mediaSingle":
            case "mediaGroup":
                parts.push("[media]\n");
                break;
            case "panel":
                parts.push(extractTextFromNodes(node.content || []));
                break;
            default:
                // Unknown block node — try to extract inline content
                if (node.content) {
                    parts.push(extractTextFromNodes(node.content));
                } else if (node.text) {
                    parts.push(node.text);
                }
                break;
        }
    }

    return parts.join("");
}

function extractInlineText(nodes?: AdfNode[]): string {
    if (!nodes) return "";
    return nodes
        .map((node) => {
            switch (node.type) {
                case "text":
                    return node.text || "";
                case "hardBreak":
                    return "\n";
                case "mention":
                    return `@${(node.attrs as any)?.text || "user"}`;
                case "emoji":
                    return (node.attrs as any)?.shortName || "🙂";
                case "inlineCard":
                    return (node.attrs as any)?.url || "[link]";
                default:
                    // Recurse for nested inline content
                    if (node.content) return extractInlineText(node.content);
                    return node.text || "";
            }
        })
        .join("");
}
