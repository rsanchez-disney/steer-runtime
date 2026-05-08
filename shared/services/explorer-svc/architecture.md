# Explorer Service — Architecture

## Role

Explorer Service is the consumer-facing read API for Walt Disney World facility and schedule data. It sits downstream of the Finder Aggregation Service (FAS) cache layer and serves pre-aggregated content to web, mobile, and internal clients with low-latency responses via a two-tier caching strategy.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring 5.3.26 |
| JAX-RS | Apache CXF 3.5.9 |
| Packaging | WAR deployed on Tomcat 9 |
| Local Cache | EhCache |
| Remote Cache | Redis |
| Search | Elasticsearch (Jest client) |
| Shared Models | finder-cache-models 465.0.0.340 |
| Field Filtering | wdpr-partial-response |
| Container | Docker on ECR |
| CI/CD | Jenkins |
| Config | mpropz |
| Secrets | Vault |

## Two-Tier Cache Strategy

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Client    │──────▶│  EhCache    │──────▶│   Redis     │
│             │       │  (local)    │       │  (remote)   │
└─────────────┘       └─────────────┘       └─────────────┘
                            │ miss               │ miss
                            ▼                    ▼
                      ┌─────────────────────────────────┐
                      │  FAS Cache / Elasticsearch      │
                      └─────────────────────────────────┘
```

- **EhCache (local, in-JVM):** Sub-millisecond reads for hot data. Used by `finder-data` endpoints.
- **Redis (remote, shared):** Shared across instances. Used by `finder-data-feed` endpoints.
- **Cache population:** FAS builds and publishes aggregated facility/schedule models into the shared cache using `finder-cache-models`. Explorer reads from this cache — it never calls upstream source systems directly.

## Data Flow

1. Upstream source systems publish events (schedules, facility updates).
2. FAS aggregates and transforms data, writing to Redis and triggering local cache invalidation.
3. Explorer Service reads from local EhCache first; on miss, falls through to Redis.
4. Elasticsearch provides search/filter/facet capabilities for list and map queries.
5. Responses are shaped via `wdpr-partial-response` field filtering before returning to clients.

## Repository

`wdpro-development/wdpr-experience-01431-explr`
