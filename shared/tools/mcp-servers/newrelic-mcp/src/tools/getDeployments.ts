import { apiClient } from "../utils/apiClient.js";
import { sanitizeNrqlString } from "../utils/validators.js";

export const getDeploymentsSchema = {
    name: "get_deployments",
    description:
        "Get recent deployment markers for an application. Useful for correlating performance changes with deploys.",
    inputSchema: {
        type: "object",
        properties: {
            entityName: {
                type: "string",
                description: "The application/entity name to get deployments for",
            },
            entityGuid: {
                type: "string",
                description: "The entity GUID (alternative to entityName)",
            },
            limit: {
                type: "number",
                description: "Maximum deployments to return (default 10)",
                default: 10,
            },
        },
        required: [],
    },
};

export async function handleGetDeployments(args: any) {
    const { entityName, entityGuid, limit = 10 } = args;

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

    // Query deployments via change tracking
    const gql = `
        query($guid: EntityGuid!) {
            actor {
                entity(guid: $guid) {
                    name
                    deploymentSearch(filter: {timeWindow: {endTime: 0, startTime: 604800000}}) {
                        results {
                            changelog
                            commit
                            deploymentId
                            deploymentType
                            description
                            entityGuid
                            timestamp
                            user
                            version
                        }
                    }
                }
            }
        }
    `;

    try {
        const data = await apiClient.nerdgraph(gql, { guid });
        const entity = data?.actor?.entity;

        if (!entity) {
            return {
                content: [{ type: "text", text: `Entity with GUID '${guid}' not found` }],
            };
        }

        const deployments = (entity.deploymentSearch?.results || []).slice(0, limit);

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(
                        { entity: entity.name, count: deployments.length, deployments },
                        null,
                        2,
                    ),
                },
            ],
        };
    } catch (error) {
        // Fallback: use NRQL to query deployment events
        // NerdGraph's Nrql! scalar doesn't support parameterized WHERE; sanitize input instead.
        const acctId = parseInt(apiClient.getAccountId(), 10);
        const nrql = entityName
            ? `SELECT * FROM Deployment WHERE appName = '${sanitizeNrqlString(entityName)}' SINCE 7 days ago LIMIT ${limit}`
            : `SELECT * FROM Deployment SINCE 7 days ago LIMIT ${limit}`;

        const fallbackGql = `
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

        const fallbackData = await apiClient.nerdgraph(fallbackGql, {
            accountId: acctId,
            nrqlQuery: nrql,
        });

        const results = fallbackData?.actor?.account?.nrql?.results || [];

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ count: results.length, deployments: results }, null, 2),
                },
            ],
        };
    }
}
