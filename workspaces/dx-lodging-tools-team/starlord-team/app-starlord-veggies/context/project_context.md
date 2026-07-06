# Veggies Project — Non-Disney Add Ons

## Domain

Non-Disney Add Ons enables guests to add third-party services to their resort packages:
- **Rental Car** (WDW, DLR, AUL)
- **Shuttle Service** (DLR)
- **Travel Protection Plan** (WDW, DLR, AUL)
- **DLR Area Attractions**
- **DLR Anaheim Resort Transportation**

## Applications

| BAPP ID | Application | Repo | Harness |
|---------|-------------|------|---------|
| BAPP0252928 | WDPR Non-Disney Add Ons SPA | `wdprd-development/wdpr-non-disney-addons-spa` | WDPR_NonDisney_Add_Ons_SPA |
| BAPP0252930 | WDPR Non-Disney Add Ons API | `wdprd-development/wdpr-non-disney-addons-api` | WDPR_NonDisney_Add_Ons_API |
| BAPP0252932 | WDPR Non-Disney Add Ons VA | `wdprt-paap-api/wdpr-non-disney-addons-va` | WDPR_NonDisney_Add_Ons_VA |

## Architecture

```
Guest → Non-Disney Addons SPA (Angular) → Non-Disney Addons API (Node.js) → Non-Disney Addons VA (Java/Spring Boot)
                                                                                    ├── Vehicle Rental Provider
                                                                                    ├── Insurance Provider
                                                                                    ├── Ground Transfers Provider
                                                                                    ├── Anaheim Resort Transportation
                                                                                    └── Area Attractions Provider
```

## Downstream Systems

| System | Purpose | Features |
|--------|---------|----------|
| Vehicle Rental Provider | Car rental booking and availability | WDW, DLR, AUL |
| Insurance Provider | Travel Protection Plan quotes and enrollment | WDW, DLR, AUL |
| Ground Transfers Provider | Shuttle/transfer booking | DLR |
| Anaheim Resort Transportation | ART shuttle service | DLR |
| Area Attractions Provider | Third-party attraction tickets | DLR |

## Health Checks (Prod)

| App | WDW | DLR |
|-----|-----|-----|
| SPA | `https://wdw-non-disney-addons-spa.wdprapps.disney.com/healthcheck` | `https://dlr-non-disney-addons-spa.wdprapps.disney.com/healthcheck` |
| API | `https://wdw-non-disney-addons-spa.wdprapps.disney.com/api/v1/healthcheck` | `https://dlr-non-disney-addons-spa.wdprapps.disney.com/api/v1/healthcheck` |
| VA | `https://wdw-non-disney-addons-va.wdprapps.disney.com/non-disney-addons-va/healthcheck` | `https://dlr-non-disney-addons-va.wdprapps.disney.com/non-disney-addons-va/healthcheck` |

## AppDynamics

| Environment | App ID | Link |
|-------------|--------|------|
| Prod (SPA + API + VA) | 1986 | [Dashboard](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1986&dashboardMode=force) |
| Pre-prod (all) | 7692 | [Dashboard](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=7692&dashboardMode=force) |
## Swagger

| Region | URL |
|--------|-----|
| WDW | `https://latest.wdw-non-disney-addons-va.wdprapps.disney.com/non-disney-addons-va/swagger-ui/index.html` |
| DLR | `https://latest.dlr-non-disney-addons-va.wdprapps.disney.com/non-disney-addons-va/swagger-ui/index.html` |

## Splunk

- **Index:** `wdpr-revmgmt`
- **Source filter:**
  - SPA: `source=*non-disney-add-ons-spa*`
  - API: `source=*non-disney-add-ons-api*`
  - VA: `source=*non-disney-add-ons-va*`
- **Regional filtering:**
  - WDW: `source=*east*non-disney-add-ons-va*`
  - DLR: `source=*west*non-disney-add-ons-va*`
- **Dashboard:** [Non-Disney Addons SPA (Prod)](https://splunk.wdprapps.disney.com/en-GB/app/rocket/non_disney_addons_spa?form.field1.earliest=-60m%40m&form.field1.latest=now&form.enviroment=prod)

## Rundeck

| App | Rundeck Project |
|-----|----------------|
| SPA | `wdpr-non-disney-addons-spa_aws` |
| API | `wdpr-non-disney-addons-api_aws` |
| VA | `wdpr-non-disney-addons-va_aws` |

## AWS

| Env | Account | Region |
|-----|---------|--------|
| Prod | `wdpr-revmgmt-prod` (194604128027) | us-east-1 (WDW), us-west-2 (DLR) |
| Load | `wdpr-revmgmt-test` (758703792328) | us-east-1 (WDW), us-west-2 (DLR) |
| Latest | `wdpr-revmgmt-dev` (722059247410) | us-east-1 (WDW), us-west-2 (DLR) |

## Jira

- **Project:** ROS
- **Board:** [Star Lord Board](https://disneyexperiences.atlassian.net/jira/software/boards/10955)
- **Board ID:** 10955
- **Instance:** disneyexperiences.atlassian.net
