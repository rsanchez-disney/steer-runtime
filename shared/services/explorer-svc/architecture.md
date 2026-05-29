<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-28 -->
# Explorer Service — Architecture

## Repository
`wdpro-development/wdpr-experience-01431-explr`

## Role

Explorer Service is the consumer-facing read API for Disney park facility and schedule data (WDW, DLR, HKDL). It sits downstream of the Finder Assembler Service (FAS) cache layer and serves pre-aggregated content to web, mobile, internal clients, and third-party integrations with low-latency responses via a two-tier caching strategy.

Explorer is also a data source for several publishers (Characters, Facilities, Schedules, Transportation) and provides guest & cast discovery data to KB Ingress Lambda.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring 5.3.26 |
| JAX-RS | Apache CXF 3.5.9 |
| Packaging | WAR deployed on Tomcat 9 |
| Local Cache | EhCache |
| Remote Cache | Redis |
| Scheduling | Quartz 2.3.2 |
| Shared Models | finder-cache-models 470.0.0.345 |
| Field Filtering | wdpr-partial-response |
| Auth | authz library (OAuth2) + OneID JWT (v4 + v5) |
| Config | mpropz |
| Secrets | Vault |
| Container | Docker on ECR |
| CI/CD | Harness |

## Two-Tier Cache Strategy

```
┌─────────────┐       ┌─────────────┐  miss   ┌─────────────┐  miss   ┌──────────┐
│   Client    │──────▶│  EhCache    │────────▶│   Redis     │────────▶│ 404      │
│             │       │  (L1 local) │         │  (L2 remote)│         │ Not Found│
└─────────────┘       └─────────────┘         └─────────────┘         └──────────┘
                            │ hit                    │ hit
                            ▼                        ▼
                        Response                 Populate L1 + Response

L1 Update: FAS → Redis (write) → Redis Pub/Sub → Explorer (subscription) → EhCache refresh
```

- **EhCache (local, in-JVM):** Sub-millisecond reads for hot data. Used by `finder-data` endpoints. Updated via Redis Pub/Sub subscription; TTL as fallback safety net.
- **Redis (remote, shared):** Shared across instances. Used by `finder-data-feed` endpoints.
- **Cache population:** FAS builds and publishes aggregated facility/schedule models into Redis using `finder-cache-models`. Explorer reads from this cache — it never calls upstream source systems directly.

## Data Flow

1. FAS aggregates and transforms data, writing to Redis.
2. Explorer Service reads from local EhCache first; on miss, falls through to Redis.
3. Responses are shaped via `wdpr-partial-response` field filtering before returning to clients.

## Deployment

- **Runtime**: Docker on ECS Fargate (Tomcat 9)
- **CI/CD**: Harness pipeline
- **Environments**: latest, stage, load, production
- **Context path**: `/explorer-service`
- **DNS**: `explorer.wdprapps.disney.com`
