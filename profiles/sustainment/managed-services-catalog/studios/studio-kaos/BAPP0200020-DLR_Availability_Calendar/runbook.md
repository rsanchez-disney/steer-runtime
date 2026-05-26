# Runbook — DLR Availability Calendar

## Restart Procedures

1. TBD — no documentation found in Confluence
2. TBD — no documentation found in Confluence

**Validation:** TBD — no documentation found in Confluence

**Reference:** https://confluence.disney.com/display/WDPROS/Availability+Calendar+-+UI+-+DLR

---

## Scaling

- **Type:** S3-hosted SPA + Lambda backend — auto-scales with invocations
- **No manual scaling required** — CloudFront + Lambda handle concurrency automatically
- **Reserved concurrency:** TBD — check Lambda function configuration
- **Region:** us-west-2

### Lambda Functions per Environment

| Environment | Account | Function Prefix |
|-------------|---------|-----------------|
| Production  | 820987038150 (wdpr-ecommerce-prod) | avlcal-usw2-prd-avlcal-dlr-* |
| Stage       | 168997411205 (wdpr-ecommerce-test) | avlcal-usw2-stg-avlcal-dlr-* |
| Load        | 168997411205 (wdpr-ecommerce-test) | avlcal-usw2-lod-avlcal-dlr-* |
| Latest      | 718439781381 (wdpr-ecommerce-dev)  | avlcal-usw2-lst-avlcal-dlr-* |

**Lambda functions (per env):** calendar, config, page-key-data, status, translate

## Failover

- TBD — no documentation found in Confluence

## Rollback

- TBD — no documentation found in Confluence

## Health Check

| Environment | URL |
|-------------|-----|
| Production  | `https://origin.avlcal-dlr-v2.wdprapps.disney.com/api/status` |
| Stage       | `https://stage.origin.avlcal-dlr-v2.wdprapps.disney.com/api/status` |
| Load        | `https://load.origin.avlcal-dlr-v2.wdprapps.disney.com/api/status` |
| Latest      | `https://latest.origin.avlcal-dlr-v2.wdprapps.disney.com/api/status` |

**Path:** `/status`
**Expected:** HTTP 200

## Monitoring

### Splunk

- **Index:** dlr_avail_cal
- **Dashboard:** TBD — no documentation found in Confluence
- **Example query:** `index=dlr_avail_cal`

### AppDynamics

- **App:** TBD — no documentation found in Confluence

## Deployment

- **Brand:** DLR
- **Region:** us-west-2
- **Documentation:** https://confluence.disney.com/pages/viewpage.action?pageId=544735438

### Repositories

| Component | Repository |
|-----------|-----------|
| SPA | https://gitlab.disney.com/cgs-wdw/avlcal-dlr/avlcal-dlr-spa |
| Lambda | https://gitlab.disney.com/cgs-wdw/avlcal-dlr/avlcal-dlr-lambda |
| Terraform | https://gitlab.disney.com/cgs-wdw/avlcal-dlr/avlcal-dlr-lambda-terraform |
| UI Components | https://github.disney.com/dprd-web-components-tickets/com-dlr-avl-cal-ui-components |

### Pipelines

| Component | Tool | Pipeline URL |
|-----------|------|-------------|
| SPA | GitLab | https://gitlab.disney.com/cgs-wdw/avlcal-dlr/avlcal-dlr-spa/-/pipelines |
| Lambda | GitLab | https://gitlab.disney.com/cgs-wdw/avlcal-dlr/avlcal-dlr-lambda/-/pipelines |
| Terraform | GitLab | https://gitlab.disney.com/cgs-wdw/avlcal-dlr/avlcal-dlr-lambda-terraform/-/pipelines |
| UI Components | Jenkins | https://ra.cicd.wdprapps.disney.com/job/WEB-COMPONENTS/job/dprd-web-components-tickets/job/com-dlr-avl-cal-ui-components/ |

## Configuration

- **Config Manager:** TBD — no documentation found in Confluence
- **Toggles:** TBD — no documentation found in Confluence

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| TBD | TBD | TBD |
