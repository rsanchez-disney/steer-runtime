/**
 * Custom Field Alias Registry
 *
 * Maps human-friendly aliases to Jira custom field IDs.
 * Add new aliases here so every tool (get, search, update, create) resolves them automatically.
 *
 * Usage:
 *   - In tool input the user can pass either the alias ("team") or the raw ID ("customfield_22600").
 *   - resolveCustomFieldIds() normalises an array of mixed aliases/IDs into real field IDs.
 */

/** alias → customfield_XXXXX */
export const CUSTOM_FIELD_ALIASES: Record<string, string> = {
    // ── Team / Org ───────────────────────────────────
    team: "customfield_22600",

    // ── App / Release ────────────────────────────────
    appVersion: "customfield_15301",

    // ── QA / Defect ──────────────────────────────────
    rootCauseAnalysis: "customfield_20805",

    // ── Agile ────────────────────────────────────────
    sprint: "customfield_10003",
    storyPoints: "customfield_10004",
    epicLink: "customfield_13912",

    // ── Studio / Programme ───────────────────────────
    studio: "customfield_20001",

    // ── Test / QA ────────────────────────────────────
    testDetails: "customfield_20104",

    // Add more aliases below as needed:
    // myAlias: "customfield_XXXXX",
};

/** Reverse lookup: customfield_XXXXX → alias (for display) */
const REVERSE_ALIASES: Record<string, string> = Object.fromEntries(
    Object.entries(CUSTOM_FIELD_ALIASES).map(([alias, fieldId]) => [
        fieldId,
        alias,
    ]),
);

/**
 * Resolve an array of aliases / raw field IDs into actual Jira field IDs.
 *
 * Accepts:
 *   - Known alias strings  → resolved via CUSTOM_FIELD_ALIASES
 *   - Raw field IDs        → "customfield_XXXXX" passed through as-is
 *
 * Unknown strings that don't match an alias and don't look like a customfield ID
 * are silently dropped (logged to stderr).
 */
export function resolveCustomFieldIds(input: string[]): string[] {
    const resolved: string[] = [];

    for (const token of input) {
        const lower = token.toLowerCase();

        // 1. Check alias map (case-insensitive)
        const aliasMatch = Object.entries(CUSTOM_FIELD_ALIASES).find(
            ([alias]) => alias.toLowerCase() === lower,
        );
        if (aliasMatch) {
            resolved.push(aliasMatch[1]);
            continue;
        }

        // 2. Already a customfield_XXXXX id
        if (/^customfield_\d+$/i.test(token)) {
            resolved.push(token);
            continue;
        }

        // 3. Unknown – warn and skip
        console.error(
            `[customFields] Unknown alias or field ID: "${token}" – skipping`,
        );
    }

    return [...new Set(resolved)]; // deduplicate
}

/**
 * Return a display-friendly label for a custom field ID.
 * If an alias exists it returns "alias (customfield_XXXXX)", otherwise just the ID.
 */
export function getCustomFieldLabel(fieldId: string): string {
    const alias = REVERSE_ALIASES[fieldId];
    return alias ? `${alias} (${fieldId})` : fieldId;
}

/**
 * Format the value of a custom field for human-readable output.
 * Handles common Jira value shapes (string, object with name/value, arrays, etc.).
 */
export function formatCustomFieldValue(value: unknown): string {
    if (value === null || value === undefined) return "Not set";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean")
        return String(value);

    // Object with name (e.g. sprint, status-like objects)
    if (typeof value === "object" && value !== null) {
        const obj = value as Record<string, unknown>;
        if (obj.name) return String(obj.name);
        if (obj.value) return String(obj.value);
        if (obj.displayName) return String(obj.displayName);

        // Array of objects
        if (Array.isArray(value)) {
            return value.map((v) => formatCustomFieldValue(v)).join(", ");
        }

        // Fallback: compact JSON
        return JSON.stringify(value);
    }

    return String(value);
}
