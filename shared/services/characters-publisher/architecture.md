<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Characters Publisher — Architecture

## Repository
`wdpro-development/characters-publisher-lambda`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 11 |
| Framework | Spring Boot (Lambda context) |
| Runtime | AWS Lambda (SAM) |
| Build | Maven multi-module |
| Data Store | Couchbase SDK 3.10.1 |
| HTTP Clients | OpenFeign (realtime-content-wrapper 7.6.0) |
| Secrets | Vault + Jasypt |
| CI/CD | Harness |

## Modules

| Module | Purpose |
|--------|---------|
| `characters-core` | Business logic — source fetching, transformation, publishing |
| `characters-lambda` | Lambda handler and SAM deployment configuration |

## Dependencies

| Service | Purpose |
|---------|---------|
| OpSheet | Character operational data |
| Explorer Service | Character entity data |
| Vault | Secret management (Couchbase credentials, service auth) |

## Data Flow

```
┌─────────────────────┐
│   OpSheet            │──┐
└─────────────────────┘  │    ┌──────────────────────────┐    ┌─────────────────────────┐
                          ├───▶│  Transform (per market)  │───▶│  Couchbase              │
┌─────────────────────┐  │    └──────────────────────────┘    │  bucket: park-platform-pub│
│  Explorer Service    │──┘                                    │  channel: {dest}.characters.{ver}│
└─────────────────────┘                                        └─────────────────────────┘
```

### Processing Strategy

Two strategies available, selected at runtime:

| Strategy | Class | Behavior |
|----------|-------|----------|
| Primary | `OpSheetSyncStrategy` | Reactive (Project Reactor), processes markets concurrently |
| Fallback | `LegacySyncStrategy` | Sequential per-market processing |

## Deployment

- **Runtime**: AWS Lambda (Java 11, 512MB memory, 300s timeout)
- **Triggers**: CloudWatch cron (every 10 min) + API Gateway GET
- **Infrastructure**: SAM template (`template.yaml`)
- **CI/CD**: Harness pipeline
- **Environments**: latest, stage, production
