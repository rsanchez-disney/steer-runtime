# Finder Assembler Service (FAS) — Architecture

## Repository
`wdpro-development/wdpr-experience-01431-fas`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring 5.3.18 |
| API | Apache CXF 3.5.5 (JAX-RS) |
| Packaging | WAR deployed on Tomcat 9 |
| Cache | Redis + Couchbase 3.10.1 |
| Messaging | AWS SNS/SQS |
| Scheduling | Quartz |
| Feature Flags | LaunchDarkly |
| Object Diffing | Javers |
| Config | mpropz / Consul |
| Secrets | Vault |
| CI/CD | Jenkins, Docker on ECR |

### Key Dependencies
- `finder-cache-models` 465.0.0.340 — shared cache model definitions
- `realtime-content-wrapper` 7.6.0 — content retrieval abstraction

## Role: Cache Assembler

FAS is the **cache assembly layer** between upstream content systems and downstream consumers. It does not serve end-user traffic directly. Its responsibilities:

1. Receive change notifications from DScribe (content management system)
2. Fetch full content from Facility Service and other backend sources
3. Assemble/transform content into cache-ready models (`finder-cache-models`)
4. Write assembled data to Redis (hot cache) and Couchbase (warm/persistent cache)
5. Publish change events via AWS SNS/SQS so downstream services react to updates

## Data Flow

```
DScribe (CMS)
    │
    ▼  POST /finder-assembler-service/notify-change
┌─────────────────────────┐
│   Finder Assembler (FAS) │
│                           │
│  1. Parse notification    │
│  2. Fetch from Facility   │
│     Service + backends    │
│  3. Transform → cache     │
│     models                │
│  4. Diff (Javers)         │
│  5. Write Redis +         │
│     Couchbase             │
│  6. Publish SNS/SQS       │
└─────────────────────────┘
    │                │
    ▼                ▼
  Redis          Couchbase
 (hot cache)    (warm cache)
    │
    ▼
  AWS SNS → SQS
    │
    ▼
  Downstream consumers
```

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
