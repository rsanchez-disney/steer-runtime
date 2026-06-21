# Config Studio — Target Architecture Design

## Service Decomposition of `wdpr-payment-controls-api`

| Metadata       | Value                                      |
| -------------- | ------------------------------------------ |
| Status         | Draft                                      |
| Author         | Architecture Team                          |
| Date           | 2026-06-21                                 |
| Product        | Config Studio                              |
| Motivation     | OOMKilled events in monolith ECS tasks     |
| Target State   | 3 independent services on ECS Fargate      |
| Migration      | Strangler fig — 4 phases / ~22 weeks       |

---

## 1. System Context (C4 Level 1)

```mermaid
C4Context
    title Config Studio — System Context

    Person(user, "Config Studio User", "Payment operations analyst")

    System(configStudio, "Config Studio", "Payment controls configuration platform")

    System_Ext(authProvider, "Disney SSO", "OAuth2 / OIDC identity provider")
    System_Ext(paymentSystems, "Payment Gateways", "Downstream payment processors")
    System_Ext(notifService, "Notification Service", "Email / Slack alerts")

    Rel(user, configStudio, "Manages payment rules, exports refunds", "HTTPS")
    Rel(configStudio, authProvider, "Authenticates users", "OAuth2")
    Rel(configStudio, paymentSystems, "Validates payment configs against", "HTTPS")
    Rel(configStudio, notifService, "Sends export/promotion notifications", "SNS")
```

---

## 2. Container / Component Diagram (C4 Level 2)

```mermaid
C4Container
    title Config Studio — Container Diagram (Target State)

    Person(user, "Config Studio User")

    Container_Boundary(frontend, "Frontend") {
        Container(angularApp, "wdpr-payment-controls-client", "Angular", "SPA served via CloudFront")
    }

    Container_Boundary(bff, "API Layer — ECS Fargate") {
        Container(gateway, "API Gateway", "Node.js / TypeScript", "Thin routing, auth, circuit breakers. Retains existing DNS.")
        Container(validationSvc, "Validation Service", "Node.js / TypeScript", "Low-latency rule validation. 1GB RAM, 3-12 tasks.")
        Container(refundSvc, "Refund Service", "Node.js / TypeScript", "Memory-heavy export/refund ops. 2GB RAM, 2-8 tasks.")
    }

    Container_Boundary(async, "Async Messaging") {
        ContainerQueue(snsTopic, "config-events SNS Topic", "SNS", "Domain events fan-out")
        ContainerQueue(sqsValidation, "validation-queue", "SQS", "Validation event consumption")
        ContainerQueue(sqsRefund, "refund-queue", "SQS", "Refund event consumption")
    }

    Container_Boundary(backend, "Backend Services") {
        Container(configServices, "wdpr-config-services", "Java / Spring Boot", "DynamoDB, MariaDB, S3")
    }

    Rel(user, angularApp, "Uses", "HTTPS")
    Rel(angularApp, gateway, "API calls", "HTTPS /v1/*")
    Rel(gateway, validationSvc, "Routes validation requests", "HTTP internal")
    Rel(gateway, refundSvc, "Routes refund requests", "HTTP internal")
    Rel(validationSvc, configServices, "Reads/writes configs", "HTTP")
    Rel(refundSvc, configServices, "Reads configs, writes exports", "HTTP")
    Rel(validationSvc, snsTopic, "Publishes events", "AWS SDK")
    Rel(refundSvc, snsTopic, "Publishes events", "AWS SDK")
    Rel(snsTopic, sqsValidation, "Fans out")
    Rel(snsTopic, sqsRefund, "Fans out")
    Rel(sqsValidation, validationSvc, "Consumes")
    Rel(sqsRefund, refundSvc, "Consumes")
```

### Component Boundaries

```mermaid
graph TB
    subgraph "API Gateway (wdpr-payment-controls-gateway)"
        direction TB
        A1[Route Registry]
        A2[Auth Middleware — OAuth2 token validation]
        A3[Circuit Breaker — opossum]
        A4[Request Router / Proxy]
        A5[Correlation ID Injection]
        A6[Rate Limiter]
    end

    subgraph "Validation Service (wdpr-validation-service)"
        direction TB
        V1[Validation Controller]
        V2[Rule Engine]
        V3[Config Client — calls config-services]
        V4[Event Publisher — SNS]
        V5[Health / Readiness probes]
    end

    subgraph "Refund Service (wdpr-refund-service)"
        direction TB
        R1[Refund Controller]
        R2[Export Engine — CSV/XLSX generation]
        R3[Config Client — calls config-services]
        R4[Event Publisher — SNS]
        R5[SQS Consumer — async export jobs]
        R6[Health / Readiness probes]
    end

    A4 -->|/v1/validations/*| V1
    A4 -->|/v1/refunds/*| R1
    V3 --> CS[config-services]
    R3 --> CS
```

---

## 3. Integration Patterns

### 3.1 Synchronous (HTTP)

All synchronous communication flows through the API Gateway which acts as the single ingress point for the Angular client.

| Route Pattern            | Target Service      | Method | Purpose                        |
| ------------------------ | ------------------- | ------ | ------------------------------ |
| `/v1/validations/*`      | validation-service  | *      | Rule CRUD, validation triggers |
| `/v1/refunds/*`          | refund-service      | *      | Refund config, export triggers |
| `/v1/health`             | gateway (local)     | GET    | Gateway health                 |
| `/v1/configurations/*`   | validation-service  | *      | Config promotion flows         |

#### Sequence — Validation Request (Sync)

```mermaid
sequenceDiagram
    participant UI as Angular Client
    participant GW as API Gateway
    participant VS as Validation Service
    participant CS as config-services (Java)

    UI->>GW: POST /v1/validations/rules/{ruleId}/validate
    Note over GW: Inject x-correlation-id, validate JWT
    GW->>VS: POST /validations/rules/{ruleId}/validate
    Note over GW: Circuit breaker wraps call
    VS->>CS: GET /api/rules/{ruleId}
    CS-->>VS: 200 Rule payload
    VS->>VS: Execute rule engine
    VS-->>GW: 200 { valid: true, details: [...] }
    GW-->>UI: 200 (passthrough)
    VS-)SNS: Publish "validation.completed" event
```

### 3.2 Asynchronous (SNS/SQS)

Events flow through a single SNS topic (`config-studio-events`) with SQS subscriptions filtered by message attributes.

| Event Name                  | Publisher          | Consumers          | Trigger                        |
| --------------------------- | ------------------ | ------------------ | ------------------------------ |
| `validation.completed`      | validation-service | refund-service     | Rule validated successfully    |
| `config.promoted`           | validation-service | refund-service     | Config promoted to environment |
| `refund.export.requested`   | gateway            | refund-service     | User triggers bulk export      |
| `refund.export.completed`   | refund-service     | (notification svc) | Export file ready              |

#### Sequence — Refund Export (Async)

```mermaid
sequenceDiagram
    participant UI as Angular Client
    participant GW as API Gateway
    participant SNS as SNS Topic
    participant SQS as refund-queue (SQS)
    participant RS as Refund Service
    participant CS as config-services (Java)
    participant S3 as S3 Bucket

    UI->>GW: POST /v1/refunds/exports
    GW->>SNS: Publish "refund.export.requested" { filters, correlationId }
    GW-->>UI: 202 Accepted { jobId }
    SNS->>SQS: Fan-out (filter: refund.*)
    SQS->>RS: Receive message
    RS->>CS: GET /api/refunds?filters=...
    CS-->>RS: Paginated refund data
    RS->>RS: Generate XLSX in-memory (2GB headroom)
    RS->>S3: PUT export file
    RS->>SNS: Publish "refund.export.completed" { jobId, s3Key }
    Note over UI: UI polls GET /v1/refunds/exports/{jobId}/status
    UI->>GW: GET /v1/refunds/exports/{jobId}/status
    GW->>RS: GET /exports/{jobId}/status
    RS-->>GW: 200 { status: "complete", downloadUrl }
    GW-->>UI: 200
```

#### Sequence — Configuration Promotion

```mermaid
sequenceDiagram
    participant UI as Angular Client
    participant GW as API Gateway
    participant VS as Validation Service
    participant CS as config-services
    participant SNS as SNS Topic
    participant RS as Refund Service

    UI->>GW: POST /v1/configurations/{configId}/promote
    GW->>VS: POST /configurations/{configId}/promote
    VS->>CS: POST /api/configurations/{configId}/promote
    CS-->>VS: 200 Promoted
    VS->>SNS: Publish "config.promoted" { configId, env }
    VS-->>GW: 200
    GW-->>UI: 200
    SNS->>RS: (via SQS) config.promoted
    RS->>RS: Invalidate cached refund rules for configId
```

---

## 4. Data Flow Summary

```mermaid
flowchart LR
    subgraph Client
        A[Angular SPA]
    end

    subgraph Gateway
        B[API Gateway]
    end

    subgraph Services
        C[Validation Service]
        D[Refund Service]
    end

    subgraph Messaging
        E[SNS Topic]
        F[SQS — validation-queue]
        G[SQS — refund-queue]
    end

    subgraph Backend
        H[config-services]
        I[(DynamoDB)]
        J[(MariaDB)]
        K[(S3)]
    end

    A -->|HTTPS| B
    B -->|HTTP| C
    B -->|HTTP| D
    C -->|HTTP| H
    D -->|HTTP| H
    H --- I
    H --- J
    H --- K
    C -->|publish| E
    D -->|publish| E
    E --> F
    E --> G
    F --> C
    G --> D
```

**Key design decisions:**

- Neither validation-service nor refund-service owns a database directly. All persistence flows through `config-services`.
- S3 is used for large export artifacts; the refund-service writes directly via AWS SDK (pre-signed URLs returned to client).
- No service-to-service synchronous calls between validation and refund. All cross-domain coordination is event-driven via SNS/SQS.

---

## 5. Deployment Topology — ECS Fargate

```mermaid
graph TB
    subgraph "AWS us-east-1"
        subgraph "VPC — Config Studio"
            subgraph "Public Subnets"
                ALB[Application Load Balancer<br/>*.wdprapps.disney.com]
            end

            subgraph "Private Subnets"
                subgraph "ECS Cluster: config-studio"
                    GW["gateway-service<br/>256 CPU / 512 MB<br/>Tasks: 2-6<br/>Scale: request count"]
                    VS["validation-service<br/>512 CPU / 1024 MB<br/>Tasks: 3-12<br/>Scale: request count"]
                    RS["refund-service<br/>1024 CPU / 2048 MB<br/>Tasks: 2-8<br/>Scale: memory utilization"]
                end
            end

            subgraph "AWS Managed"
                SNS2[SNS Topic]
                SQS2[SQS Queues]
                CW[CloudWatch]
                XR[X-Ray]
            end
        end
    end

    ALB --> GW
    GW --> VS
    GW --> RS
    VS --> SNS2
    RS --> SQS2
    VS --> CW
    RS --> CW
    GW --> XR
```

### ECS Service Configuration

| Service              | CPU (units) | Memory (MB) | Min Tasks | Max Tasks | Scaling Metric              | Target Value |
| -------------------- | ----------- | ----------- | --------- | --------- | --------------------------- | ------------ |
| gateway-service      | 256         | 512         | 2         | 6         | ALBRequestCountPerTarget    | 1000/min     |
| validation-service   | 512         | 1024        | 3         | 12        | ALBRequestCountPerTarget    | 500/min      |
| refund-service       | 1024        | 2048        | 2         | 8         | MemoryUtilization           | 70%          |

### DNS Strategy

| Environment | Gateway DNS (existing)                        | Validation DNS (new)                          | Refund DNS (new)                          |
| ----------- | --------------------------------------------- | --------------------------------------------- | ----------------------------------------- |
| dev         | payment-controls-dev.wdprapps.disney.com      | validation-dev.wdprapps.disney.com            | refund-dev.wdprapps.disney.com            |
| stage       | payment-controls-stage.wdprapps.disney.com    | validation-stage.wdprapps.disney.com          | refund-stage.wdprapps.disney.com          |
| prod        | payment-controls-prod.wdprapps.disney.com     | validation-prod.wdprapps.disney.com           | refund-prod.wdprapps.disney.com           |

> The Angular client continues to call the gateway DNS only. Internal service DNS is used exclusively for gateway → service routing via ALB path-based rules or service discovery (Cloud Map).

---

## 6. Resilience Patterns

### 6.1 Circuit Breakers (opossum)

Applied at the gateway for each downstream service:

```typescript
// gateway/src/circuit-breakers.ts
import CircuitBreaker from 'opossum';

const DEFAULTS = {
  timeout: 5000,        // 5s per request
  errorThresholdPercentage: 50,
  resetTimeout: 30000,  // 30s half-open
  volumeThreshold: 10,  // min requests before tripping
};

export const validationBreaker = new CircuitBreaker(callValidationService, {
  ...DEFAULTS,
  name: 'validation-service',
});

export const refundBreaker = new CircuitBreaker(callRefundService, {
  ...DEFAULTS,
  timeout: 10000, // refund calls may be heavier
  name: 'refund-service',
});
```

### 6.2 Retry Policy

| Layer            | Strategy                  | Max Retries | Backoff        |
| ---------------- | ------------------------- | ----------- | -------------- |
| Gateway → Service| opossum (no retry)        | 0           | N/A            |
| Service → config-services | Exponential backoff | 3           | 200ms × 2^n   |
| SQS Consumer     | SQS native retry          | 5           | Visibility timeout doubling |
| SQS DLQ          | After 5 failures          | —           | Manual review  |

### 6.3 Timeout Budget

```mermaid
gantt
    title Request Timeout Budget (validation flow)
    dateFormat X
    axisFormat %L ms

    section Gateway
    Auth + routing       : 0, 100
    Circuit breaker wait : 100, 200

    section Validation Service
    Business logic       : 200, 1500
    config-services call : 1500, 4000

    section Total
    Gateway timeout cap  : 0, 5000
```

### 6.4 Bulkhead Isolation

- Separate ECS services = process-level bulkhead. OOM in refund-service cannot impact validation-service.
- Within gateway: separate circuit breaker instances per downstream prevent cascade.
- SQS queues per consumer prevent noisy-neighbor message processing.

### 6.5 Dead Letter Queues

Each SQS queue has a DLQ configured with `maxReceiveCount: 5`. DLQ messages trigger a CloudWatch alarm for operational review.

---

## 7. Observability Architecture

### 7.1 Distributed Tracing (AWS X-Ray)

```mermaid
flowchart LR
    subgraph "Trace Propagation"
        A[Angular Client] -->|x-correlation-id header| B[Gateway]
        B -->|X-Amzn-Trace-Id + x-correlation-id| C[Validation Service]
        B -->|X-Amzn-Trace-Id + x-correlation-id| D[Refund Service]
        C -->|X-Amzn-Trace-Id| E[config-services]
        D -->|X-Amzn-Trace-Id| E
    end
```

- Gateway generates `x-correlation-id` (UUIDv4) if not present on inbound request.
- All services propagate both `x-correlation-id` and X-Ray trace headers.
- SNS/SQS messages include `correlationId` in message attributes for async trace stitching.

### 7.2 Structured Logging

All services emit JSON logs to CloudWatch Logs with a consistent schema:

```json
{
  "timestamp": "2026-06-21T13:00:00.000Z",
  "level": "info",
  "service": "validation-service",
  "correlationId": "abc-123",
  "traceId": "1-abc-def",
  "message": "Validation completed",
  "duration_ms": 142,
  "ruleId": "rule-456"
}
```

Log groups per service: `/ecs/config-studio/{service-name}/{env}`

### 7.3 Metrics

| Metric                          | Source             | Alarm Threshold         |
| ------------------------------- | ------------------ | ----------------------- |
| Request latency p99             | ALB / X-Ray        | > 3s for 5 min         |
| Circuit breaker open events     | opossum → CW       | > 0 in 1 min           |
| SQS ApproximateAgeOfOldestMsg   | SQS                | > 300s                 |
| DLQ message count               | SQS                | > 0                    |
| ECS MemoryUtilization           | ECS                | > 85% for 5 min        |
| 5xx error rate                  | ALB                | > 1% for 5 min         |
| Export job duration              | Custom CW metric   | > 60s p95              |

### 7.4 Observability Stack

```mermaid
graph LR
    Services[ECS Services] -->|structured logs| CWL[CloudWatch Logs]
    Services -->|traces| XRay[AWS X-Ray]
    Services -->|metrics| CWM[CloudWatch Metrics]
    CWL --> Insights[CloudWatch Insights]
    CWM --> Alarms[CloudWatch Alarms]
    Alarms --> SNSAlerts[SNS → PagerDuty / Slack]
    XRay --> ServiceMap[X-Ray Service Map]
```

---

## 8. Migration Phases — Strangler Fig

```mermaid
gantt
    title Strangler Fig Migration Plan
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Phase 1 — Gateway Shell
    Deploy gateway as pass-through    :p1a, 2026-07-06, 14d
    Shadow traffic validation         :p1b, after p1a, 7d
    Cut DNS to gateway                :milestone, after p1b, 0d

    section Phase 2 — Extract Validation
    Scaffold validation-service       :p2a, after p1b, 7d
    Migrate validation routes         :p2b, after p2a, 14d
    Gateway routes to validation-svc  :p2c, after p2b, 7d

    section Phase 3 — Extract Refund
    Scaffold refund-service           :p3a, after p2c, 7d
    Migrate refund + export routes    :p3b, after p3a, 14d
    Gateway routes to refund-svc      :p3c, after p3b, 7d

    section Phase 4 — Retire Monolith
    Remove monolith routes from GW    :p4a, after p3c, 7d
    Decommission monolith ECS service :p4b, after p4a, 7d
    Post-migration validation         :milestone, after p4b, 0d
```

### Phase Details

| Phase | Sprint(s) | Deliverable                                           | Rollback Strategy                          |
| ----- | --------- | ----------------------------------------------------- | ------------------------------------------ |
| 1     | 1-2       | Gateway deployed; 100% pass-through to monolith       | Remove gateway, DNS reverts to monolith    |
| 2     | 2-4       | Validation routes served by new service               | Gateway feature flag routes back to monolith |
| 3     | 4-5       | Refund/export routes served by new service            | Gateway feature flag routes back to monolith |
| 4     | 5-6       | Monolith decommissioned                               | Re-deploy monolith from last known image   |

### Gateway Routing During Migration

```mermaid
stateDiagram-v2
    [*] --> PassThrough: Phase 1
    PassThrough --> ValidationExtracted: Phase 2
    ValidationExtracted --> RefundExtracted: Phase 3
    RefundExtracted --> MonolithRetired: Phase 4

    state PassThrough {
        /v1/* --> Monolith
    }

    state ValidationExtracted {
        /v1/validations/* --> ValidationService
        /v1/refunds/* --> Monolith2: Monolith
        /v1/configurations/* --> ValidationService2: ValidationService
    }

    state RefundExtracted {
        /v1/validations/** --> VS3: ValidationService
        /v1/refunds/** --> RS3: RefundService
        /v1/configurations/** --> VS4: ValidationService
    }

    state MonolithRetired {
        All_routes --> TargetServices
    }
```

---

## 9. API Versioning & Backward Compatibility

### Strategy: URL Path Versioning with Gateway Adapter

| Principle                        | Implementation                                                    |
| -------------------------------- | ----------------------------------------------------------------- |
| Zero client changes              | Gateway retains `/v1/*` routes; Angular client is unmodified      |
| Internal services are unversioned| Downstream services expose `/validations/*`, `/refunds/*` (no v1) |
| Version translation at gateway   | Gateway maps `/v1/validations/…` → validation-service `/validations/…` |
| Future v2                        | New routes added at gateway when breaking changes needed          |
| Deprecation                      | `Sunset` header + 90-day notice before removing old routes        |

### Gateway Route Mapping

```typescript
// gateway/src/routes.ts
const routeMap = [
  { pattern: '/v1/validations/**', target: 'validation-service', strip: '/v1' },
  { pattern: '/v1/refunds/**',     target: 'refund-service',     strip: '/v1' },
  { pattern: '/v1/configurations/**', target: 'validation-service', strip: '/v1' },
  { pattern: '/v1/health',         target: 'local' },
];
```

### Contract Testing

- Each service publishes an OpenAPI 3.x spec as a build artifact.
- Gateway runs contract tests against downstream specs on every CI build.
- Breaking changes detected in CI prevent merge (consumer-driven contract testing via Pact or schema diff).

### Response Envelope (unchanged from monolith)

```json
{
  "data": { ... },
  "meta": {
    "correlationId": "abc-123",
    "timestamp": "2026-06-21T13:00:00.000Z"
  },
  "errors": []
}
```

---

## Appendix A — Technology Decisions

| Concern             | Choice                        | Rationale                                      |
| ------------------- | ----------------------------- | ---------------------------------------------- |
| Language            | Node.js / TypeScript          | Team expertise, existing codebase              |
| Framework           | Express (gateway), Fastify (services) | Fastify for perf in hot path; Express for proxy compat |
| Circuit Breaker     | opossum                       | Established in team, Node-native               |
| HTTP Client         | undici                        | Built into Node, high performance              |
| Messaging           | AWS SNS + SQS                 | Managed, serverless, native dead-letter        |
| Tracing             | aws-xray-sdk                  | Disney standard, integrates with ECS           |
| Logging             | pino                          | Fast structured JSON logging                   |
| Container Registry  | ECR                           | AWS-native, IAM-integrated                     |
| CI/CD               | Harness                       | Existing organizational standard               |
| IaC                 | Terraform                     | Team standard for ECS / networking             |

---

## Appendix B — Service Repository Structure

```
wdpr-payment-controls-gateway/    # Thin router + auth + circuit breakers
wdpr-validation-service/          # Validation domain logic
wdpr-refund-service/              # Refund + export domain logic
config-studio-infra/              # Terraform for shared infra (SNS, ALB, VPC)
```

Each service repo contains:

```
src/
  controllers/
  services/
  middleware/
  events/         # SNS publishers / SQS consumers
  clients/        # HTTP clients to config-services
  health/
test/
infra/            # Service-specific Terraform (ECS task def, SQS queue)
Dockerfile
harness/          # Harness pipeline YAML
openapi.yaml      # Contract spec
```
