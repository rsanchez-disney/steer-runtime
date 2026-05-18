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


---

<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-23 -->
# DPE Data Service — Architecture

## Tech Stack
- Language: Java 17
- Framework: Spring Boot 3.4.3
- API: GraphQL (spring-boot-starter-graphql, GraphiQL enabled)
- Database: MySQL 8.0 (RDS) via Spring Data JPA
- Auth: OAuth2 (JWT + Opaque tokens)
- Build: Maven 3.8+
- Logging: wdpr-loggingapi (JSON → Splunk)

## Data Model (Key Tables)
| Table | Purpose |
|-------|---------|
| product | Product definitions, calculator assignments |
| rate | Base prices per date/age |
| rate_grid | Rate grid templates |
| discount | Discount rules and amounts |
| commission | Commission rules and rates |
| tax | Tax rules and rates |
| adjustment | Price adjustments (including DOD) |
| price_change_set | Scheduled pricing updates |
| product_change_set | Scheduled product config changes |
| bundle_category | Bundle component groupings |
| classification | Hierarchical product categorization |
| impact_job_history | Deduplication for Impact Analysis runs |

## Schema Version
- DataService requires schema v2.5+
- Calculator Service requires schema v3.6+
- Validated on startup — service fails to start on mismatch

## Critical Flows

### Change Set Lifecycle
```
Create → Validate (effective date, preprocessing window)
  → Persist to MySQL → Trigger Impact Analysis Lambda
  → Export to S3 (if enabled) → Notify Cache Service
  → Wait for effective date → Apply atomically → Mark ACTIVE
```

### Cache Invalidation Trigger
Any data mutation (product, rate, discount, commission, tax, adjustment) triggers cache invalidation via Cache Service REST API.

## Dependencies
| Service | Purpose |
|---|---|
| MySQL (dpe) | Primary data store |
| S3 | Change set JSON exports |
| Cache Service (8080) | Cache invalidation |
| Impact Analysis Lambda | Change impact assessment |
| OAuth2 AuthZ Server | Token validation |

## Deployment
- AWS ECS (per site: WDW, DLR, DLP)
- Docker: non-root UID 1000 / GID 3000
- Health: `/actuator/health`
- Connection pooling: HikariCP (max 100)
- CI/CD: Harness (`.harness/`)


---

<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-27 -->
# DPE Data Service — Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/graphql` | All data queries and mutations | OAuth2 |
| GET | `/graphiql` | Interactive GraphQL explorer | OAuth2 |
| GET | `/actuator/health` | Health check | None |
| GET | `/actuator/info` | Service info | None |

## Key GraphQL Operations

| Type | Operation | Description |
|------|-----------|-------------|
| Query | `products` | List/filter products with pagination |
| Query | `product` | Get product by code |
| Query | `priceChangeSets` | List change sets by effective date |
| Query | `productChangeSets` | List product change sets |
| Mutation | `createProduct` | Create product with rates |
| Mutation | `updateProduct` | Update product metadata |
| Mutation | `createPriceChangeSet` | Schedule pricing update |
| Mutation | `createProductChangeSet` | Schedule product config change |
| Mutation | `runManualImpactAnalysis` | Trigger Impact Analysis Lambda |


---

<!-- owner: @dpe-team -->
<!-- last-updated: 2026-04-27 -->
# DPE Data Service — Patterns

## Change Set Pattern
- All pricing changes go through change sets (never direct DB updates)
- Change sets have effective dates — applied when date arrives
- Price change sets: rate/discount changes
- Product change sets: product config changes (calculator, components)

## Configuration Toggles
- Feature flags control past-date operations (create/delete)
- S3 export toggle for change set JSON backup
- All toggles default to `false` (safe by default)

## Cache Invalidation
- Data mutations trigger cache invalidation via Cache Service
- Price Factor Change Broker handles event-driven eviction
- Pattern: write → invalidate → confirm
