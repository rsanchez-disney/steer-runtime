/**
 * Security validators for New Relic MCP.
 * Ensures only read-only operations are allowed.
 */

const FORBIDDEN_PATTERNS = [
    /\bDELETE\b/i,
    /\bDROP\b/i,
    /\bINSERT\b/i,
    /\bUPDATE\b/i,
    /\bCREATE\b/i,
    /\bALTER\b/i,
];

/**
 * Validates that a NRQL query is read-only (SELECT/FROM only).
 * Rejects any mutation-like keywords.
 */
export function validateNrqlQuery(query: string): { valid: boolean; error?: string } {
    const trimmed = query.trim();

    // Must start with SELECT or FROM
    if (!/^(SELECT|FROM)\b/i.test(trimmed)) {
        return {
            valid: false,
            error: "NRQL query must start with SELECT or FROM. Only read operations are allowed.",
        };
    }

    // Check for forbidden mutation keywords
    for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(trimmed)) {
            return {
                valid: false,
                error: `Query contains forbidden keyword: ${pattern.source}. Only read operations are allowed.`,
            };
        }
    }

    return { valid: true };
}

/**
 * Sanitizes a string value for safe interpolation into NRQL queries.
 * Removes characters that could be used for injection attacks:
 * - Single quotes (') - used for string delimiters in NRQL
 * - Backslashes (\) - escape character
 * - Newlines (\r, \n) - could break query structure
 *
 * @param value - The string to sanitize
 * @returns Sanitized string safe for NRQL interpolation
 */
export function sanitizeNrqlString(value: string): string {
    return value
        .replace(/'/g, "")
        .replace(/\\/g, "")
        .replace(/[\r\n]/g, " ");
}
