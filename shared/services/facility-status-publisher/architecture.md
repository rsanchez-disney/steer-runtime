<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Facility Status Publisher — Architecture

## Repository
`wdpro-development/facility-status-publisher`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot |
| Packaging | WAR on Tomcat / Docker |
| Data Store | Couchbase Sync Gateway |
| Messaging | Apache Kafka |
| Secrets | Vault + Consul |
| API Docs | Swagger UI |
| Code Quality | PMD, Checkstyle (Google) |
| CI/CD | Harness |

## Modules

| Module | Purpose |
|--------|---------|
| `facility-status-core` | Business logic — status updates, dining status, forecasted wait times |
| `facility-status-messaging` | Kafka consumer for real-time status events |
| `facility-status-aws-lambda` | Lambda deployment variant |
| `facility-status-rest-app` | REST controllers, configuration, Spring Boot app |

## Role

Receives facility status updates (wait times, operating status, dining availability, forecasted wait times) from upstream systems (Radish, Forecaster Service, Kafka/OpSheet) and publishes to Couchbase Server for real-time propagation to mobile devices via Sync Gateway.

## Dependencies

| Service | Purpose |
|---------|---------|
| Radish | Dine wait times |
| Forecaster Service | Forecasted wait times |
| Kafka | Wait times (source: OpSheet; replacing direct OpSheet integration) |
| OpSheet | Wait times (direct; being retired in favor of Kafka) |
| Vault | Secret management (Couchbase password, auth client secret) |

## Data Flow

```
Radish (dine wait times)  ──┐
Forecaster Service (fcst) ──┤
Kafka (wait times)        ──┼──► Facility Status Publisher ──► Couchbase Server
OpSheet (retiring)        ──┘                                  (park-platform-pub)
```

## Deployment

- **Packaging**: Docker image (WAR on Tomcat) + Lambda variant
- **CI/CD**: Harness pipeline
- **Environments**: latest, stage, load, production
- **Context path**: `/facility-status-publisher`
- **Scheduled sync**: Configurable via `trigger.SYNC_TIME`
