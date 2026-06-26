# Architecture specification: payment controls API decomposition

**Status**: Draft
**Author**: Architecture Spec Agent
**Date**: 2026-06-25
**Review by**: Config Studio Engineering Team

---

## 1. Executive summary

### Problem statement

The `wdpr-payment-controls-api` monolithic Node.js BFF handles refund processing, validation logic, and export streaming within a single ECS service. This co-location causes:

- **OOM events** during large streaming exports that exhaust container memory, crashing co-located refund and validation workloads.
- **Inability to scale independently** — refund traffic spikes require over-provisioning memory needed only by exports; validation bursts require CPU that sits idle during off-peak.
- **Deployment coupling** — a validation bug fix requires redeploying the entire service, risking refund availability.
- **Blast radius** — any failure in one domain cascades to all others.

### Proposed solution

Decompose into three services using the strangler fig pattern over ~22 weeks:

| Service              | Responsibility                                    | Resource profile |
|----------------------|---------------------------------------------------|------------------|
| `pc-gateway`         | Backward-compatible v1 route adapter, request fan-out | Low memory, low CPU |
| `pc-refund-service`  | Refund operations, export streaming               | High memory      |
| `pc-validation-service` | Rule validation, comparison, configuration queries | High CPU         |

### Expected outcomes

- Eliminate OOM events by isolating memory-intensive streaming to `pc-refund-service`.
- Enable independent horizontal scaling per workload profile.
- Reduce mean-time-to-deploy from ~45 min (shared pipeline) to ~15 min (independent pipelines).
- Zero breaking changes to the Angular UI during migration — `pc-gateway` preserves all v1 routes.

---

## 2. Component architecture

### 2.1 Current (as-is) architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│                    wdpr-payment-controls-client                       │
│                         (Angular UI)                                  │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │ HTTPS
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│              wdpr-payment-controls-api  (Node.js BFF)                 │
│                                                                      │
│  ┌────────────┐  ┌────────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │  Refund    │  │  Validation    │  │   Export     │  │  Config  │ │
│  │  Routes    │  │  Routes        │  │   Streaming  │  │  Proxy   │ │
│  └─────┬──────┘  └──────┬─────────┘  └──────┬───────┘  └────┬────┘ │
│        │                 │                   │               │      │
│        └─────────────────┴───────────────────┴───────────────┘      │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │ HTTPS
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│           wdpr-config-services  (Java backend)                        │
│                                                                      │
│  ┌───────────┐   ┌───────────┐   ┌──────────┐                      │
│  │ DynamoDB  │   │ MariaDB   │   │   S3     │                      │
│  └───────────┘   └───────────┘   └──────────┘                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Target (to-be) architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│                    wdpr-payment-controls-client                       │
│                         (Angular UI)                                  │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │ HTTPS (unchanged v1 routes)
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        pc-gateway                                     │
│                  (Slim backward-compat adapter)                       │
│                                                                      │
│  ┌──────────────────┐  ┌───────────────────┐  ┌──────────────────┐ │
│  │ v1 Route Shims   │  │  Request Router   │  │  Auth Propagator │ │
│  └────────┬─────────┘  └────────┬──────────┘  └────────┬─────────┘ │
│           └──────────────────────┼──────────────────────┘           │
└──────────────────────────────────┼───────────────────────────────────┘
                    ┌──────────────┼──────────────┐
                    │ HTTP         │ HTTP          │
                    ▼              │               ▼
┌───────────────────────────┐     │  ┌────────────────────────────────┐
│     pc-refund-service     │     │  │    pc-validation-service       │
│                           │     │  │                                │
│ • Refund CRUD             │     │  │ • Rule validation              │
│ • Export streaming        │     │  │ • Client comparison            │
│ • Refund event publishing │     │  │ • Configuration queries        │
│                           │     │  │ • Validation event publishing  │
└─────────────┬─────────────┘     │  └──────────────┬─────────────────┘
              │                   │                  │
              │     ┌─────────────┘                  │
              │     │                                │
              ▼     ▼                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│           wdpr-config-services  (Java backend — unchanged)            │
└──────────────────────────────────────────────────────────────────────┘

              ┌─────────────────────────────────────┐
              │         SNS + SQS (async)           │
              │                                     │
              │  refund.completed ──► validation    │
              │  validation.failed ──► refund      │
              └─────────────────────────────────────┘
```

### 2.3 Internal layering (per service)

```text
┌─────────────────────────────────────────────┐
│                 Service                       │
├─────────────────────────────────────────────┤
│  Routes          — Express route definitions │
│  Controllers     — Request/response mapping  │
│  Services        — Business logic            │
│  Clients         — HTTP clients to backends  │
│  Events          — SNS publish / SQS consume │
│  Middleware      — Auth, logging, errors     │
└─────────────────────────────────────────────┘
```

---

## 3. Service definitions

### 3.1 pc-gateway

| Attribute            | Detail                                                                 |
|----------------------|------------------------------------------------------------------------|
| **Responsibility**   | Backward-compatible v1 route adapter; fans out to downstream services  |
| **Bounded context**  | Request routing and response aggregation only — no business logic      |
| **Lifecycle**        | Temporary during migration; retired in phase 3                         |

**API surface** (preserves all existing v1 routes):

| Method | Path                          | Proxied to              |
|--------|-------------------------------|-------------------------|
| `*`    | `/api/v1/refunds/*`           | pc-refund-service       |
| `*`    | `/api/v1/exports/*`           | pc-refund-service       |
| `*`    | `/api/v1/validations/*`       | pc-validation-service   |
| `*`    | `/api/v1/configurations/*`    | pc-validation-service   |
| `*`    | `/api/v1/comparisons/*`       | pc-validation-service   |
| `GET`  | `/health`                     | Local (200 OK)          |

**Dependencies**:

- Upstream: Angular UI, external API consumers
- Downstream: pc-refund-service, pc-validation-service

**Resource profile**:

| Resource | Value | Rationale                                      |
|----------|:-----:|------------------------------------------------|
| CPU      | 256   | Proxy-only — minimal compute                   |
| Memory   | 512MB | No payload buffering — streams pass-through    |
| Min tasks| 2     | HA requirement                                 |
| Max tasks| 6     | Handle fan-out under peak load                 |

---

### 3.2 pc-refund-service

| Attribute            | Detail                                                                   |
|----------------------|--------------------------------------------------------------------------|
| **Responsibility**   | Refund lifecycle operations, export streaming, refund-related reporting   |
| **Bounded context**  | Refund domain — create, update, approve, reject, export                  |

**API surface**:

| Method   | Path                              | Description                        |
|----------|-----------------------------------|------------------------------------|
| `GET`    | `/api/v2/refunds`                 | List refunds with pagination       |
| `GET`    | `/api/v2/refunds/:id`             | Get refund by ID                   |
| `POST`   | `/api/v2/refunds`                 | Create refund                      |
| `PUT`    | `/api/v2/refunds/:id`             | Update refund                      |
| `POST`   | `/api/v2/refunds/:id/approve`     | Approve refund                     |
| `POST`   | `/api/v2/refunds/:id/reject`      | Reject refund                      |
| `POST`   | `/api/v2/exports`                 | Initiate export (streaming)        |
| `GET`    | `/api/v2/exports/:id/status`      | Export progress                    |
| `GET`    | `/api/v2/exports/:id/download`    | Download completed export (stream) |
| `GET`    | `/health`                         | Health check                       |

**Dependencies**:

- Upstream: pc-gateway (during migration), Angular UI (post-migration)
- Downstream: wdpr-config-services (HTTP), SNS (event publish)
- Consumes: `validation.completed` SQS queue

**Resource profile**:

| Resource | Value  | Rationale                                                |
|----------|:------:|----------------------------------------------------------|
| CPU      | 512    | Moderate compute for request handling                    |
| Memory   | 2048MB | Streaming exports hold buffered chunks — primary OOM source |
| Min tasks| 2      | HA requirement                                           |
| Max tasks| 10     | Scale on memory utilization during export bursts         |

---

### 3.3 pc-validation-service

| Attribute            | Detail                                                                 |
|----------------------|------------------------------------------------------------------------|
| **Responsibility**   | Rule validation, client comparison, configuration read queries          |
| **Bounded context**  | Validation domain — validate rules, compare configurations, browse      |

**API surface**:

| Method   | Path                                    | Description                     |
|----------|-----------------------------------------|---------------------------------|
| `POST`   | `/api/v2/validations`                   | Run validation against rules    |
| `GET`    | `/api/v2/validations/:id`               | Get validation result           |
| `POST`   | `/api/v2/comparisons`                   | Compare two client configs      |
| `GET`    | `/api/v2/comparisons/:id`               | Get comparison result           |
| `GET`    | `/api/v2/configurations`                | Browse configurations           |
| `GET`    | `/api/v2/configurations/:id`            | Get configuration detail        |
| `POST`   | `/api/v2/configurations/:id/promote`    | Promote config across envs      |
| `GET`    | `/health`                               | Health check                    |

**Dependencies**:

- Upstream: pc-gateway (during migration), Angular UI (post-migration)
- Downstream: wdpr-config-services (HTTP), SNS (event publish)
- Consumes: `refund.completed` SQS queue (for cross-validation triggers)

**Resource profile**:

| Resource | Value  | Rationale                                          |
|----------|:------:|----------------------------------------------------|
| CPU      | 1024   | CPU-intensive rule evaluation and comparison logic  |
| Memory   | 1024MB | No streaming — bounded request/response payloads   |
| Min tasks| 2      | HA requirement                                     |
| Max tasks| 8      | Scale on CPU utilization during validation bursts   |

---

## 4. Integration patterns

### 4.1 Synchronous (HTTP/REST)

**Request routing** (pc-gateway → downstream):

```text
Client Request
     │
     ▼
┌─────────────┐    path-based     ┌──────────────────────┐
│ pc-gateway  │───────────────────►│ pc-refund-service    │
│             │    routing         │ pc-validation-service│
└─────────────┘                   └──────────────────────┘
```

| Concern          | Configuration                                                    |
|------------------|------------------------------------------------------------------|
| Circuit breaker  | Opossum library; threshold 50% failures over 10s window          |
| Timeout          | 30s default; 120s for export initiation; 5s for health checks    |
| Retries          | 1 retry with exponential backoff (200ms base) for 5xx only       |
| Header forwarding| `Authorization`, `X-Correlation-Id`, `X-Request-Id` propagated  |

**Service-to-backend** (downstream → config-services):

| Concern          | Configuration                                  |
|------------------|------------------------------------------------|
| Timeout          | 15s default; 90s for batch/export queries      |
| Connection pool  | Keep-alive enabled; max 50 sockets per service |
| Retry            | 1 retry for 503/429 with jittered backoff      |

### 4.2 Asynchronous (SNS/SQS)

**Event catalog**:

| Event name              | Publisher              | Subscriber               | Purpose                                |
|-------------------------|------------------------|--------------------------|----------------------------------------|
| `refund.created`        | pc-refund-service      | pc-validation-service    | Trigger auto-validation on new refunds |
| `refund.completed`      | pc-refund-service      | pc-validation-service    | Update validation state                |
| `validation.completed`  | pc-validation-service  | pc-refund-service        | Unblock refund approval                |
| `validation.failed`     | pc-validation-service  | pc-refund-service        | Flag refund for manual review          |
| `export.completed`      | pc-refund-service      | (future consumers)       | Notify export availability             |

**Naming conventions**:

| Resource | Pattern                                              | Example                                          |
|----------|------------------------------------------------------|--------------------------------------------------|
| SNS topic| `pc-{service}-{event}-{env}`                         | `pc-refund-refund-created-stage`                 |
| SQS queue| `pc-{consumer}-{event}-queue-{env}`                  | `pc-validation-refund-created-queue-stage`       |
| DLQ      | `pc-{consumer}-{event}-dlq-{env}`                    | `pc-validation-refund-created-dlq-stage`         |

**DLQ strategy**:

- Max receive count: 3 (message retried 3 times before DLQ)
- DLQ retention: 14 days
- CloudWatch alarm on DLQ depth > 0
- Manual redrive via AWS console or CLI when root cause resolved

### 4.3 Data consistency

- **No shared database** — both services call config-services as the system of record.
- **Eventual consistency** — event-driven updates between refund and validation domains.
- **Idempotency** — all event handlers use idempotency keys (event ID + entity ID) to handle redelivery.
- **No saga orchestration needed** — operations are independent; cross-domain coordination is notification-based, not transactional.
- **Conflict resolution** — config-services owns optimistic concurrency (version fields); downstream services retry on 409.

---

## 5. Deployment topology

### 5.1 ECS and ALB layout

```text
                         ┌─────────────────────────┐
                         │     Route 53 DNS         │
                         │                          │
                         │  pc-gateway-{env}        │
                         │  pc-refund-{env}         │
                         │  pc-validation-{env}     │
                         └────────────┬────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │    Application LB        │
                         │  (path-based routing)    │
                         └──┬─────────┬──────────┬─┘
                            │         │          │
           ┌────────────────┘         │          └────────────────┐
           ▼                          ▼                           ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────┐
│  ECS Service:       │  │  ECS Service:       │  │  ECS Service:           │
│  pc-gateway         │  │  pc-refund-service  │  │  pc-validation-service  │
│                     │  │                     │  │                         │
│  Task: 256 CPU      │  │  Task: 512 CPU      │  │  Task: 1024 CPU         │
│        512MB RAM    │  │        2048MB RAM   │  │        1024MB RAM       │
│  Min: 2  Max: 6    │  │  Min: 2  Max: 10   │  │  Min: 2  Max: 8        │
│                     │  │                     │  │                         │
│  Scaling: request   │  │  Scaling: memory    │  │  Scaling: CPU           │
│  count              │  │  utilization (70%)  │  │  utilization (70%)      │
└─────────────────────┘  └─────────────────────┘  └─────────────────────────┘
```

**ALB routing rules**:

| Priority | Condition                        | Target group             |
|:--------:|----------------------------------|--------------------------|
|    1     | Path: `/api/v1/refunds/*`        | pc-gateway               |
|    1     | Path: `/api/v1/exports/*`        | pc-gateway               |
|    1     | Path: `/api/v1/validations/*`    | pc-gateway               |
|    2     | Path: `/api/v2/refunds/*`        | pc-refund-service        |
|    2     | Path: `/api/v2/exports/*`        | pc-refund-service        |
|    3     | Path: `/api/v2/validations/*`    | pc-validation-service    |
|    3     | Path: `/api/v2/configurations/*` | pc-validation-service    |
|    3     | Path: `/api/v2/comparisons/*`    | pc-validation-service    |
|   99     | Default                          | pc-gateway               |

**DNS records**:

| Service                | Pattern                                          |
|------------------------|--------------------------------------------------|
| pc-gateway             | `pc-gateway-{env}.wdprapps.disney.com`           |
| pc-refund-service      | `pc-refund-{env}.wdprapps.disney.com`            |
| pc-validation-service  | `pc-validation-{env}.wdprapps.disney.com`        |

### 5.2 Environment promotion

```text
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ latest  │────►│  stage  │────►│  load   │────►│  prod   │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
  Auto-deploy     Manual gate     Soak test       Manual gate
  on merge        + smoke tests   + perf tests    + approval
```

Each service has its own Harness pipeline:

| Pipeline                       | Trigger              | Environments              |
|--------------------------------|----------------------|---------------------------|
| `pc-gateway-deploy`            | Merge to main        | latest → stage → load → prod |
| `pc-refund-service-deploy`     | Merge to main        | latest → stage → load → prod |
| `pc-validation-service-deploy` | Merge to main        | latest → stage → load → prod |

---

## 6. Migration strategy (strangler fig)

### 6.1 Phase 1: Extract refund-service (weeks 1–8)

```text
Week 1–2:  Scaffold pc-refund-service repo, CI/CD, infra-as-code
Week 3–5:  Migrate refund routes + export streaming logic
Week 6–7:  Integration testing in latest/stage environments
Week 8:    Production cutover — gateway proxies refund routes to new service
```

**Cutover mechanism**:

1. Deploy `pc-refund-service` alongside monolith.
2. `pc-gateway` routes `/api/v1/refunds/*` and `/api/v1/exports/*` to `pc-refund-service`.
3. Shadow traffic validation for 48 hours comparing response parity.
4. Full cutover — gateway stops proxying to monolith for refund routes.

**Rollback**: Revert gateway routing config to point refund routes back to monolith. Monolith code remains unchanged and deployed throughout phase 1. Rollback time: < 5 minutes (config change + ECS deployment).

### 6.2 Phase 2: Extract validation-service (weeks 9–16)

```text
Week 9–10:  Scaffold pc-validation-service repo, CI/CD, infra-as-code
Week 11–13: Migrate validation, comparison, configuration routes
Week 14–15: Integration testing, event wiring (SNS/SQS)
Week 16:    Production cutover — gateway proxies validation routes to new service
```

**Cutover mechanism**: Same pattern as phase 1 with shadow traffic validation.

**Rollback**: Revert gateway routing for validation routes to monolith. Rollback time: < 5 minutes.

### 6.3 Phase 3: Retire monolith routes (weeks 17–22)

```text
Week 17–18: UI updates to call v2 endpoints directly (bypass gateway)
Week 19–20: Monitor v1 traffic — confirm zero usage of monolith
Week 21:    Decommission monolith ECS service
Week 22:    Remove gateway v1 shims (gateway becomes optional thin proxy or is retired)
```

**Rollback**: Re-deploy monolith from archived container image. DNS rollback to monolith ALB target group.

### 6.4 Phase summary

```text
        Wk1    Wk8    Wk9    Wk16   Wk17   Wk22
         │      │      │      │      │      │
Phase 1  ├──────┤      │      │      │      │
         │Extract│     │      │      │      │
         │Refund │      │      │      │      │
         │      │      │      │      │      │
Phase 2  │      │      ├──────┤      │      │
         │      │      │Extract│     │      │
         │      │      │Valid. │      │      │
         │      │      │      │      │      │
Phase 3  │      │      │      │      ├──────┤
         │      │      │      │      │Retire│
         │      │      │      │      │Mono. │
```

---

## 7. Cross-cutting concerns

### 7.1 Observability

| Layer        | Tool                  | Detail                                                   |
|--------------|-----------------------|----------------------------------------------------------|
| Logging      | Structured JSON       | Correlation ID in every log line; shipped to Splunk      |
| Metrics      | CloudWatch + Datadog  | Request latency (p50/p95/p99), error rate, queue depth   |
| Tracing      | AWS X-Ray             | Distributed traces across gateway → service → backend    |
| Alerting     | PagerDuty via CW alarms | OOM, 5xx spike > 5%, DLQ depth > 0, latency p99 > 5s |

**Correlation ID propagation**:

```text
Client → X-Correlation-Id → Gateway → X-Correlation-Id → Service → X-Correlation-Id → Backend
                                    → SNS MessageAttributes → SQS → Consumer
```

### 7.2 Authentication and authorization

- **Auth token**: JWT bearer token issued by Disney SSO; propagated in `Authorization` header.
- **Gateway**: Validates JWT signature and expiration. Passes token downstream.
- **Services**: Validate JWT independently (defense in depth). Extract user context for audit logging.
- **Service-to-service**: Internal ALB with security groups restricting ingress to gateway and peer services. No additional auth token for internal calls (network-level trust within VPC).

### 7.3 Rate limiting

| Service              | Limit                    | Scope             |
|----------------------|:------------------------:|-------------------|
| pc-gateway           | 1000 req/s per client    | Per API key       |
| pc-refund-service    | 100 req/s               | Per user          |
| pc-validation-service| 200 req/s               | Per user          |
| Export endpoints     | 5 concurrent per user    | Per user          |

Implemented via `express-rate-limit` with Redis backing for distributed state.

### 7.4 Error handling

- **Standard error envelope**:

```json
{
  "error": {
    "code": "REFUND_NOT_FOUND",
    "message": "Refund with ID xyz not found",
    "correlationId": "abc-123",
    "timestamp": "2026-06-25T22:00:00Z"
  }
}
```

- Gateway translates downstream errors to v1-compatible format during migration.
- Circuit breaker open state returns `503 Service Unavailable` with `Retry-After` header.
- All 5xx errors are logged with full request context (excluding PII).

---

## 8. Risks and mitigations

| #  | Risk                                                    | Likelihood | Impact | Mitigation                                                                 |
|:--:|---------------------------------------------------------|:----------:|:------:|----------------------------------------------------------------------------|
| 1  | Export streaming still OOMs in isolated service         | Medium     | High   | Implement backpressure; chunk size limits; memory-based autoscaling        |
| 2  | Shadow traffic reveals response parity differences      | High       | Medium | Invest in comprehensive diff tooling; fix before cutover                   |
| 3  | SNS/SQS message loss causes stale state                | Low        | High   | DLQ + alarms + idempotent replay; 14-day retention                         |
| 4  | Gateway adds latency to all requests                   | Medium     | Low    | Measure p99 overhead target < 10ms; stream pass-through, no buffering      |
| 5  | Team velocity slowed by maintaining 3 repos + monolith | Medium     | Medium | Shared tooling (generators, lint configs); parallelize phase 1 and 2 prep  |
| 6  | Config-services becomes bottleneck under split load     | Low        | High   | Monitor backend latency; discuss connection pooling with backend team       |
| 7  | UI migration to v2 endpoints introduces regressions    | Medium     | Medium | Feature flags per route migration; A/B traffic splitting at ALB level      |
| 8  | Rollback needed after partial migration                | Low        | Medium | Monolith unchanged through phase 2; routing-only rollback in < 5 minutes   |

---

## Appendix A: Repository structure (per service)

```text
pc-refund-service/
├── src/
│   ├── routes/            # Express route definitions
│   ├── controllers/       # Request/response mapping
│   ├── services/          # Business logic
│   ├── clients/           # HTTP clients (config-services)
│   ├── events/            # SNS publishers, SQS consumers
│   ├── middleware/        # Auth, error handling, logging
│   └── index.ts           # App entry point
├── test/
│   ├── unit/
│   ├── integration/
│   └── contract/          # Pact or similar for API contracts
├── infra/                 # CloudFormation / CDK for service infra
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## Appendix B: Decision log

| Date       | Decision                                           | Rationale                                      |
|------------|----------------------------------------------------|-------------------------------------------------|
| 2026-06-16 | Split into 3 services (gateway + 2 domain services)| Isolate failure domains; independent scaling    |
| 2026-06-16 | Strangler fig over big-bang                        | Zero downtime; incremental risk                 |
| 2026-06-16 | SNS+SQS over direct HTTP for cross-domain events  | Decoupling; retry semantics; DLQ safety net     |
| 2026-06-16 | No direct DB ownership for new services            | Config-services is system of record; avoid dual writes |
| 2026-06-25 | Gateway is temporary — retire after UI migrates to v2 | Minimize long-term infrastructure debt       |
