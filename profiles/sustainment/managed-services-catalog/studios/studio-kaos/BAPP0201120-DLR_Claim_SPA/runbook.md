# Runbook — DLR Claim SPA

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
| Production  | 820987038150 (wdpr-ecommerce-prod) | clmspa-usw2-prd-clmspadlr-* |
| Stage       | 168997411205 (wdpr-ecommerce-test) | clmspa-usw2-stg-clmspadlr-* |
| Load        | 168997411205 (wdpr-ecommerce-test) | clmspa-usw2-lod-clmspadlr-* |
| Latest      | 718439781381 (wdpr-ecommerce-dev)  | clmspa-usw2-lst-clmspadlr-* |

## Failover

- TBD — no documentation found in Confluence

## Rollback

- TBD — no documentation found in Confluence

## Health Check

| Environment | URL |
|-------------|-----|
| Production  | `https://origin.clmspadlr-v2.wdprapps.disney.com/api/status` |
| Stage       | `https://stage.origin.clmspadlr-v2.wdprapps.disney.com/api/status` |
| Load        | `https://load.origin.clmspadlr-v2.wdprapps.disney.com/api/status` |
| Latest      | `https://latest.origin.clmspadlr-v2.wdprapps.disney.com/api/status` |

**Path:** `/status`
**Expected:** HTTP 200

## Monitoring

### Splunk

- **Index:** dlr_claim_spa
- **Dashboard:** <https://splunk.wdprapps.disney.com/en-US/app/launcher/studio_kaos__dlr_claim_spa>
- **Example query:** `index=dlr_claim_spa`
- **CloudWatch log groups:**
  - `clmspa-usw2-lst-clmspadlr` (latest)
  - `clmspa-usw2-stg-clmspadlr` (stage)
  - `clmspa-usw2-lod-clmspadlr` (load)
  - `clmspa-usw2-prd-clmspa` (prod)
- **Lambda sources:** clmspa-usw2-prd-clmspadlr-config, -link, -page-key-data, -status, -translate, -validate, -validate-dirty-words

### AppDynamics

- **App:** [prod_Claims_SPA_EUM (ID: 1044)](https://disney-prod.saas.appdynamics.com/controller/#/location=EUM_WEB_MAIN_DASHBOARD&application=1044)

## Deployment

- **Brand:** DLR
- **Region:** us-west-2
- **Release/Hotfix:** https://confluence.disney.com/pages/viewpage.action?spaceKey=WDWSRE&title=SPA+Repository

### Repositories

| Component | Repository |
|-----------|-----------|
| SPA | https://gitlab.disney.com/cgs-wdw/clmspadlr/clmspadlr-spa |
| Lambda | https://gitlab.disney.com/cgs-wdw/clmspadlr/clmspadlr-lambda |
| Terraform | https://gitlab.disney.com/cgs-wdw/clmspadlr/clmspadlr-lambda-terraform |

### Pipelines

| Component | Tool | Pipeline URL |
|-----------|------|-------------|
| SPA | GitLab | https://gitlab.disney.com/cgs-wdw/clmspadlr/clmspadlr-spa/-/pipelines |
| Lambda | GitLab | https://gitlab.disney.com/cgs-wdw/clmspadlr/clmspadlr-lambda/-/pipelines |
| Terraform | GitLab | https://gitlab.disney.com/cgs-wdw/clmspadlr/clmspadlr-lambda-terraform/-/pipelines |

## Configuration

- **Config Manager:** claim-spa-lambda-config (model), claim-spa-lambda-config (instance)
- **Toggles:** TBD — no documentation found in Confluence

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| TBD | TBD | TBD |
