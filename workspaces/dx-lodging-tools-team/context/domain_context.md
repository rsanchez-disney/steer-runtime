# DX Lodging Tools — Domain Context

## Architecture Pattern

All applications follow a **3-tier pattern**:
- **SPA** — Single Page Application (guest/cast-facing UI, Angular)
- **WebAPI** — Intermediary BFF layer between SPA and VA (Node.js)
- **VA** (View Assembly) — Backend assembler that orchestrates calls to core services (Java/Spring Boot)

### Tech Stack

| Layer | Technology |
|-------|-----------|
| SPAs | Angular |
| WebAPIs | Node.js |
| VAs / Services | Java / Spring Boot |
| Batch Lambdas | Node.js (AWS Lambda) |

### Deployment
- **Cloud:** AWS (us-west-2 for DLR, us-east-1 for WDW)
- **CI/CD:** Harness (all projects)
- **Deployment:** Rundeck (`{app-name}_aws`)
- **Infrastructure:** Nimbus (nimbus_deploy)
- **Rundeck pattern:** `https://rundeck.wdprapps.disney.com/project/{app-name}_aws/jobs`

### Environments

All services follow the same pattern:

| Env | Pattern |
|-----|---------|
| Latest | `latest.{service}.wdprapps.disney.com` |
| Stage | `stage.{service}.wdprapps.disney.com` |
| Load | `load.{service}.wdprapps.disney.com` |
| Prod | `{service}.wdprapps.disney.com` |

## Downstream / Upstream Systems

| System | Role |
|--------|------|
| TravelBox (TBX) | Core reservation system, initiates ticket order/voucher batches |
| PMS (Property Management System) | RabbitMQ events for guest actions (claim/unclaim/digital key) |
| OneID | Guest authentication (SWID) |
| Payment Services | Credit Card, Disney Rewards, Gift Card processing |
| Digital Key | Room access via mobile |

## Observability

### Grafana
All services share a common dashboard:
- [Travel ePackage Health Check Dashboard](https://grafana.wdprapps.disney.com/d/TravelePackageHCBoard/travel-epackage-health-check-dashboard?orgId=1&from=now-15m&to=now&timezone=browser)

### Health Checks (Prod)

| Application | Health Check URL |
|-------------|----------------|
| Authentication Service | `https://authentication-svc.wdprapps.disney.com/authentication-service/healthcheck` |
| Package Entitlement Service | `https://package-entitlement-dlr.wdprapps.disney.com/package-entitlement-svc/info` |
| Resort Reservation VA | `https://resort-reservation-dlr.wdprapps.disney.com/resort-reservation-va/info` |
| Cast Resort Reservation WebAPI | `https://cast-resort-reservation-dlr.wdprapps.disney.com/api/v1/healthcheck` |
| Cast Resort Reservation SPA | `https://cast-resort-reservation-dlr.wdprapps.disney.com/spa/healthcheck` |
| Guest Resort Reservation WebAPI | `https://disneyland.disney.go.com/my-hotel-reservation/api/v1/healthcheck/` |
| Guest Resort Reservation SPA | `https://disneyland.disney.go.com/my-hotel-reservation/spa/healthreport/` |
| Resort Sales Checkout SPA | `https://disneyland.disney.go.com/resort-checkout/healthcheck/` |
| Resort Sales Checkout WebAPI | `https://disneyland.disney.go.com/resort-checkout/api/v1/healthcheck/` |
| Resort Sales Checkout VA | `https://resort-sales-checkout-va-dlr.wdprapps.disney.com/resort-checkout-va/info` |
| Celebrations Svc | `https://celebrationssvc.wdprapps.disney.com/info` |
| Trade Retrieve SPA | `https://trade-retrieve-spa.wdprapps.disney.com/healthcheck/` |
| Trade Retrieve WebAPI | `https://trade-retrieve-spa.wdprapps.disney.com/api/v1/healthcheck` |
| Trade Retrieve VA | `https://trade-retrieve-va.wdprapps.disney.com/wdpr-packaging-traderetrieve-va/info` |
| Pinned Offer SPA | `https://pinned-offer-spa.wdprapps.disney.com/healthcheck` |
| Pinned Offer WebAPI | `https://pinned-offer-spa.wdprapps.disney.com/api/v1/healthcheck` |
| Non-Disney Addons VA (WDW) | `https://latest.wdw-non-disney-addons-va.wdprapps.disney.com/non-disney-addons-va/healthcheck` |

### AppDynamics (Prod)

| Application | App ID | Component | Link |
|-------------|--------|-----------|------|
| Authentication Service | 717 | 306240 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=717&component=306240&dashboardMode=force) |
| DLR Package Entitlement Service | 758 | 306857 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=758&component=306857&dashboardMode=force) |
| DLR Resort Reservation VA | 758 | 306441 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=758&component=306441&dashboardMode=force) |
| DLR Cast Resort Reservation SPA | 758 | 306656 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=758&component=306656&dashboardMode=force) |
| DLR Cast Resort Reservation WebAPI | 758 | 306657 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=758&component=306657&dashboardMode=force) |
| DLR Guest Resort Reservation SPA | 758 | 306580 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=758&component=306580&dashboardMode=force) |
| DLR Guest Resort Reservation WebAPI | 758 | 306579 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=758&component=306579&dashboardMode=force) |
| DLR Resort Sales Checkout SPA | 758 | 323187 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=758&component=323187&dashboardMode=force) |
| DLR Resort Sales Checkout WebAPI | 758 | 323186 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=758&component=323186&dashboardMode=force) |
| DLR Resort Sales Checkout VA | 758 | 323188 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=758&component=323188&dashboardMode=force) |
| WDPR Celebrations SPA | 497 | 227990 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_4_hours.BEFORE_NOW.-1.-1.240&application=497&component=227990&dashboardMode=force) |
| WDPR Celebrations WebAPI | 497 | 227986 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_4_hours.BEFORE_NOW.-1.-1.240&application=497&component=227986&dashboardMode=force) |
| WDPR Celebrations Svc | 497 | 353560 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_4_hours.BEFORE_NOW.-1.-1.240&application=497&component=353560&dashboardMode=force) |
| WDPRT Trade Retrieve SPA | 1127 | 326520 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1127&component=326520&dashboardMode=force) |
| WDPRT Trade Retrieve WebAPI | 1127 | 326519 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1127&component=326519&dashboardMode=force) |
| WDPRT Trade Retrieve VA | 1127 | 326521 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1127&component=326521&dashboardMode=force) |
| WDPR Lodging Pinned Offer SPA | 1245 | 338552 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1245&component=338552&dashboardMode=force) |
| WDPR Lodging Pinned Offer WebAPI | 1245 | 338613 | [Component](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1245&component=338613&dashboardMode=force) |

## Key Business Flows

### Resort Reservation Flow
```
Guest/Cast → SPA → WebAPI → VA → Core Services (TravelBox/PMS)
```

### Resort Sales Checkout Flow
```
Guest/Cast → Checkout SPA → Checkout WebAPI → Checkout VA → Payment Services
```

### PMS RabbitMQ Event Sync
```
PMS → RabbitMQ → Package Entitlement Service
```
- **Broker:** `{env}.pms-rmq.wdprapps.disney.com`
- **Exchange:** `PSPKGENTTL.GUESTACTION`
- **Queue:** `PSPKGENTTL.GUESTACTION.DLRGEMSUB`
- **Events:** CLAIM, UNCLAIM, REENCODE, DISABLE
- **Resort Codes:** PH, DH, CH, CV
