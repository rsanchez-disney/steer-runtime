# Runbook — WDPRD Commerce UI Shared API

## Restart Procedures

1. TBD — no documentation found in Confluence
2. TBD — no documentation found in Confluence

**Validation:** TBD — no documentation found in Confluence

---

## Scaling

- **Type:** Lambda (serverless) — auto-scales with invocations
- **No manual scaling required** — AWS Lambda handles concurrency automatically
- **Reserved concurrency:** TBD — check Lambda function configuration
- **Region:** us-west-2

### Lambda Functions per Environment

| Environment | Account | Function Prefix |
|-------------|---------|-----------------|
| Production  | 820987038150 (wdpr-ecommerce-prod) | comuiapi-usw2-prd-com-ui-api-* |
| Stage       | 168997411205 (wdpr-ecommerce-test) | comuiapi-usw2-stg-com-ui-api-* |
| Load        | 168997411205 (wdpr-ecommerce-test) | comuiapi-usw2-lod-com-ui-api-* |
| Latest      | 718439781381 (wdpr-ecommerce-dev)  | comuiapi-usw2-lst-com-ui-api-* |

**Lambda functions (per env):** content, file-access, get-app-config, get-profile, get-pub-config, get-store, get-token, healthcheck, ui-log

## Failover

- TBD — no documentation found in Confluence

## Rollback

- TBD — no documentation found in Confluence

## Health Check

| Environment | URL |
|-------------|-----|
| Production  | `https://origin.com-ui-api-dlr.wdprapps.disney.com/api/healthcheck` |
| Stage       | `https://stage.origin.com-ui-api-dlr.wdprapps.disney.com/api/healthcheck` |
| Load        | `https://load.origin.com-ui-api-dlr.wdprapps.disney.com/api/healthcheck` |
| Latest      | `https://latest.origin.com-ui-api-dlr.wdprapps.disney.com/api/healthcheck` |

**Path:** `/healthcheck`
**Expected:** HTTP 200

## Monitoring

### Splunk

- **Index:** wdpr_dlr_com_shared_api
- **Dashboard:** TBD — no documentation found in Confluence
- **Example query:** `index=wdpr_dlr_com_shared_api`

**Note:** This is a shared Lambda API used by multiple SPAs (Bolt, Claim, Park Access Hub, Tix Sales, Tix Mods).

### AppDynamics

- **App:** TBD — no documentation found in Confluence

## Deployment

- **Brand:** DLR/WDW
- **Region:** us-west-2

### Repositories

| Component | Repository |
|-----------|-----------|
| Lambda | https://gitlab.disney.com/cgs-wdw/com-ui-api/com-ui-api-lambda |
| Terraform | https://gitlab.disney.com/cgs-wdw/com-ui-api/com-ui-api-lambda-terraform |

### Pipelines

| Component | Tool | Pipeline URL |
|-----------|------|-------------|
| Lambda | GitLab | https://gitlab.disney.com/cgs-wdw/com-ui-api/com-ui-api-lambda/-/pipelines |
| Terraform | GitLab | https://gitlab.disney.com/cgs-wdw/com-ui-api/com-ui-api-lambda-terraform/-/pipelines |

## Configuration

- **Config Manager:** TBD — no documentation found in Confluence
- **Toggles:** TBD — no documentation found in Confluence

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| TBD | TBD | TBD |
