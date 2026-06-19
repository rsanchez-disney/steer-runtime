# Target architecture: payment controls service decomposition

## Executive summary

This document defines the target architecture for splitting `wdpr-payment-controls-api` into three independent services: a slim backward-compatibility gateway, a refund configuration service, and a validation rule service. The migration follows a strangler fig pattern over ~22 weeks, using SNS+SQS for async coordination and path-based ALB routing to shift traffic incrementally.

---

## 1. Component diagram

```mermaid
C4Context
    title Payment controls — target state component diagram

    Person(user, "Config Studio User", "Disney payment ops")

    System_Boundary(frontend, "Frontend") {
        Container(angular, "wdpr-payment-controls-client", "Angular", "Config Studio UI")
    }

    System_Boundary(platform, "Payment Controls Platform") {
        Container(gateway, "payment-controls-gateway", "Node.js/Restify", "Slim adapter — v1 route compatibility, auth middleware, traffic routing")
        Container(refund_svc, "refund-service", "Node.js", "Refund configuration domain — CRUD, export, streaming")
        Container(validation_svc, "validation-service", "Node.js", "Validation rule domain — CRUD, rule evaluation")
    }

    System_Boundary(backend, "Backend Services") {
        Container(config_svc, "wdpr-config-services", "Java/Spring", "Persistence layer — DynamoDB, MariaDB, S3")
    }

    System_Boundary(infra, "Infrastructure") {
        Container(alb, "ALB", "AWS ALB", "Path-based routing, TLS termination")
        Container(auth, "Auth Provider", "OAuth2/OIDC", "Token validation, scopes")
        Container(sns, "SNS Topics", "AWS SNS", "Event fan-out")
        Container(sqs, "SQS Queues", "AWS SQS", "Per-service event consumption")
    }

    Rel(user, angular, "Uses", "HTTPS")
    Rel(angular, alb, "API calls", "HTTPS")
    Rel(alb, gateway, "/v1/* routes", "HTTP")
    Rel(alb, refund_svc, "/v2/refunds/*", "HTTP")
    Rel(alb, validation_svc, "/v2/validations/*", "HTTP")
    Rel(gateway, refund_svc, "Proxies refund routes", "HTTP")
    Rel(gateway, validation_svc, "Proxies validation routes", "HTTP")
    Rel(refund_svc, config_svc, "CRUD operations", "HTTP/REST")
    Rel(validation_svc, config_svc, "CRUD operations", "HTTP/REST")
    Rel(refund_svc, sns, "Publishes events", "AWS SDK")
    Rel(validation_svc, sns, "Publishes events", "AWS SDK")
    Rel(sns, sqs, "Fan-out", "Subscription")
    Rel(sqs, refund_svc, "Consumes events", "Polling")
    Rel(sqs, validation_svc, "Consumes events", "Polling")
    Rel(gateway, auth, "Token validation", "HTTPS")
    Rel(refund_svc, auth, "Token validation", "HTTPS")
    Rel(validation_svc, auth, "Token validation", "HTTPS")
```

---

## 2. Integration patterns

### 2.1 Synchronous patterns

#### HTTP routing strategy

| Layer   | Mechanism              | Behavior                                                                 |
|---------|------------------------|--------------------------------------------------------------------------|
| ALB     | Path-based rules       | Routes `/v2/refunds/*` → refund TG, `/v2/validations/*` → validation TG |
| ALB     | Default rule           | Routes `/v1/*` and unmatched → gateway TG                               |
| Gateway | Internal reverse proxy | Forwards to downstream services by path prefix                          |

#### API gateway behavior (slim gateway)

The gateway acts as a thin adapter during migration:

1. Accepts legacy `/v1` requests from the Angular client
2. Validates auth token (JWT verification, scope check)
3. Maps `/v1` request shape to the appropriate downstream `/v2` endpoint
4. Forwards request with original auth token in `Authorization` header
5. Maps `/v2` response back to `/v1` response shape if needed
6. Returns to client — no business logic

#### Request flow (during migration)

```
Angular → ALB → Gateway (/v1/refunds/config) → Refund Service (/v2/refunds/config) → config-services
```

#### Request flow (post-migration)

```
Angular → ALB → Refund Service (/v2/refunds/config) → config-services
```

### 2.2 Asynchronous patterns (SNS+SQS event topology)

#### Topics

| SNS Topic                               | Publisher          | Purpose                                        |
|-----------------------------------------|--------------------|------------------------------------------------|
| `payment-controls-refund-events`        | Refund service     | Refund config created/updated/deleted          |
| `payment-controls-validation-events`    | Validation service | Validation rule created/updated/activated      |

#### Queues

| SQS Queue                                        | Subscriber         | Subscribed Topic                            |
|--------------------------------------------------|--------------------|--------------------------------------------|
| `validation-svc-refund-events`                   | Validation service | `payment-controls-refund-events`           |
| `refund-svc-validation-events`                   | Refund service     | `payment-controls-validation-events`       |

#### Event schema

```json
{
  "eventId": "uuid",
  "eventType": "refund.config.updated",
  "version": "1.0",
  "timestamp": "ISO-8601",
  "source": "refund-service",
  "payload": { "configId": "...", "delta": {} },
  "correlationId": "uuid"
}
```

#### Guarantees

- At-least-once delivery (SQS standard queues)
- Idempotent consumers (dedup on `eventId`)
- DLQ after 3 failed processing attempts
- Message retention: 14 days on DLQ

### 2.3 Strangler fig routing strategy

Traffic shifts are controlled at the ALB rule level using weighted target groups and path-based rules:

| Phase | `/v1/validations/*`         | `/v1/refunds/*`            | `/v2/validations/*`   | `/v2/refunds/*`       |
|-------|-----------------------------|-----------------------------|------------------------|-----------------------|
| 0     | Gateway (100%)              | Gateway (100%)              | —                      | —                     |
| 1     | Gateway → Validation (proxy)| Gateway (100%)              | Validation svc (100%) | —                     |
| 2     | Gateway → Refund (proxy)    | Gateway → Refund (proxy)    | Validation svc (100%) | Refund svc (100%)     |
| 3     | ALB → Validation svc direct | ALB → Refund svc direct     | Validation svc (100%) | Refund svc (100%)     |
| 4     | Deprecated (410 Gone)       | Deprecated (410 Gone)       | Validation svc (100%) | Refund svc (100%)     |

Canary rollout per route group: 10% → 50% → 100% with automated rollback on 5xx spike.

### 2.4 Auth propagation pattern

```
┌─────────┐     ┌─────┐     ┌─────────┐     ┌─────────────┐
│  Client  │────▶│ ALB │────▶│ Gateway │────▶│ Domain Svc  │
└─────────┘     └─────┘     └─────────┘     └─────────────┘
     │                            │                  │
     │  Authorization: Bearer T   │  Authorization:  │  Authorization:
     │                            │  Bearer T        │  Bearer T
     │                            │  X-Request-Id: R │  X-Request-Id: R
     │                            │                  │  X-Forwarded-For
```

- Token passthrough: Original JWT forwarded unchanged to downstream services
- Each service independently validates the token (shared JWKS endpoint)
- Gateway adds `X-Request-Id` for distributed tracing if absent
- Post-migration: ALB routes directly to domain services; each service validates its own token
- Scopes: `refund:read`, `refund:write`, `validation:read`, `validation:write`

### 2.5 Error handling and circuit breaker strategy

| Concern            | Pattern                     | Implementation                                    |
|--------------------|-----------------------------|---------------------------------------------------|
| Downstream failure | Circuit breaker             | `opossum` (Node.js) — 50% failure threshold, 30s reset |
| Timeout            | Aggressive timeouts         | 5s for API calls, 60s for streaming exports       |
| Retry              | Exponential backoff         | 3 retries, jitter, idempotent operations only     |
| Fallback           | Graceful degradation        | Cache last-known-good config for read paths       |
| Bulkhead           | Connection pool isolation   | Separate HTTP agents per downstream               |
| Observability      | Structured error responses  | RFC 7807 problem details, correlation IDs         |

Circuit breaker states propagated via health check endpoints (`/health/ready`) so ALB can shift traffic on degradation.

---

## 3. Deployment topology

```mermaid
flowchart TB
    subgraph DNS["DNS (Route 53)"]
        dns_gw["payment-controls-{env}.wdprapps.disney.com"]
        dns_refund["refund-{env}.wdprapps.disney.com"]
        dns_validation["validation-{env}.wdprapps.disney.com"]
    end

    subgraph ALB_Layer["ALB (HTTPS :443)"]
        alb["Application Load Balancer"]
        rule_v1["/v1/* → Gateway TG"]
        rule_refund["/v2/refunds/* → Refund TG"]
        rule_validation["/v2/validations/* → Validation TG"]
    end

    subgraph ECS["ECS Fargate Cluster"]
        subgraph GW_SVC["payment-controls-gateway"]
            gw_task["Fargate Task<br/>512 MB / 0.25 vCPU<br/>Min: 2, Max: 4"]
        end
        subgraph REF_SVC["refund-service"]
            ref_task["Fargate Task<br/>1024 MB / 0.5 vCPU<br/>Min: 2, Max: 6"]
        end
        subgraph VAL_SVC["validation-service"]
            val_task["Fargate Task<br/>512 MB / 0.25 vCPU<br/>Min: 2, Max: 6"]
        end
    end

    subgraph Messaging["SNS + SQS"]
        topic_refund["SNS: payment-controls-refund-events"]
        topic_validation["SNS: payment-controls-validation-events"]
        queue_val_refund["SQS: validation-svc-refund-events"]
        queue_ref_validation["SQS: refund-svc-validation-events"]
        dlq_val["SQS DLQ: validation-svc-refund-events-dlq"]
        dlq_ref["SQS DLQ: refund-svc-validation-events-dlq"]
    end

    subgraph Backend["Backend"]
        config_svc["wdpr-config-services<br/>(Java / DynamoDB / MariaDB / S3)"]
    end

    dns_gw --> alb
    dns_refund --> alb
    dns_validation --> alb
    alb --> rule_v1 --> gw_task
    alb --> rule_refund --> ref_task
    alb --> rule_validation --> val_task

    gw_task -->|proxy| ref_task
    gw_task -->|proxy| val_task
    ref_task -->|REST| config_svc
    val_task -->|REST| config_svc

    ref_task -->|publish| topic_refund
    val_task -->|publish| topic_validation
    topic_refund -->|subscribe| queue_val_refund --> val_task
    topic_validation -->|subscribe| queue_ref_validation --> ref_task
    queue_val_refund -.->|DLQ| dlq_val
    queue_ref_validation -.->|DLQ| dlq_ref
```

### Resource allocation rationale

| Service              | Memory  | CPU      | Justification                                               |
|----------------------|---------|----------|-------------------------------------------------------------|
| Gateway              | 512 MB  | 0.25 vCPU | Thin proxy, no business logic, no streaming                |
| Refund service       | 1024 MB | 0.5 vCPU  | Streaming export paths require higher memory ceiling       |
| Validation service   | 512 MB  | 0.25 vCPU | Request/response only, no streaming                        |

---

## 4. Migration phases

### Phase 1: Extract and deploy validation service (weeks 1–8)

| Week  | Activity                                                         | Rollback mechanism              |
|-------|------------------------------------------------------------------|---------------------------------|
| 1–2   | Scaffold validation-service repo, CI/CD, infra-as-code          | N/A                             |
| 3–4   | Implement `/v2/validations/*` endpoints, unit + integration tests| N/A (not yet receiving traffic) |
| 5     | Deploy to staging; gateway proxies `/v1/validations/*` to it    | Revert gateway proxy config     |
| 6     | Canary in production: 10% of validation traffic via gateway     | Feature flag off → 0%          |
| 7     | Ramp to 100% through gateway proxy                              | Feature flag off → 0%          |
| 8     | ALB rule routes `/v2/validations/*` directly; UI migrates calls | Remove ALB rule → fall to gateway |

### Phase 2: Extract and deploy refund service (weeks 9–16)

| Week  | Activity                                                         | Rollback mechanism              |
|-------|------------------------------------------------------------------|---------------------------------|
| 9–10  | Scaffold refund-service repo, CI/CD, infra-as-code              | N/A                             |
| 11–12 | Implement `/v2/refunds/*` endpoints including streaming export  | N/A (not yet receiving traffic) |
| 13    | Deploy to staging; gateway proxies `/v1/refunds/*` to it        | Revert gateway proxy config     |
| 14    | Canary in production: 10% of refund traffic via gateway         | Feature flag off → 0%          |
| 15    | Ramp to 100% through gateway proxy                              | Feature flag off → 0%          |
| 16    | ALB rule routes `/v2/refunds/*` directly; UI migrates calls     | Remove ALB rule → fall to gateway |

### Phase 3: Direct routing and gateway decommission (weeks 17–22)

| Week  | Activity                                                         | Rollback mechanism              |
|-------|------------------------------------------------------------------|---------------------------------|
| 17–18 | Angular client updated to call `/v2` endpoints directly         | Feature flag toggles base URL   |
| 19    | Gateway `/v1` routes return deprecation headers                 | Remove headers                  |
| 20    | Monitor: confirm zero traffic on gateway for 7 days             | Extend monitoring window        |
| 21    | Gateway returns 410 Gone for all `/v1` routes                   | Redeploy with proxy logic       |
| 22    | Decommission gateway service, remove ALB default rule           | Redeploy from last-known image  |

---

## 5. Key constraints and risks

### Constraints

| #  | Constraint                                        | Impact                                                    |
|----|---------------------------------------------------|-----------------------------------------------------------|
| C1 | No direct DB ownership                            | Both services depend on config-services availability      |
| C2 | Angular client is the sole consumer               | v1 deprecation only requires one client migration         |
| C3 | Streaming exports must not OOM                    | Refund service needs 1024 MB minimum; backpressure required|
| C4 | Auth tokens are short-lived JWTs                  | No token exchange needed — passthrough is sufficient      |
| C5 | No breaking changes to existing v1 contract       | Gateway must map responses faithfully during coexistence  |

### Risks and mitigations

| #  | Risk                                              | Likelihood | Impact | Mitigation                                                |
|----|---------------------------------------------------|------------|--------|-----------------------------------------------------------|
| R1 | config-services becomes single point of failure   | Medium     | High   | Circuit breakers, cached reads, health-check gating       |
| R2 | Event ordering issues between services            | Low        | Medium | Idempotent consumers, event versioning, timestamp-based dedup |
| R3 | Gateway proxy adds latency during migration       | High       | Low    | Keep gateway co-located (same AZ), connection pooling     |
| R4 | Streaming export OOM in refund service            | Medium     | High   | Backpressure (Node.js streams), memory alarms, auto-scaling |
| R5 | Angular client migration incomplete at decomm     | Low        | High   | Feature flags, extended deprecation window, traffic monitoring |
| R6 | Scope creep extends 22-week timeline              | Medium     | Medium | Strict phase gates, weekly architecture review            |
| R7 | SNS/SQS message loss during publish failures      | Low        | Medium | Transactional outbox pattern if volume justifies complexity |

---

## Appendix: DNS and endpoint mapping

| Environment | Gateway                                        | Refund service                           | Validation service                          |
|-------------|------------------------------------------------|------------------------------------------|---------------------------------------------|
| dev         | payment-controls-dev.wdprapps.disney.com       | refund-dev.wdprapps.disney.com           | validation-dev.wdprapps.disney.com          |
| stage       | payment-controls-stage.wdprapps.disney.com     | refund-stage.wdprapps.disney.com         | validation-stage.wdprapps.disney.com        |
| prod        | payment-controls-prod.wdprapps.disney.com      | refund-prod.wdprapps.disney.com          | validation-prod.wdprapps.disney.com         |
