import { apiClient } from "../utils/apiClient.js";
import { validateNrqlQuery } from "../utils/validators.js";

export const runNrqlSchema = {
    name: "run_nrql",
    description:
        "Execute a NRQL query against New Relic. Only SELECT/FROM queries are allowed (read-only). " +
        "Returns query results as JSON. Supports TIMESERIES, FACET, COMPARE WITH, and all standard NRQL clauses.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description:
                    'The NRQL query to execute (e.g. "SELECT count(*) FROM Transaction SINCE 1 hour ago")',
            },
            accountId: {
                type: "string",
                description:
                    "Optional account ID override. Defaults to NEW_RELIC_ACCOUNT_ID from environment.",
            },
        },
        required: ["query"],
    },
};

export async function handleRunNrql(args: any) {
    const { query, accountId } = args;

    // Validate query is read-only
    const validation = validateNrqlQuery(query);
    if (!validation.valid) {
        return {
            content: [{ type: "text", text: `Rejected: ${validation.error}` }],
        };
    }

    const acctId = accountId || apiClient.getAccountId();

    const gql = `
        query($accountId: Int!, $nrqlQuery: Nrql!) {
            actor {
                account(id: $accountId) {
                    nrql(query: $nrqlQuery) {
                        results
                        metadata {
                            facets
                            timeWindow {
                                begin
                                end
                            }
                        }
                    }
                }
            }
        }
    `;

    const data = await apiClient.nerdgraph(gql, {
        accountId: parseInt(acctId, 10),
        nrqlQuery: query,
    });

    const nrqlResult = data?.actor?.account?.nrql;

    return {
        content: [{ type: "text", text: JSON.stringify(nrqlResult, null, 2) }],
    };
}
