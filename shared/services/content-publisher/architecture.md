<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-28 -->
# Content Publisher (ARTU) — Architecture

## Repository
`wdpro-development/contpub-svc`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot 3.5 (QCP), Spring Boot (REST) |
| Packaging | WAR on Docker (ECS Fargate) |
| Data Store | Couchbase Server |
| Messaging | AWS SQS (via API Gateway) |
| Auth | OAuth2 / MyID / Lambda Authorizer |
| Secrets | Vault + Jasypt |
| API Docs | OpenAPI 3 (Swagger UI) |
| Code Quality | PMD, Checkstyle (Google), JaCoCo |
| CI/CD | Harness |

## Applications

The repo produces **two separate ECS services** that share the same cluster and core business logic:

| Application | Module | Scaling | Handles |
|-------------|--------|---------|---------|
| **Content Publisher REST** | `content-rest-app` | Auto-scales on request count | All non-guest-PUT requests (public CRUD, guest reads/deletes, anonymous CRUD, AREQ) |
| **Queue Content Publisher (QCP)** | `content-queue-consumer` | Auto-scales on queue depth | PUT Guest Data only (via SQS polling) |

Both applications share:
- `content-core` — business logic (publishing, retrieval, market mapping, `ContentPublisher` service)
- `content-input-validations` — input validation rules

## Role

Content Publisher is the **generic content write/read layer** for the Dash real-time platform. It receives content from upstream services and client applications, validates it, and writes to Couchbase Server for propagation to mobile devices via Sync Gateway.

Supports three content scopes:
- **Public content** — available to all mobile app users
- **Guest content (SWID)** — private per-user content
- **Anonymous guest content (app-instance-id)** — semi-private per-device content

## Data Flow

```
Mobile Data Producers → R53 (realtime-pub.wdprapps.disney.com) → Dash ALB
    │
    │  ALB routing rules:
    ├── "CP PUT Guest Data" ──► Dash API Gateway (VPC endpoint, Lambda Authorizer)
    │                                  │
    │                                  ▼
    │                              QCP SQS
    │                                  │
    │                                  ▼  (polling)
    │                          Queue Content Publisher ──► Couchbase
    │
    ├── Any other CP request ──► Content Publisher REST ──► Couchbase
    │
    ├── FSP requests ──► Facility Status Publisher ──► Couchbase
    ├── FP requests ──► Facilities Publisher ──► Couchbase
    └── SP requests ──► Schedules Publisher ──► Couchbase

LS to CP Lambda → QCP SQS → Queue Content Publisher (location-based content)
```

### Queue Content Publisher (QCP) Details

- **Listener**: `@SqsListener` with manual acknowledgement, batch mode
- **Database routing**: Configurable per content type via JSON config — routes to different Couchbase buckets/collections. Default: `PRIVATE` bucket, default collection.
- **TTL enforcement**: Checks if message is expired (SQS sent timestamp + TTL vs current time). Expired messages are acknowledged and discarded.
- **Error handling**: All exceptions acknowledged (no redelivery to avoid poison messages). Errors logged with correlation/conversation IDs.
- **Concurrency**: Detects Couchbase CAS conflicts, logs as concurrency errors.

## Deployment

- **Runtime**: Docker on ECS Fargate (both apps in same cluster)
- **CI/CD**: Harness pipeline
- **Environments**: latest, stage, load, production
- **DNS**: `realtime-pub.wdprapps.disney.com`
- **Context path**: `/content-publisher` (REST app)
