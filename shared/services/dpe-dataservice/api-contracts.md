<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-23 -->
# DPE Data Service — API Contracts

## Overview
CRUD and data access layer for the DPE database. GraphQL API for managing products, rates, change sets, and all price factors.

## Base URL
| Environment | Port | URL Pattern |
|---|---|---|
| Local | 8080 | `http://localhost:8080/graphql` |
| Dev/Stage/Prod | — | Per-site ECS service (see `aws_applications.md`) |

## Key Operations
| Type | Operation | Description |
|---|---|---|
| Query | products | List/filter products with pagination |
| Query | product | Get product by code |
| Query | priceChangeSets | List change sets by effective date |
| Query | productChangeSets | List product change sets |
| Mutation | createProduct | Create product with rates |
| Mutation | updateProduct | Update product metadata |
| Mutation | createPriceChangeSet | Schedule pricing update |
| Mutation | createProductChangeSet | Schedule product config change |
| Mutation | runManualImpactAnalysis | Trigger Impact Analysis Lambda |

## Authentication
OAuth2 bearer token. Same scopes as Calculator Service.

## Configuration Toggles
| Toggle | Default | Description |
|--------|---------|-------------|
| `ENABLE_CREATE_PAST_EFFECTIVE_DATES` | false | Allow past effective dates |
| `ENABLE_DELETE_PAST_EFFECTIVE_DATES_OVERRIDE` | false | Allow deleting past effective dates |
| `ENABLE_CREATE_PAST_USAGE_DATES` | false | Allow past usage dates |
| `ENABLE_DELETE_PAST_USAGE_DATES_OVERRIDE` | false | Allow deleting past usage dates |
| `ENABLE_CHANGE_SET_JSON_S3_EXPORT` | false | Export change sets to S3 |

## Dependencies
| Service | Purpose |
|---|---|
| MySQL (dpe schema) | Primary data store |
| S3 | Change set exports |
| Cache Service | Cache invalidation on data changes |
| Impact Analysis Lambda | Change impact assessment |
| Price Factor Change Broker | Event-driven cache eviction |
