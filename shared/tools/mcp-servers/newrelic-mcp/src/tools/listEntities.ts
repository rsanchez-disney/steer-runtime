import { apiClient } from "../utils/apiClient.js";
import { sanitizeNrqlString } from "../utils/validators.js";

export const listEntitiesSchema = {
    name: "list_entities",
    description:
        "Search for monitored entities (applications, hosts, services, etc.) in New Relic. " +
        "Returns entity names, types, GUIDs, and alerting status.",
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description:
                    'Search query to filter entities by name (e.g. "booking-svc", "payment"). Leave empty to list all.',
            },
            entityType: {
                type: "string",
                description:
                    "Filter by entity type: APPLICATION, HOST, MONITOR, WORKLOAD, DASHBOARD, MOBILE_APPLICATION",
                enum: [
                    "APPLICATION",
                    "HOST",
                    "MONITOR",
                    "WORKLOAD",
                    "DASHBOARD",
                    "MOBILE_APPLICATION",
                ],
            },
            limit: {
                type: "number",
                description: "Maximum number of entities to return (default 25, max 100)",
                default: 25,
            },
        },
        required: [],
    },
};

export async function handleListEntities(args: any) {
    const { query, entityType, limit = 25 } = args;

    let searchQuery = "";
    if (query) searchQuery += `name LIKE '${sanitizeNrqlString(query)}'`;
    if (entityType) {
        if (searchQuery) searchQuery += " AND ";
        searchQuery += `type = '${entityType}'`;
    }

    const effectiveLimit = Math.min(limit, 100);
    const gql = `
        query($searchQuery: String) {
            actor {
                entitySearch(query: $searchQuery) {
                    results {
                        entities {
                            guid
                            name
                            type
                            domain
                            entityType
                            alertSeverity
                            reporting
                            tags {
                                key
                                values
                            }
                        }
                    }
                }
            }
        }
    `;

    const data = await apiClient.nerdgraph(gql, {
        searchQuery: searchQuery || null,
    });

    let entities = data?.actor?.entitySearch?.results?.entities || [];
    // Apply limit client-side since NerdGraph entitySearch doesn't support limit on results
    entities = entities.slice(0, effectiveLimit);

    // Format for readability
    const summary = entities.map((e: any) => ({
        name: e.name,
        type: e.entityType,
        domain: e.domain,
        alertSeverity: e.alertSeverity || "NOT_CONFIGURED",
        reporting: e.reporting,
        guid: e.guid,
    }));

    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({ count: summary.length, entities: summary }, null, 2),
            },
        ],
    };
}
