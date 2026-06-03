# Service → Repository Mapping

## Backend Services (Java — Spring Boot WebFlux)

| Service | Repo | Org | Base Branch | Java | Deploy |
|---------|------|-----|-------------|------|--------|
| MOO — Mobile Ordering Orchestration | mobile-ordering-orchestration-service | wdpro-development | develop | 21 | ECS |
| MOO Batch — Orphan order refunds | wdpr-mo-batch-svc | wdpro-development | develop | 17 | ECS |
| ROO — Retail Ordering Orchestration | retail-ordering-orchestration-service | wdpro-development | develop | 21 | ECS |
| ROO Batch | wdpr-ro-batch-svc | wdpro-development | develop | 17 | ECS |
| DiSCO — Dine Self Check-In Orchestration | dine-self-checkin-orchestration-service | wdpro-development | develop | 21 | ECS |
| Arrival Windows Service | wdpr-sales-dlrarrw-svc | StudioFeast | main | 21 | ECS |
| Arrival Windows Batch | wdpr-sales-dlrarrw-batch | StudioFeast | main | 21 | ECS |
| Dining Menus Service | dlr-commerce2-menu-svc | StudioFeast | develop | 17 | ECS |
| Order Service | fnb-order-service | studio-lumiere | main | 21 | ECS |
| Dinetime Reservation Sync | dinetime-reservation-sync | studio-lumiere | develop | 17 | ECS |
| Barcode Generation Service | barcode-gen-svc | studio-lumiere | develop | 17 | Lambda |

## Node.js Services

| Service | Repo | Org | Base Branch | Deploy |
|---------|------|-----|-------------|--------|
| DiSCO Admin API | dine-self-checkin-config-admin-api | wdpro-development | develop | ECS |
| DiSCO Config Service | dine-self-checkin-config-service | wdpro-development | develop | ECS |

## UI Applications

| Application | Repo | Org | Stack | Base Branch | Deploy |
|-------------|------|-----|-------|-------------|--------|
| DiSCO Admin UI | dine-self-checkin-config-admin-ui | wdpro-development | Angular 18 | develop | ECS (nginx) |
| Arrival Windows UI | arrwui-spa | cgs-wdw/arrwui (GitLab) | Flutter/Dart | main | Static (GitLab CI) |

## Shared Libraries

| Library | Purpose |
|---------|---------|
| fnb-reactor-common | Shared reactive utilities |
| fnb-app-api-reactor-client | App API client |
| fnb-venuenext-api-reactor-client | VenueNext integration |
| fnb-dscribe-api-reactor-client | Menu/content client |
| fnb-keyring-api-reactor-client | Auth/key management |
| fnb-payment-api-reactor-client | Payment integration |
| fnb-cache-spring-boot-starter | Caching layer |
| wdpr-svc-core | Core service utilities |
| arrival-window-entities | Shared entities (arrw-svc ↔ arrw-batch) |
| @wdpr/ra-node-* | Node.js RA libraries (auth, logging, security) |

## Parent POMs

| Parent | Version | Used by |
|--------|---------|---------|
| rrtd-spring-webflux-parent | 1.0.5–1.0.10 | MOO, ROO, arrw-svc, arrw-batch, fnb-order-service |
| wdpr-ra-springboot-parent | 1.2.1–25.0.0.7 | wdpr-mo-batch-svc, wdpr-ro-batch-svc |
| wdpr-parent | 1.2.0–21.5.0.0 | barcode-gen-svc, DiSCO, menu-svc, dinetime-sync |

## Not Cloned (access denied)

| Service | Repo | Org | Status |
|---------|------|-----|--------|
| Dining Menu UI | dining-menu-ui | studio-lumiere | Repo not found |
| Dining Menu Web API | dining-menu-web-api | studio-lumiere | Repo not found |

## Git Hosts

| Host | Repos |
|------|-------|
| github.disney.com | 14 repos (all except arrwui-spa) |
| gitlab.disney.com | 1 repo (arrwui-spa) |
