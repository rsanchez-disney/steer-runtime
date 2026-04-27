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
