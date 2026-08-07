# Runbook — Entitlement Availability Service (EAS)

Source: [Confluence WDPROS](https://confluence.disney.com/pages/viewpage.action?spaceKey=WDPROS&title=EAS+-+Entitlement+Availability+Service+-+Runbook)

## Overview

EAS is a Lambda-based service that combines information from **Stop Sales Service** and **CME Availability** into a single flag to indicate salability for a particular date and SKU. Designed only for date-specific SKUs (theme park tickets, water parks, special events).

## Architecture & Dependencies

```
Client → API Gateway → EAS Lambda
                          ├── StopSales Redis (cached)
                          ├── CME Availability Service (by inventory category)
                          ├── LexVAS Service (cached into Redis by SKU)
                          ├── EAPI (cached into Redis by SKU)
                          └── AuthZ (token validation + generation)
```

**Required AuthZ Scope:** `tpr-stopsales-r`

**Cache bypass:** Use header `x-eas-bypass-cache` to skip Redis cache.
**EAPI override:** Use header `x-disney-eapi-uri-override` to override base URL.

## Current Clients

- **PTAS** — Package sales and mods
- **DTS** — Service Now, batch calls to EAS to update DB of sellable ticket days
- **EVAS** — Ticket modification flows
- **Recommender SE**
- **Digital Park Signage** (integrating soon)

## Source Code & CI/CD

| Item | URL |
|------|-----|
| Primary Repository | https://github.disney.com/commerce/entlavail-lambda |
| Legacy Repository | https://gitlab.disney.com/cgs-wdw/entlavail/entlavail-lambda |
| Terraform (infra) | https://gitlab.disney.com/cgs-wdw/entlavail/entlavail-lambda-terraform |
| Harness CI/CD | https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/module/ci/orgs/Commerce/projects/WDPR_Commerce_Entitlement_Availability/overview |
| OpenAPI Spec | https://github.disney.com/commerce/entlavail-lambda/blob/main/lambdas/get-documentation/documentation/openapi.json |

## Health Check / Documentation Endpoints

| Environment | URL |
|-------------|-----|
| Latest | https://latest.entlavail-internal-wdw.wdprapps.disney.com/api/get-documentation |
| Stage | https://stage.entlavail-internal-wdw.wdprapps.disney.com/api/get-documentation |
| Load | https://load.entlavail-internal-wdw.wdprapps.disney.com/api/get-documentation |
| Production | https://entlavail-internal-wdw.wdprapps.disney.com/api/get-documentation |

## Lambda Functions

### Primary (current)

| Environment | Account | Lambda Names |
|-------------|---------|--------------|
| Latest | wdpr-ecommerce-dev (718439781381) | `wdw-ecommerce-B0244050-use1-lst-entlavail-availabilities` |
| | | `wdw-ecommerce-B0244050-use1-lst-entlavail-cache-keys` |
| | | `wdw-ecommerce-B0244050-use1-lst-entlavail-get-documentation` |
| | | `wdw-ecommerce-B0244050-use1-lst-entlavail-modification-options` |
| Stage | wdpr-ecommerce-test (168997411205) | `wdw-ecommerce-B0244050-use1-stg-entlavail-availabilities` |
| | | `wdw-ecommerce-B0244050-use1-stg-entlavail-cache-keys` |
| | | `wdw-ecommerce-B0244050-use1-stg-entlavail-get-documentation` |
| | | `wdw-ecommerce-B0244050-use1-stg-entlavail-modification-options` |
| Load | wdpr-ecommerce-test (168997411205) | `wdw-ecommerce-B0244050-use1-lod-entlavail-availabilities` |
| | | `wdw-ecommerce-B0244050-use1-lod-entlavail-cache-keys` |
| | | `wdw-ecommerce-B0244050-use1-lod-entlavail-get-documentation` |
| | | `wdw-ecommerce-B0244050-use1-lod-entlavail-modification-options` |
| Production | wdpr-ecommerce-prod (820987038150) | `wdw-ecommerce-B0244050-use1-prd-entlavail-availabilities` |
| | | `wdw-ecommerce-B0244050-use1-prd-entlavail-cache-keys` |
| | | `wdw-ecommerce-B0244050-use1-prd-entlavail-get-documentation` |
| | | `wdw-ecommerce-B0244050-use1-prd-entlavail-modification-options` |

### Legacy (deprecated — still running in parallel)

| Environment | Lambda Names |
|-------------|--------------|
| Latest | `entlavail-use1-lst-entlavail-availabilities`, `entlavail-use1-lst-entlavail-modification-options`, `entlavail-use1-lst-entlavail-get-documentation` |
| Stage | `entlavail-use1-stg-entlavail-availabilities`, `entlavail-use1-stg-entlavail-modification-options`, `entlavail-use1-stg-entlavail-get-documentation` |
| Load | `entlavail-use1-lod-entlavail-availabilities`, `entlavail-use1-lod-entlavail-modification-options`, `entlavail-use1-lod-entlavail-get-documentation` |
| Production | `entlavail-use1-prd-entlavail-availabilities`, `entlavail-use1-prd-entlavail-modification-options` |

## Redis / ElastiCache (StopSales shared)

| Environment | Endpoint |
|-------------|----------|
| Latest | `stopsales-latest.rvhfcl.ng.0001.use1.cache.amazonaws.com` |
| Stage | `stopsales-stage.fwkg1l.ng.0001.use1.cache.amazonaws.com` |
| Load | `stopsales-load.fwkg1l.ng.0001.use1.cache.amazonaws.com` |
| Production | `stopsales-prod.xuqkma.ng.0001.use1.cache.amazonaws.com` |

## Splunk

### Indexes & Queries

| Environment | SPL |
|-------------|-----|
| Production (primary) | `index=wdpr_wdw_eas source=*B0244050-use1-prd*` |
| Production (legacy) | `index=wdpr_wdw_eas source=*us-east-1*` |
| Lower envs (primary) | `index=wdpr_wdw_eas source=*B0244050-use1-<env>*` |
| Lower envs (legacy) | `index=wdpr_wdw_eas source=*us-east-1*<env>*` |

### Dashboards — Production

- [Performance Review](https://splunk.wdprapps.disney.com/en-US/app/launcher/pearl__entitlement_availability_service__performance_review)
- [Performance History](https://splunk.wdprapps.disney.com/en-US/app/launcher/pearl__entitlement_availability_service__performance_review__2)
- [Request Analysis](https://splunk.wdprapps.disney.com/en-US/app/launcher/pearl__entitlement_availability_service__request_analysis)
- [Downstream Response Times](https://splunk.wdprapps.disney.com/en-US/app/launcher/studio_control__eas_downstream_response_times)
- [Retry Requests](https://splunk.wdprapps.disney.com/en-US/app/launcher/studio_control__eas__retry_requests)
- [Stop Sales Dashboard](https://splunk.wdprapps.disney.com/en-US/app/launcher/pearl__stop_sales__services_dashboard)

### Dashboards — Pre-prod

- [Performance Review](https://stage.splunk.wdprapps.disney.com/en-US/app/search/pearl__entitlement_availability_service__performance_review)
- [Request Analysis](https://stage.splunk.wdprapps.disney.com/en-US/app/search/studio_control__eas__request_analysis)
- [Downstream Response Times](https://stage.splunk.wdprapps.disney.com/en-US/app/search/studio_control__eas__downstream_response_times)
- [Retry Requests](https://stage.splunk.wdprapps.disney.com/en-US/app/search/studio_control__eas__retry_requests)

### Alerts

- EAS WDW Availabilities Error Alert
- EAS WDW Modification-options Error Alert
- EAS WDW Long Response Alert
- EAS Found Misconfigured Reservation Required Periods

## AppDynamics

> ⚠️ **APPD is DISABLED** — Integration exists but is turned off because APPD monitoring caused a significant performance impact to the lambda service.

## Notes

- **No EventBridge/Scheduler** — EAS has no triggers
- **CME Availability** is called by inventory category, NOT by SKU — sku-specific blockout dates are not returned
- **LexVAS and EAPI** responses are cached into Redis by SKU
