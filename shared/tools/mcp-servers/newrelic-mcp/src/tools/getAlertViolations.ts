import { apiClient } from "../utils/apiClient.js";
import { sanitizeNrqlString } from "../utils/validators.js";

export const getAlertViolationsSchema = {
    name: "get_alert_violations",
    description:
        "Get active and recent alert violations/incidents from New Relic. " +
        "Shows what's currently alerting and recently resolved issues.",
    inputSchema: {
        type: "object",
        properties: {
            entityName: {
                type: "string",
                description: "Optional: filter violations to a specific entity name",
            },
            onlyOpen: {
                type: "boolean",
                description: "Only return open/active violations (default true)",
                default: true,
            },
            limit: {
                type: "number",
                description: "Maximum violations to return (default 25)",
                default: 25,
            },
        },
        required: [],
    },
};

export async function handleGetAlertViolations(args: any) {
    const { entityName, onlyOpen = true, limit = 25 } = args;

    const acctId = parseInt(apiClient.getAccountId(), 10);

    // Use NRQL to query NrAiIncident for recent violations
    let nrql = `SELECT * FROM NrAiIncident`;
    const conditions: string[] = [];

    if (onlyOpen) {
        conditions.push(`event = 'open'`);
    }
    if (entityName) {
        // NerdGraph's Nrql! scalar type doesn't support parameterized WHERE clauses,
        // so we sanitize the input before interpolation to prevent injection.
        const safeName = sanitizeNrqlString(entityName);
        conditions.push(`entityName LIKE '%${safeName}%'`);
    }

    if (conditions.length > 0) {
        nrql += ` WHERE ${conditions.join(" AND ")}`;
    }

    nrql += ` SINCE 24 hours ago LIMIT ${Math.min(limit, 100)}`;

    const gql = `
        query($accountId: Int!, $nrqlQuery: Nrql!) {
            actor {
                account(id: $accountId) {
                    nrql(query: $nrqlQuery) {
                        results
                    }
                }
            }
        }
    `;

    const data = await apiClient.nerdgraph(gql, {
        accountId: acctId,
        nrqlQuery: nrql,
    });

    const results = data?.actor?.account?.nrql?.results || [];

    // Format for readability
    const violations = results.map((r: any) => ({
        title: r.title || r.conditionName || "Unknown",
        entity: r.entityName || "Unknown",
        priority: r.priority || "Unknown",
        event: r.event || "Unknown",
        openTime: r.openTime || r.timestamp,
        closeTime: r.closeTime || null,
        conditionId: r.conditionId,
        policyName: r.policyName,
    }));

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({ count: violations.length, violations }, null, 2),
            },
        ],
    };
}
