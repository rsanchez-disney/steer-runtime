# Studio Gadget Hackwrench — Project Architecture

## Shared Platform

All services inherit from **`seas-parent`** POM and share:
- **Language:** Java 21 / Maven
- **Framework:** Spring Boot 3 + Spring WebFlux (reactive)
- **Shared libraries:** `seas-common-library` (common + common-test)
- **Module structure:** `api/` (contracts) + `svc/` (business logic) + `web/` (Spring Boot runtime)
- **Local dev:** `dry-seas` git submodule (shared Dockerfile, Docker Compose fragments, nginx proxy, `.env` secrets)
- **Docker pattern:** `dry-seas/docker/Dockerfile` → Harness CI → ECR; `dry-seas/local/Dockerfile-local` for local Maven-in-Docker builds
- **Nginx sidecar:** Shared routing fragments under `dry-seas/local/compose/fragments/nginx/`
- **Quality:** JaCoCo, Snyk dependency scanning, Semgrep, Sonar
- **Versioning:** Calendar-based (e.g., `2026.21.3`)

---

## seas-datanavigator

**Repo:** `github.disney.com/dcl/seas-datanavigator` (branch: `develop`)  
**GroupId:** `com.disneycruise.seas.datanavigator`  
**Version:** 2026.23.4  
**Parent:** seas-parent 2026.20.8-238

### Purpose
Central orchestration layer — provides a simple REST API to manage and look up reservations, clients, and more. Replaces the legacy .NET DataManager. Acts as the "brain" for all PCeC data retrieval.

### Modules
| Module | Purpose |
|--------|---------|
| `api` | Public API contracts (OpenAPI/Swagger) |
| `entity` | Domain entities: `busobj`, `seaware`, `vx-xml-api` |
| `web` | Spring Boot application runtime |

### Endpoints (`/seas-datanavigator`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/bookings/{bookingId}` | Get booking by ID |
| POST | `/bookings` | Create a new booking |
| PUT | `/bookings/{bookingId}` | Update a booking |
| DELETE | `/bookings/{bookingId}` | Delete a booking |
| GET | `/res-headers/{resId}` | Reservation header |
| GET | `/reservations/{resId}` | Reservation details |
| GET | `/clients/{clientId}` | Client by ID |
| DELETE | `/clients/{clientId}` | Forget client (GDPR) |
| GET | `/external-references/{refId}` | External reference |
| GET | `/seaware-settings` | App settings |
| GET | `/agencies/{agencyId}` | Agency by ID |
| GET | `/age-categories` | Age categories |

### Cross-Cutting Pattern (Decorator Chain)
```java
core → SecurityDecorator → AuditDecorator → MetricsDecorator → TracingDecorator → LoggingDecorator → Mono<T>
```

### Database
- Oracle (Seaware) via Hibernate Tools + `ojdbc17` 23.26
- Primary + Archive pool configuration (`seas.vx-db`)
- Multi-tenant DB credentials per downstream service

### Key Config
```
vx_primary_db_url=jdbc:oracle:thin:@//dcl-seawarefull-latest-master.wdatdbs.disney.com:1541/swfcd_a.dcl.disney.com
vx_bizlogic_url=https://latest.dclseawarefull.bizlogic-interface.wdprapps.disney.com/SwBizLogic/Service.svc
```

---

## seas-reservation-list

**Repo:** `github.disney.com/dcl/seas-reservation-list` (branch: `develop`)  
**GroupId:** `com.disneycruise.seas.reslisting`  
**Version:** 2026.20.0  
**Parent:** seas-parent 2026.17.0-160

### Purpose
REST API for reservation list retrieval. Returns reservation headers for authenticated users.

### Modules
`api/` → `svc/` → `web/`

### Dependencies (inter-service)
- `seas-datanavigator-api` v2026.18.0-815
- `seas-lookup-service-api` v2026.18.1-193
- `seas-client-service-api` v2026.18.0-131

### Features
- Reactive WebFlux HTTP API under `/seas-reservation-list-service`
- OAuth2 client credentials toward Disney authorization
- Integration with seas-datanavigator and seas-lookup-service

---

## seas-reservation-details

**Repo:** `github.disney.com/dcl/seas-reservation-details` (branch: `develop`)  
**GroupId:** `com.disneycruise.seas.resdetails`  
**Version:** 2026.21.3  
**Parent:** seas-parent 2026.17.0-160

### Purpose
REST API for full reservation detail retrieval (guests, activities, itinerary).

### Modules
`api/` → `web/`

### Dependencies (inter-service)
- `seas-datanavigator-api` v2026.20.1-876
- `seas-lookup-service-api` v2026.18.1-193
- `seas-client-service-api` v2026.18.0-131

### Features
- Reactive WebFlux HTTP API under `/seas-reservation-details-service`
- OAuth2 client credentials
- Integration with datanavigator, lookup, and client services

---

## seas-client-service

**Repo:** `github.disney.com/dcl/seas-client-service` (branch: `develop`)  
**GroupId:** `com.disneycruise.seas.client`  
**Version:** 2026.22.2  
**Parent:** seas-parent 2026.21.2-242

### Purpose
Guest profile management — lookup clients by ID, web login, household, SWID, or reservation.

### Modules
`api/` → `web/`

### Endpoints (`/seas-client-service`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/clients/{clientId}` | Client by numeric ID |
| GET | `/clients` | Clients by repeated `clientIds` params |
| GET | `/clients/webLogin/{webLogin}` | Client by web login (GUID) |
| GET | `/household/{householdId}/clients` | Clients in household |
| GET | `/swid/{swId}/clients` | Clients from SWID |
| GET | `/reservations/{resId}/clients` | Clients for a reservation |

### Dependencies
- `seas-datanavigator-api` v2026.21.2-913
- `seas-lookup-service-api` v2026.21.1-212
- Calls **Guest Keys** service

### Config
- `seas_guestkeys_url`, `seas_datanavigator_url`, `seas_lookup_service_url`
- OpenTelemetry (OTEL_*), OAuth2, actuator healthcheck

---

## seas-lookup-service

**Repo:** `github.disney.com/dcl/seas-lookup-service` (branch: `develop`)  
**GroupId:** `com.disneycruise.seas.lookup`  
**Version:** 2026.21.2  
**Parent:** seas-parent 2026.21.2-242

### Purpose
Reference data service — ships, currencies, age categories, activity types, agencies, Seaware settings.

### Modules
`api/` (JAR of contracts + clients) → `web/` (Spring Boot WebFlux runtime)

### HTTP Base Path
`/seas-lookup-service` (OpenAPI at `/v3/api-docs`, Swagger UI at `/swagger-ui/`)

### Dependencies
- `seas-datanavigator-api` v2026.21.1-899

---

## seas-rtf (Right To Forget)

**Repo:** `github.disney.com/dcl/seas-rtf` (branch: `develop`)  
**GroupId:** `com.disneycruise.seas.rtf`  
**Version:** 2026.7.0  
**Parent:** seas-parent 2026.7.0-131

### Purpose
GDPR data erasure — **serverless** (AWS Lambda via Spring Cloud Function).

### Architecture (unique — Lambda, not ECS)
| Layer | Technology |
|-------|-----------|
| Runtime | AWS Lambda (Spring Cloud Function Adapter) |
| Local dev | Spring Cloud Function WebFlux (exposes POST by function name) |
| Framework | Spring Boot + Spring Cloud Function |
| Deployment | Terraform/Serverless → LocalStack (local); Lambda (deployed) |
| Artifact | Shaded JAR (`*-aws.jar`) |

### Endpoints (local dev)
- `POST /deleteClientFunction` — deletes client data

### Dependencies
- `seas-datanavigator-api`
- Spring Cloud Function (WebFlux + AWS adapter)

---

## seas-activity-availability

**Repo:** `github.disney.com/dcl/seas-activity-availability` (branch: `develop`)  
**Purpose:** Query available onboard activities  
**Status:** Minimal README — standard SEAS service pattern

---

## Service Dependency Graph

```
                    ┌─────────────────┐
                    │  PCeC / DCL.com │
                    └───────┬─────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
┌─────────────────┐ ┌───────────────┐ ┌──────────────┐
│ reservation-list│ │ res-details   │ │ activity-    │
│                 │ │               │ │ availability │
└───────┬─────────┘ └───────┬───────┘ └──────┬───────┘
        │                   │                 │
        ▼                   ▼                 ▼
┌─────────────────────────────────────────────────────┐
│              seas-datanavigator                      │
│   (orchestrates: XML API, stored procs, GraphQL)    │
└─────────────────────────┬───────────────────────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌──────────┐ ┌────────┐ ┌─────────┐
        │ Oracle   │ │GraphQL │ │ BizLogic│
        │ (Seaware)│ │(Triton)│ │  (SOAP) │
        └──────────┘ └────────┘ └─────────┘
```

## CI/CD & Environments

- **Pipeline:** GitHub PR → Harness CI (build + test + Docker) → ECR → Harness CD → Helm → Rancher/K8s
- **Nginx:** Port 8080 local, proxies to all services in stack
- **Health:** `GET /{service}/healthcheck`
- **Swagger:** `GET /{service}/swagger-ui/`
