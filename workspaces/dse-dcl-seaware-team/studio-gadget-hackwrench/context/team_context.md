# Studio Gadget Hackwrench — PCeC Java Microservices

## Mission
Rebuild the .NET services between Seaware and Digital (PCeC — Personal Cruise Experience Cloud) by migrating them to modern Java microservices. Spun out of Studio Crush to focus on the next-generation stack.

## Team
| Role | Name |
|------|------|
| Tech Manager | Kim Baker |
| Tech Lead | Ric Alvarez |
| Business Analysis | Julie Stoddard |
| Lead Product Manager | Daniel Hutson |
| Scrum Master | Christopher Furtado |
| Dev | Andrew Fernandez, Pedro Gonzalez, Elian Rosendi, Darwin Araque Ortiz |
| QA | Jaya Naga Bhavitha Vetukuri, Nivetha Sivaji, Apurva Potdar, Salvador Vega |

## Business Context
DCL's digital platforms (DCL.com, mobile app) currently call legacy .NET APIs to interact with Seaware. Gadget Hackwrench is building the **next generation** of these services in Java 21 / Spring Boot 3 with reactive non-blocking I/O to handle peak booking load (wave season). The new services use Clean Architecture, are containerized, and deploy via Harness → Kubernetes.

This is the team actively building greenfield code and the primary consumer of modern dev tooling.

## Supported BAPPs

### DCL Services
| BAPP ID | Name |
|---------|------|
| BAPP0254795 | DCL SEAS Activity Availability Service |
| BAPP0252634 | DCL SEAS Booking Service |
| BAPP0254793 | DCL SEAS Client Service |
| BAPP0254785 | DCL SEAS DataNavigator Service |
| BAPP0254787 | DCL SEAS Lookup Service |
| BAPP0255748 | DCL SEAS Right to Forget Service |
| BAPP0254789 | DCL SEAS Reservation Details Service |
| BAPP0253152 | DCL SEAS Reservations List Service |

### ABD Services
| BAPP ID | Name |
|---------|------|
| BAPP0255425 | ABD Client Service |
| BAPP0255419 | ABD DataNavigator Service |
| BAPP0255423 | ABD Lookup Service |
| BAPP0255754 | ABD Right to Forget Service |

## Repositories (GitHub — `github.disney.com/dcl/`)

| Repository | Service | Description |
|------------|---------|-------------|
| `seas-reservation-list-service` | Reservation List | Retrieve reservation headers for authenticated users |
| `seas-reservation-details-service` | Reservation Details | Full reservation detail including guests, activities |
| `seas-booking-service` | Booking | Create/modify reservations |
| `seas-activity-availability-service` | Activity Availability | Query available onboard activities |
| `seas-client-service` | Client | Guest profile management |
| `seas-lookup-service` | Lookup | Reference data (ports, ships, voyage types) |
| `seas-datanavigator-service` | DataNavigator | Orchestration layer for multi-source data retrieval |
| `seas-right-to-forget-service` | Right to Forget | GDPR data erasure |

## Architecture

### Technology Stack
| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3.x, Spring WebFlux |
| Reactive | Project Reactor |
| Build | Maven (`-ff` fail-fast) |
| Caching | Caffeine (in-memory) |
| Auth | OAuth2 Resource Server (B2B JWT) |
| Observability | OpenTelemetry, Micrometer, Spring Boot Actuator |
| Security Scanning | Semgrep, Sonar, IAGO |
| Quality Gates | JaCoCo (100% class, 95% line/method) |
| Versioning | Calendar-based (e.g., `2026.18.0`) |

### Clean Architecture Pattern
```
┌─────────────────────────────────────────────────┐
│  api/    → Public API contracts (OpenAPI/Swagger)│
│  svc/    → Core business logic                   │
│  web/    → Application runtime (Spring Boot)     │
└─────────────────────────────────────────────────┘
```

Each service follows:
- **Controller Layer** — REST endpoints
- **Orchestration Service Layer** — composes multiple data sources
- **Service Layer** — single-concern data access
- **Repository Layer** — JPA / JDBC access

### DataNavigator Service
Central orchestration service that routes requests between:
- Seaware XML API (legacy)
- Direct database stored procedures
- GraphQL service

Determines optimal data source per operation. Acts as the "brain" routing layer for all PCeC data retrieval.

### CI/CD Pipeline
```
GitHub (PR merge) → Harness CI (build + test + Docker image) → AWS ECR
→ Harness CD → GitLab Helm chart → Rancher/Kubernetes
```

**Harness Project:** `DSE_SEAS_Reservation_List_Service`

### Helm Charts (GitLab)
- `gitlab.disney.com/dse/helm-deploys/dclsvc-reservation-seas-reservation-list-service`

### Environment URLs
| Env | Health Check Pattern |
|-----|---------------------|
| Latest | `https://latest.seassvc-dcl.wdprapps.disney.com/seas-{service}/healthcheck` |
| Stage | `https://stage.seassvc-dcl.wdprapps.disney.com/seas-{service}/healthcheck` |
| Load | `https://load.seassvc-dcl.wdprapps.disney.com/seas-{service}/healthcheck` |
| Prod | `https://seassvc-dcl.wdprapps.disney.com/seas-{service}/healthcheck` |

## Products
- Uplift & Modernization (legacy .NET → Java)
- Availability (activity/cabin searches)
- Booking (create/modify reservations)
- Itinerary (trip details and schedules)
- Client Management (guest profiles)
