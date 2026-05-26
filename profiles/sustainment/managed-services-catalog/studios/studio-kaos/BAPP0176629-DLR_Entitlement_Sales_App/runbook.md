# Runbook — DLR Entitlement Sales App

## Restart Procedures

1. TBD

**Validation:** DLR Tickets Flow

---

## Scaling

- **Type:** Lambda (serverless) — auto-scales with invocations
- **No manual scaling required** — AWS Lambda handles concurrency automatically
- **Reserved concurrency:** TBD — check Lambda function configuration
- **Region:** us-west-2

### Lambda Functions per Environment

| Environment | Account | Function Prefix |
|-------------|---------|-----------------|
| Production  | 820987038150 (wdpr-ecommerce-prod) | tcktsalesspadlr-usw2-prd-dlr-tix-sales-* |
| Stage       | 168997411205 (wdpr-ecommerce-test) | tcktsalesspadlr-usw2-stg-dlr-tix-sales-* |
| Load        | 168997411205 (wdpr-ecommerce-test) | tcktsalesspadlr-usw2-lod-dlr-tix-sales-* |
| Latest      | 718439781381 (wdpr-ecommerce-dev)  | tcktsalesspadlr-usw2-lst-dlr-tix-sales-* |

**Lambda functions (per env):** dp-addons-and-extras, dp-calendar, dp-products, dp-relationships, healthcheck, lexvas-affiliation-ids, lexvas-product-listing, lexvas-product-types, lexvas-product-types-v2, lexvas-relationships, page-key, products, special-events

## Failover

- N/A — no redundant spa or lambda for failover 

## Rollback

- TBD — no documentation found in Confluence

## Health Check

| Environment | URL |
|-------------|-----|
| Production  | `https://origin.dlr-tix-sales-dlr.wdprapps.disney.com/api/healthcheck` |
| Stage       | `https://stage.origin.dlr-tix-sales-dlr.wdprapps.disney.com/api/healthcheck` |
| Load        | `https://load.origin.dlr-tix-sales-dlr.wdprapps.disney.com/api/healthcheck` |
| Latest      | `https://latest.origin.dlr-tix-sales-dlr.wdprapps.disney.com/api/healthcheck` |

**Path:** `/healthcheck`
**Expected:** HTTP 200

## Monitoring

### Splunk

- **Index:** wdpr_dlr_tixsales_api (Lambda), wdpr_dlr_com_shared_api (SPA, AppSource: dlr-tix-spa)
- **Dashboard:** [Sales SPA](https://splunk.wdprapps.disney.com/en-US/app/launcher/dlr_cme_sales_spa_dashboard?form.timeRange.earliest=-60m%40m&form.timeRange.latest=now&form.conv_id=*)
- **Example query (SPA):** `index=wdpr_dlr_com_shared_api | rex "\"AppSource\":\"(?<AppSource>[^\"]+)\"" | where AppSource="dlr-tix-spa"`

### AppDynamics

- **App:** [prod_DLR_Tix_Sales_EUM (ID: 1025)](https://disney-prod.saas.appdynamics.com/controller/#/location=EUM_WEB_MAIN_DASHBOARD&application=1025)

## Deployment

- **Brand:** DLR
- **Region:** us-west-2
- **Release process:** https://gitlab.disney.com/cgs-wdw/tixcart/dlr-tix-sales-spa/-/wikis/Release-Process
- **Hotfix:** https://gitlab.disney.com/cgs-wdw/tixcart/dlr-tix-sales-spa/-/wikis/Hotfix
- **AWS S3 SPA:** cgssre-wdpr-ecommerce-dev-usw2-spa
- **AWS S3 Lambda:** cgssre-wdpr-ecommerce-dev-usw2-lambda (prefix: tcktsalesspadlr/)

### Repositories

| Component | Repository |
|-----------|-----------|
| SPA | https://gitlab.disney.com/cgs-wdw/tixcart/dlr-tix-sales-spa |
| Lambda (repo) | https://gitlab.disney.com/cgs-wdw/tixcart/dlr-tix-sales-lambda/repo |
| Lambda (infra) | https://gitlab.disney.com/cgs-wdw/tixcart/dlr-tix-sales-lambda/infra |
| UI Components | https://github.disney.com/dprd-web-components-tickets/com-dlr-tix-sales-ui-components |

### Pipelines

| Component | Tool | Pipeline URL |
|-----------|------|-------------|
| SPA | GitLab | https://gitlab.disney.com/cgs-wdw/tixcart/dlr-tix-sales-spa/-/pipelines |
| Lambda (repo) | GitLab | https://gitlab.disney.com/cgs-wdw/tixcart/dlr-tix-sales-lambda/repo/-/pipelines |
| Lambda (infra) | GitLab | https://gitlab.disney.com/cgs-wdw/tixcart/dlr-tix-sales-lambda/infra/-/pipelines |
| UI Components | Jenkins | https://ra.cicd.wdprapps.disney.com/job/WEB-COMPONENTS/job/dprd-web-components-tickets/job/com-dlr-tix-sales-ui-components/ |

## Configuration

- **Config Manager:** TBD — no documentation found in Confluence
- **Toggles:** TBD — no documentation found in Confluence

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| TBD | TBD | TBD |
