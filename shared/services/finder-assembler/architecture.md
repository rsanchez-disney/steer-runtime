# Finder Assembler Service (FAS) — Architecture

## Repository
`wdpro-development/wdpr-experience-01431-fas`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring 5.3.18 / Spring Boot 2.5.15 |
| API | Apache CXF 3.5.5 (JAX-RS) |
| Packaging | WAR deployed on Tomcat 9 |
| Cache | Redis |
| Messaging | AWS SNS (publish) / SQS (consume from Yellowjacket) |
| Scheduling | Quartz 2.1.7 |
| Feature Flags | LaunchDarkly (wdpr-java-ld-sdk-wrapper) |
| Object Diffing | Javers 7.8.0 |
| Auth | authz library (OAuth2) |
| Config | mpropz |
| Secrets | Vault |
| Container | Docker on ECR |
| CI/CD | Harness |

### Key Dependencies
- `finder-cache-models` 470.0.0.345 — shared cache model definitions
- `realtime-content-wrapper` 7.6.0 — shared library for reading/writing to Couchbase (used for transportation data; being retired with Transportation Publisher)

## Role: Cache Assembler

FAS is the **cache assembly layer** between upstream content systems and downstream consumers. It does not serve end-user traffic directly. Its responsibilities:

1. Receive change notifications from D-Scribe via Yellowjacket(SNS) → SQS
2. Fetch full content from upstream data sources
3. Assemble/transform content into cache-ready models (`finder-cache-models`)
4. Write assembled data to Redis (hot cache consumed by Explorer Service)
5. Publish change events via AWS SNS so downstream services react to updates

## Upstream Data Sources

| Source | Purpose | Notes |
|--------|---------|-------|
| Watcher (GCx) | Guest-facing and Cast-facing facility data (facets, content, media bundles) | |
| OpSheet | Facility schedules | |
| LaunchDarkly | Feature flag evaluation | |
| Vendomatic via Lists Service | Feature flag evaluation | Being retired, replaced by LaunchDarkly |
| Remy Product Service | Dine products | |
| Lodging Facility Service | Lodging facility data | |
| Lodging Service (ex Pricing Service) | Lodging/pricing data | |
| Lexicon Service | No info available | |
| Transportation System | Next bus arrival times | Being retired → Transportation Publisher |

## Data Flow

```
D-Scribe (CMS) → Yellowjacket (SNS) → SQS
    │
    ▼
┌─────────────────────────┐
│   Finder Assembler (FAS) │
│                           │
│  1. Receive SQS event    │
│  2. Fetch from upstream   │
│     data sources          │
│  3. Transform → cache     │
│     models                │
│  4. Diff (Javers)         │
│  5. Write Redis           │
│  6. Publish SNS           │
└─────────────────────────┘
    │                │
    ▼                ▼
  Redis            AWS SNS
 (→ Explorer)      (→ Search Indexing Svc, KB Ingress Lambda, Parks website)
```

### Integrations Being Retired

| Integration | Replacement |
|-------------|-------------|
| Transportation System → FAS | Transportation System → Transportation Publisher |
| FAS → CB Server (transportation data) | Transportation Publisher → CB Server |
| Vendomatic via Lists Service → FAS | LaunchDarkly → FAS |

## Quartz Scheduling

FAS uses Quartz for periodic background tasks:
- **Full cache rebuilds** — scheduled sweeps that re-assemble all entities to catch missed notifications
- **Stale entry eviction** — removes cache entries that haven't been refreshed within a TTL window
- **Health/consistency checks** — compares source-of-truth data against cached state

Quartz jobs are configured via mpropz/Consul and can be toggled with LaunchDarkly feature flags.

## Environments

| Environment | Purpose |
|-------------|---------|
| latest | Development integration |
| stage | Pre-production validation |
| load | Performance/load testing |
| prod | Production |

## Deployment

- Docker images pushed to AWS ECR
- Jenkins pipelines handle build → test → deploy
- Context path: `/finder-assembler-service`
