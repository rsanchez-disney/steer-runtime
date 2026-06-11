# Studio Maui — Project Architecture

## scuttle (Web Portal)

**Repo:** `github.disney.com/dcl/scuttle` (branch: `main`)  
**Description:** Web app for accessing SEAS-owned data and tools, including Seaware data.

### Monorepo Structure (Nx Workspace)
| App | Framework | Purpose |
|-----|-----------|---------|
| `scuttle-ui` | Angular 20 | Frontend — MyID (OIDC) auth, Tailwind CSS, Disney MDX design system |
| `scuttle-api` | NestJS 10 (Node.js) | BFF — proxy to SEAS APIs, hides auth secrets from web clients |
| `scuttle-ui-e2e` | Playwright | E2E tests (Chromium) |

### Frontend Stack (scuttle-ui)
| Layer | Technology |
|-------|-----------|
| Framework | Angular ~20.3 (TypeScript ~5.8) |
| Build | Nx 21.6, Vite 7.3, Vitest 4.1 |
| Styling | Tailwind CSS 3 + SCSS |
| Design System | Disney WDPR components (`@wdpr/breadcrumbs`, `modal`, `pagination`, etc.) |
| Icons | `@wdpr/mdx-icons` ^18 |
| Charts | Chart.js 4.5 + ng2-charts 10 |
| Auth | OIDC (MyID) via BFF, role-based guards (Keystone) |
| State | RxJS ~7.8 |

### Backend Stack (scuttle-api)
| Layer | Technology |
|-------|-----------|
| Framework | NestJS 10.x |
| Runtime | Node.js 20+ |
| Database | SQLite (Better-SQLite3) + Kysely query builder |
| Oracle | `oracledb` ^6.9 (thick client mode) |
| File Storage | AWS S3 (`@aws-sdk/client-s3`) |
| Auth | Passport.js (OIDC), express-session |
| Roles | Keystone (`@wdpr/ra-node-keystone-utils`) |
| XML Parsing | `fast-xml-parser` ^5.5 |
| Excel | `xlsx` ^0.18 |
| CSV | `csv-parser` ^3.2 |
| Metrics | Prometheus (`prom-client`, `@willsoto/nestjs-prometheus`) |
| Observability | AppDynamics (`@wdpr/ra-node-appdynamics`), Logasaurus |
| API Clients | OpenAPI Generator (typescript-fetch) for downstream services |
| File Archiving | `archiver` ^7 (zip/download) |
| HTTP | Axios ^1.15 |
| Validation | class-validator + class-transformer |

### Key Integrations (via OpenAPI clients)
- **ReservationApi** — `https://latest.dclsvc-reservation.wdprapps.disney.com/reservation_api/`
- **BookingApi** — `https://latest.dclsvc-reservation.wdprapps.disney.com/booking_api/`
- **Automic** — `https://stg-automation-engine-a.wdprapps.disney.com:8088/ae/api/v1/`
- **Seaware Oracle DB** — direct via `oracledb` (thick client)

### Auth Flow (OIDC)
```
Browser → /api/account/login → MyID OIDC → /api/account/signin (callback) → session cookie
Roles enforced via Keystone → roleGuard on Angular routes
```

### Uploader Pattern (Extensible)
- **Frontend:** Step-based wizard (`upload → validate → process → confirm`); custom `stepMatcher` routing
- **Backend:** `UploaderController` → `UploaderService` → `UploadProcessor` strategy pattern
- **Parallelism:** Stateroom uploads support concurrent BizLogic sessions (`STATEROOM_UPLOAD_MAX_SESSIONS`, capped at 32)
- **Progress:** `AsyncLocalStorage` + `UploaderAsyncSerial` for ordered progress updates

### Current Uploaders
- IRGS Room Assignment
- Dry Dock configuration
- Charter setup
- Groups
- Shipboard
- FX Rate
- 1099 Finance
- GTY (Room Assignment)
- Stateroom

### Build & Deploy
```bash
npm run dev          # Start both UI + API (Nx parallel)
npm run build        # Production build (custom build.js)
npm run lint         # ESLint (all projects)
npm run test         # API unit + integration + UI unit + Playwright e2e
```

### CI/CD
- **Harness Project:** `DSE_SEAS_Scuttle`
- **Snyk:** Dependency scanning
- **Helm Charts:**
  - UI: `gitlab.disney.com/dse/helm-deploys/dclsvc-reservation-scuttle-ui`
  - API: `gitlab.disney.com/dse/helm-deploys/dclsvc-reservation-scuttle-api`
- **Deploy:** RKE2 Kubernetes via Rancher

### Environment URLs
| Env | URL |
|-----|-----|
| Latest | `https://latest.scuttle.wdprapps.disney.com/` |

---

## dcl-zazu-eventing-service

**Repo:** `github.disney.com/dcl/dcl-zazu-eventing-service` (not accessible with current token)

### Stack
| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3 |
| Purpose | Event-driven data propagation from Seaware |
| Messaging | Kafka (sink) + Webhook (sink) |
| Scheduling | ShedLock (JDBC backend, cluster-safe) |
| Metrics | Micrometer (lag, rows pulled, sent, failures, retry depth) |

### Architecture
```
EventRegistry (YAML defs)
    → Poller Orchestrator (sharded, ShedLock)
        → Source Connectors (JDBC stored procs)
            → Transformer (DB rows → ZazuEvent JSON)
                → Router (SpEL rules)
                    → KafkaSink (keys, headers, DLQ)
                    → WebhookSink (auth, signing, circuit breaker)
Offset/Dedup Store (watermarks per event+shard, idempotency per destination+eventId)
```

### Scalability
- Horizontal via sharding + ShedLock (no duplicate work)
- JDBC offset store for crash recovery
- Circuit breaker on webhook destinations
- DLQ for Kafka failures

---

## Other Repos (Azure DevOps — .NET)

All remaining Maui services are in Azure DevOps (`dev.azure.com/disney-cruise/shoreside/_git/`):

| Service | Repos | Stack |
|---------|-------|-------|
| Insurance (DCL/ABD) | `Seaware.Insurance`, `ABD.Seaware.Insurance` | .NET / AON API |
| Booking Alert | `Services.BookingAlert.Api/Batch/Web` | .NET API + batch + UI |
| RMS Extracts (14 repos) | `Seaware.RMS.*` | .NET console apps (Automic-scheduled) |
