# Runbook — DLR Park Access Hub

## Restart Procedures

1. TBD — no documentation found in Confluence
2. TBD — no documentation found in Confluence

**Validation:** TBD — no documentation found in Confluence

**Reference:** https://confluence.disney.com/pages/viewpage.action?pageId=613311178

---

## Scaling

- **Type:** Lambda (serverless) — auto-scales with invocations
- **No manual scaling required** — AWS Lambda handles concurrency automatically
- **Reserved concurrency:** TBD — check Lambda function configuration
- **Region:** us-west-2

### Lambda Functions per Environment

| Environment | Account | Function Prefix |
|-------------|---------|-----------------|
| Production  | 820987038150 (wdpr-ecommerce-prod) | dlrpah-usw2-prd-prk-ac-hub-* |
| Stage       | 168997411205 (wdpr-ecommerce-test) | dlrpah-usw2-stg-prk-ac-hub-* |
| Load        | 168997411205 (wdpr-ecommerce-test) | dlrpah-usw2-lod-prk-ac-hub-* |
| Latest      | 718439781381 (wdpr-ecommerce-dev)  | dlrpah-usw2-lst-prk-ac-hub-* |

**Lambda functions (per env):** config, order-and-reservations, status

## Failover

- TBD — no documentation found in Confluence

## Rollback

- TBD — no documentation found in Confluence

## Health Check

| Environment | URL |
|-------------|-----|
| Production  | `https://origin.prk-ac-hub-dlr.wdprapps.disney.com/api/status` |
| Stage       | `https://stage.origin.prk-ac-hub-dlr.wdprapps.disney.com/api/status` |
| Load        | `https://load.origin.prk-ac-hub-dlr.wdprapps.disney.com/api/status` |
| Latest      | `https://latest.origin.prk-ac-hub-dlr.wdprapps.disney.com/api/status` |

**Path:** `/status`
**Expected:** HTTP 200

## Monitoring

### Splunk

- **Index:** dlr_park_access_hub (also wdpr_dlr_com_shared_api with AppSource: prk-ac-hub-spa)
- **Dashboard:** TBD — no documentation found in Confluence
- **Example query:** `index=dlr_park_access_hub`
- **SPA query:** `index=wdpr_dlr_com_shared_api prk-ac-hub-spa`

### AppDynamics

- **App:** TBD — no documentation found in Confluence

## Deployment

- **Brand:** DLR
- **Region:** us-west-2

### Repositories

| Component | Repository |
|-----------|-----------|
| SPA | https://gitlab.disney.com/cgs-wdw/prk-ac-hub/prk-ac-hub-spa |
| Lambda | https://gitlab.disney.com/cgs-wdw/prk-ac-hub/prk-ac-hub-lambda |
| Terraform | https://gitlab.disney.com/cgs-wdw/prk-ac-hub/prk-ac-hub-lambda-terraform |
| UI Components | https://github.disney.com/dprd-web-components-tickets/prk-ac-hub-ui-components |

### Pipelines

| Component | Tool | Pipeline URL |
|-----------|------|-------------|
| SPA | GitLab | https://gitlab.disney.com/cgs-wdw/prk-ac-hub/prk-ac-hub-spa/-/pipelines |
| Lambda | GitLab | https://gitlab.disney.com/cgs-wdw/prk-ac-hub/prk-ac-hub-lambda/-/pipelines |
| Terraform | GitLab | https://gitlab.disney.com/cgs-wdw/prk-ac-hub/prk-ac-hub-lambda-terraform/-/pipelines |
| UI Components | Jenkins | https://ra.cicd.wdprapps.disney.com/job/WEB-COMPONENTS/job/dprd-web-components-tickets/job/prk-ac-hub-ui-components/ |

## Configuration

- **Config Manager:** TBD — no documentation found in Confluence
- **Toggles:** TBD — no documentation found in Confluence

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| TBD | TBD | TBD |
