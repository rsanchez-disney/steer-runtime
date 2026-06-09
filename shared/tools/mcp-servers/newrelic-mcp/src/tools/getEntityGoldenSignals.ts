import { apiClient } from "../utils/apiClient.js";
import { sanitizeNrqlString } from "../utils/validators.js";

export const getEntityGoldenSignalsSchema = {
    name: "get_entity_golden_signals",
    description:
        "Get the golden signals (response time, throughput, error rate) for an entity by name or GUID. " +
        "Useful for quick health checks on services and applications.",
    inputSchema: {
        type: "object",
        properties: {
            entityName: {
                type: "string",
                description: "The entity name to look up (e.g. 'booking-svc-prod')",
            },
            entityGuid: {
                type: "string",
                description: "The entity GUID (alternative to entityName). Takes priority if both provided.",
            },
            durationMinutes: {
                type: "number",
                description: "Time window in minutes (default 30)",
                default: 30,
            },
        },
        required: [],
    },
};

export async function handleGetEntityGoldenSignals(args: any) {
    const { entityName, entityGuid, durationMinutes = 30 } = args;

    if (!entityName && !entityGuid) {
        return {
            content: [{ type: "text", text: "Error: provide either entityName or entityGuid" }],
        };
    }

    let guid = entityGuid;

    // Resolve name to GUID if needed
    if (!guid && entityName) {
        const searchGql = `
            query($name: String) {
                actor {
                    entitySearch(query: $name) {
                        results {
                            entities {
                                guid
                                name
                                type
                            }
                        }
                    }
                }
            }
        `;
        const searchData = await apiClient.nerdgraph(searchGql, {
            name: `name = '${sanitizeNrqlString(entityName)}'`,
        });
        const entities = searchData?.actor?.entitySearch?.results?.entities || [];
        if (entities.length === 0) {
            return {
                content: [{ type: "text", text: `Entity '${entityName}' not found` }],
            };
        }
        guid = entities[0].guid;
    }

    const gql = `
        query($guid: EntityGuid!) {
            actor {
                entity(guid: $guid) {
                    name
                    type
                    alertSeverity
                    goldenMetrics {
                        metrics {
                            title
                            unit
                            queries {
                                accountId
                                query
                            }
                        }
                    }
                }
            }
        }
    `;

    const data = await apiClient.nerdgraph(gql, { guid });
    const entity = data?.actor?.entity;

    if (!entity) {
        return {
            content: [{ type: "text", text: `Entity with GUID '${guid}' not found` }],
        };
    }

    // Execute each golden metric query to get actual values
    const acctId = parseInt(apiClient.getAccountId(), 10);
    const metricResults: any[] = [];

    if (entity.goldenMetrics?.metrics) {
        for (const metric of entity.goldenMetrics.metrics) {
            if (metric.queries && metric.queries.length > 0) {
                const nrqlQuery = metric.queries[0].query;
                try {
                    const nrqlGql = `
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
                    const nrqlData = await apiClient.nerdgraph(nrqlGql, {
                        accountId: acctId,
                        nrqlQuery: `${nrqlQuery} SINCE ${durationMinutes} minutes ago`,
                    });
                    metricResults.push({
                        title: metric.title,
                        unit: metric.unit,
                        results: nrqlData?.actor?.account?.nrql?.results || [],
                    });
                } catch {
                    metricResults.push({
                        title: metric.title,
                        unit: metric.unit,
                        error: "Failed to fetch metric",
                    });
                }
            }
        }
    }

    const result = {
        entity: {
            name: entity.name,
            type: entity.type,
            alertSeverity: entity.alertSeverity,
        },
        goldenSignals: metricResults,
    };

    return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
}
