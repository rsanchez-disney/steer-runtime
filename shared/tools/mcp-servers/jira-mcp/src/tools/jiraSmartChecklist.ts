import { JiraApiClient } from "../utils/jiraApi.js";

const PROPERTY_KEY = "com.railsware.SmartChecklist.checklist";

interface ChecklistItem {
    text: string;
    checked: boolean;
    details: string[];
}

function parseChecklist(raw: string): ChecklistItem[] {
    const items: ChecklistItem[] = [];
    const lines = raw.split("\n").filter((l) => l.length > 0);
    for (const line of lines) {
        if (line.startsWith("+ ") || line.startsWith("- ")) {
            items.push({ text: line.slice(2), checked: line.startsWith("+ "), details: [] });
        } else if (line.startsWith("> ") && items.length > 0) {
            items[items.length - 1].details.push(line.slice(2));
        }
    }
    return items;
}

function serializeChecklist(items: ChecklistItem[]): string {
    const lines: string[] = [];
    for (const item of items) {
        lines.push(`${item.checked ? "+" : "-"} ${item.text}`);
        for (const detail of item.details) {
            lines.push(`> ${detail}`);
        }
    }
    return lines.join("\n") + "\n";
}

async function fetchCurrentChecklist(apiClient: JiraApiClient, issueKey: string): Promise<ChecklistItem[]> {
    const result = await apiClient.getIssueProperty(issueKey, PROPERTY_KEY);
    if (!result || !result.value) return [];
    return parseChecklist(result.value);
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const jiraSmartChecklistGetSchema = {
    name: "jira_smart_checklist_get",
    description: "Get the Smart Checklist items from a Jira issue.",
    inputSchema: {
        type: "object",
        properties: {
            issueKey: { type: "string", description: "The Jira issue key (e.g., COM-1234)" },
        },
        required: ["issueKey"],
    },
};

export const jiraSmartChecklistSetSchema = {
    name: "jira_smart_checklist_set",
    description: "Create or replace the entire Smart Checklist on a Jira issue. Use jira_smart_checklist_add_item to append without replacing.",
    inputSchema: {
        type: "object",
        properties: {
            issueKey: { type: "string", description: "The Jira issue key (e.g., COM-1234)" },
            items: {
                type: "array",
                description: "Array of checklist items",
                items: {
                    type: "object",
                    properties: {
                        text: { type: "string", description: "Text content of the checklist item" },
                        checked: { type: "boolean", description: "Whether the item is checked/completed" },
                        details: { type: "array", items: { type: "string" }, description: "Optional detail lines" },
                    },
                    required: ["text", "checked"],
                },
            },
        },
        required: ["issueKey", "items"],
    },
};

export const jiraSmartChecklistAddItemSchema = {
    name: "jira_smart_checklist_add_item",
    description: "Add one or more items to an existing Smart Checklist without replacing it. If no checklist exists, one is created.",
    inputSchema: {
        type: "object",
        properties: {
            issueKey: { type: "string", description: "The Jira issue key (e.g., COM-1234)" },
            items: {
                type: "array",
                description: "Items to append",
                items: {
                    type: "object",
                    properties: {
                        text: { type: "string", description: "Text content" },
                        checked: { type: "boolean", description: "Starts as checked (default: false)" },
                        details: { type: "array", items: { type: "string" }, description: "Optional detail lines" },
                    },
                    required: ["text"],
                },
            },
        },
        required: ["issueKey", "items"],
    },
};

export const jiraSmartChecklistCheckItemSchema = {
    name: "jira_smart_checklist_check_item",
    description: "Check or uncheck a specific item. You MUST provide either 'index' (1-based) or 'match' (text substring) to identify the target item.",
    inputSchema: {
        type: "object",
        properties: {
            issueKey: { type: "string", description: "The Jira issue key (e.g., COM-1234)" },
            index: { type: "number", description: "1-based index of the item to check/uncheck." },
            match: { type: "string", description: "Text substring to match (case-insensitive). First match is used." },
            checked: { type: "boolean", description: "true to check, false to uncheck. Omit to toggle." },
        },
        required: ["issueKey"],
    },
};

export const jiraSmartChecklistDeleteSchema = {
    name: "jira_smart_checklist_delete",
    description: "Delete the entire Smart Checklist from a Jira issue permanently.",
    inputSchema: {
        type: "object",
        properties: {
            issueKey: { type: "string", description: "The Jira issue key (e.g., COM-1234)" },
        },
        required: ["issueKey"],
    },
};

// ─── Handlers ────────────────────────────────────────────────────────────────

export async function handleJiraSmartChecklistGet(args: any): Promise<any> {
    try {
        const { issueKey } = args as { issueKey: string };
        const apiClient = new JiraApiClient();
        const result = await apiClient.getIssueProperty(issueKey, PROPERTY_KEY);
        if (!result || !result.value) {
            return { content: [{ type: "text", text: `No Smart Checklist found on ${issueKey}.` }] };
        }
        const raw: string = result.value;
        const items = parseChecklist(raw);
        const checked = items.filter((i) => i.checked).length;
        let output = `**Smart Checklist for ${issueKey}** (${checked}/${items.length} completed)\n\n`;
        for (let i = 0; i < items.length; i++) {
            output += `${i + 1}. ${items[i].checked ? "☑" : "☐"} ${items[i].text}\n`;
            for (const d of items[i].details) output += `   ↳ ${d}\n`;
        }
        output += `\n---\n**Raw value:**\n\`\`\`\n${raw}\`\`\``;
        return { content: [{ type: "text", text: output }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }], isError: true };
    }
}

export async function handleJiraSmartChecklistSet(args: any): Promise<any> {
    try {
        const { issueKey, items } = args as { issueKey: string; items: Array<{ text: string; checked: boolean; details?: string[] }> };
        const apiClient = new JiraApiClient();
        const normalized: ChecklistItem[] = items.map((i) => ({ text: i.text, checked: i.checked, details: i.details || [] }));
        await apiClient.setIssueProperty(issueKey, PROPERTY_KEY, serializeChecklist(normalized));
        const checked = normalized.filter((i) => i.checked).length;
        let output = `**Smart Checklist updated on ${issueKey}** (${checked}/${normalized.length} items)\n\n`;
        for (const item of normalized) output += `${item.checked ? "☑" : "☐"} ${item.text}\n`;
        return { content: [{ type: "text", text: output }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }], isError: true };
    }
}

export async function handleJiraSmartChecklistAddItem(args: any): Promise<any> {
    try {
        const { issueKey, items } = args as { issueKey: string; items: Array<{ text: string; checked?: boolean; details?: string[] }> };
        const apiClient = new JiraApiClient();
        const current = await fetchCurrentChecklist(apiClient, issueKey);
        const newItems: ChecklistItem[] = items.map((i) => ({ text: i.text, checked: i.checked ?? false, details: i.details || [] }));
        const all = [...current, ...newItems];
        await apiClient.setIssueProperty(issueKey, PROPERTY_KEY, serializeChecklist(all));
        let output = `**Added ${newItems.length} item(s) to ${issueKey}** (${all.length} total)\n\n`;
        for (const item of newItems) output += `${item.checked ? "☑" : "☐"} ${item.text}\n`;
        return { content: [{ type: "text", text: output }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }], isError: true };
    }
}

export async function handleJiraSmartChecklistCheckItem(args: any): Promise<any> {
    try {
        const { issueKey, index, match, checked } = args as { issueKey: string; index?: number; match?: string; checked?: boolean };
        if (!index && !match) {
            return { content: [{ type: "text", text: "Error: Provide 'index' (1-based) or 'match' (text substring)." }], isError: true };
        }
        const apiClient = new JiraApiClient();
        const items = await fetchCurrentChecklist(apiClient, issueKey);
        if (items.length === 0) {
            return { content: [{ type: "text", text: `No Smart Checklist found on ${issueKey}.` }], isError: true };
        }
        let targetIndex = -1;
        if (index !== undefined) {
            targetIndex = index - 1;
            if (targetIndex < 0 || targetIndex >= items.length) {
                return { content: [{ type: "text", text: `Error: Index ${index} out of range (1-${items.length}).` }], isError: true };
            }
        } else if (match) {
            const lower = match.toLowerCase();
            targetIndex = items.findIndex((i) => i.text.toLowerCase().includes(lower));
            if (targetIndex === -1) {
                return { content: [{ type: "text", text: `Error: No item matching "${match}" found.` }], isError: true };
            }
        }
        const item = items[targetIndex];
        item.checked = checked !== undefined ? checked : !item.checked;
        await apiClient.setIssueProperty(issueKey, PROPERTY_KEY, serializeChecklist(items));
        return { content: [{ type: "text", text: `**Item ${targetIndex + 1} ${item.checked ? "checked ☑" : "unchecked ☐"}:** ${item.text}` }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }], isError: true };
    }
}

export async function handleJiraSmartChecklistDelete(args: any): Promise<any> {
    try {
        const { issueKey } = args as { issueKey: string };
        const apiClient = new JiraApiClient();
        await apiClient.deleteIssueProperty(issueKey, PROPERTY_KEY);
        return { content: [{ type: "text", text: `**Smart Checklist deleted from ${issueKey}.**` }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }], isError: true };
    }
}
