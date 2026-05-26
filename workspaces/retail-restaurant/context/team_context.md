# Retail & Restaurant Engineering — Architecture Guide

## Overview

The Mobile Retail & Restaurant Engineering team builds and maintains the guest-facing mobile ordering, dining reservation, and self check-in experiences across Walt Disney World (WDW) and Disneyland Resort (DLR).

## Domain Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Guest Mobile Apps                         │
│  ┌──────────────────┐              ┌──────────────────────────┐ │
│  │  iOS (Anglerfish) │              │  Android (Proteus)       │ │
│  │  - Mobile Order   │              │  - Mobile Order MDX      │ │
│  │  - Dine Booking   │              │  - Dine Booking          │ │
│  │  - Park App       │              │  - Park App              │ │
│  └────────┬─────────┘              └────────────┬─────────────┘ │
└───────────┼─────────────────────────────────────┼───────────────┘
            │                                     │
            ▼                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Services (Lumiere)                     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Mobile Ordering                                          │   │
│  │  • MOO (mobile-ordering-orchestration-service)            │   │
│  │  • MOBatch (wdpr-mo-batch-svc)                            │   │
│  │  • Arrival Windows (wdpr-sales-dlrarrw-svc + batch)       │   │
│  │  • Order Service (fnb-order-service)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Retail Ordering (MMC)                                    │   │
│  │  • ROO (retail-ordering-orchestration-service)            │   │
│  │  • ROO Batch (wdpr-ro-batch-svc)                          │   │
│  │  • Barcode Gen (barcode-gen-svc)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  DiSCO (Dine Self Check-in) — Project: Radish/Raspberry   │   │
│  │  • Orchestration (dine-self-checkin-orchestration-service) │   │
│  │  • Config Service (dine-self-checkin-config-service)       │   │
│  │  • Admin API (dine-self-checkin-config-admin-api)          │   │
│  │  • Admin UI (dine-self-checkin-config-admin-ui)            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Dining                                                    │   │
│  │  • Menu Service (dlr-commerce2-menu-svc)                  │   │
│  │  • Menu UI (dining-menu-ui)                               │   │
│  │  • Menu Web API (dining-menu-web-api)                     │   │
│  │  • Reservation Sync (dinetime-reservation-sync)           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Pay at Table                                              │   │
│  │  Orchestration for paying at table via barcode scan        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Integrations                          │
│  VenueNext (order fulfillment) · APP (Disney payments)           │
│  Disney CAS · Disney PMS · Kitchen Display System (KDS)          │
└─────────────────────────────────────────────────────────────────┘
```

## Repository Map

### Studio Lumiere — Services (Java unless noted)

| Repo | Org | Purpose |
|------|-----|---------|
| mobile-ordering-orchestration-service | wdpro-development | MOO — Mobile Ordering Orchestration |
| wdpr-mo-batch-svc | wdpro-development | MOO Batch — orphan order refunds |
| retail-ordering-orchestration-service | wdpro-development | ROO — Retail Ordering (MMC) |
| wdpr-ro-batch-svc | wdpro-development | ROO Batch |
| barcode-gen-svc | studio-lumiere | Barcode Generation for ROO/MMC |
| dine-self-checkin-orchestration-service | wdpro-development | DiSCO orchestration |
| dine-self-checkin-config-service | wdpro-development | DiSCO config service |
| dine-self-checkin-config-admin-api | wdpro-development | DiSCO admin API (Node.js) |
| dine-self-checkin-config-admin-ui | wdpro-development | DiSCO admin UI (Angular) |
| wdpr-sales-dlrarrw-svc | StudioFeast | Arrival Windows service |
| wdpr-sales-dlrarrw-batch | StudioFeast | Arrival Windows batch |
| dlr-commerce2-menu-svc | StudioFeast | Dining Menus Service |
| dining-menu-ui | studio-lumiere | Dining Menu UI (Angular) |
| dining-menu-web-api | studio-lumiere | Dining Menu Web API (Node.js) |
| fnb-order-service | studio-lumiere | Order Service |
| dinetime-reservation-sync | studio-lumiere | Dinetime Reservation Sync |

### Studio Lumiere — Libraries

| Repo | Org | Purpose |
|------|-----|---------|
| fnb-cache-spring-boot-starter | studio-lumiere | FNB Cache library (fork) |
| fnb-dscribe-api-reactor-client | studio-lumiere | D-Scribe Client library (fork) |

### Studio Anglerfish — iOS

| Org | Purpose |
|-----|---------|
| github.disney.com/studio-anglerfish | iOS application repos |
| github.disney.com/wdpro-mobile | Shared iOS platform |

### Studio Proteus — Android

| Org | Purpose |
|-----|---------|
| github.disney.com/studio-proteus | Android application repos |
| github.disney.com/park-platform-android | Shared Android platform |

## GitHub Orgs

- `wdpro-development` — Shared org for major services
- `StudioFeast` — Legacy org (Arrival Windows, Dining Menus)
- `studio-lumiere` — Lumiere-owned services and libraries
- `studio-anglerfish` — iOS repos
- `studio-proteus` — Android repos
- `wdpro-mobile` — Shared iOS platform
- `park-platform-android` — Shared Android platform

## Monitoring & Observability

All services monitored via Splunk dashboards:

| Dashboard | Service | Scope |
|-----------|---------|-------|
| MOO General Stats | MOO | WDW/DLR |
| Mobile Order Monitoring Tool | MOO | DLR |
| Mobile Order Guest Tracing Tool | MOO | All |
| WDWD MOO Health | MOO | WDW |
| MOTE Abandoned Sessions | MOO | All |
| WDW/DLR VenueNext Stats | VenueNext | WDW/DLR |
| Arrival Windows General Stats | Arrival Windows | All |
| DiSCO General Status | DiSCO | WDW/DLR |
| DiSCO Troubleshooting Dashboard | DiSCO | All |
| WDW Dine Bookings Stats | Dine Booking | WDW |

### Alerts
- Interval: 15–30 minutes
- Threshold: 5–25 error count triggers
- Notification: #fnb-mobile-monitoring Slack + email
- Services covered: MOO, MOBatch, DiSCO

## Conventions

- **Jira**: FNB- (food & beverage), MERCH- (merchandise) on myjira.disney.com
- **Wiki**: FBT space on mywiki.disney.com
- **Commit style**: Conventional commits
- **Branch naming**: `{type}/{ticket-id}/description`
- **PR scope**: One story = one PR

## Key Integrations

| System | Purpose |
|--------|---------|
| VenueNext | External vendor — order fulfillment |
| APP | Disney payment platform |
| Disney CAS | Authentication/authorization |
| Disney PMS | Property Management System |
| KDS | Kitchen Display System — order routing |
| MDX | Disney Experience API platform |
| D-Scribe | Service discovery/registry |
| Keyring | Key/secret management |
| Finder | Location/venue lookup |
