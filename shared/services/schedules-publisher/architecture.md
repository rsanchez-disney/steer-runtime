<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Schedules Publisher — Architecture

## Repository
`wdpro-development/schedules-publisher`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot |
| Packaging | WAR on Tomcat / Docker |
| Data Store | Couchbase (park-platform-pub + txp public) |
| Messaging | AWS EventBridge |
| Scheduling | Spring `@Scheduled` |
| Secrets | Vault + Jasypt |
| API Docs | Swagger UI |
| CI/CD | Harness |

## Modules

| Module | Purpose |
|--------|---------|
| `schedules-core` | Business logic — schedule fetching, transformation, blockouts, closed restaurants |
| `schedules-rest-app` | REST controller, scheduled triggers, configuration |
| `schedules-aws-lambda` | Lambda deployment variant |

## Role

Aggregates schedule data (operating hours, blockouts, closed restaurants, meal periods) from Explorer Service and publishes to Couchbase for mobile app consumption.

## Dependencies

| Service | Purpose |
|---------|---------|
| Explorer Service | Source of schedule/operating hours data |
| Vault | Secret management (Couchbase credentials, service auth) |

## Data Flow

```
Explorer Service
    │
    ▼  (OAuth2 authenticated)
┌─────────────────────────────────┐
│   Schedules Publisher            │
│                                  │
│  1. Fetch schedules per dest     │
│  2. Fetch blockouts              │
│  3. Fetch closed restaurants     │
│  4. Transform per database type  │
│  5. Write to Couchbase           │
└─────────────────────────────────┘
    │
    ▼
  Couchbase Server
  (park-platform-pub + txp)
```

## Deployment

- **Packaging**: Docker image (WAR on Tomcat) + Lambda variant
- **CI/CD**: Harness pipeline
- **Environments**: latest, stage, load, production
- **Context path**: `/schedules-publisher`
