# Runbook — WDPRD Dory For Tickets

## Restart Procedures

1. TBD — no documentation found in Confluence
2. TBD — no documentation found in Confluence

**Validation:** TBD — no documentation found in Confluence

**Reference:** <https://confluence.disney.com/spaces/WDPROS/pages/1872850834/Dory+For+Tickets+-+Runbook>

---

## Health Check

| Environment | URL |
|-------------|-----|
| Production  | `https://doryfortickets.wdprapps.disney.com/dory-for-tickets/healthcheck` |
| Stage       | `https://stage.doryfortickets.wdprapps.disney.com/dory-for-tickets/healthcheck` |
| Load        | `https://load.doryfortickets.wdprapps.disney.com/dory-for-tickets/healthcheck` |
| Latest      | `https://latest.doryfortickets.wdprapps.disney.com/dory-for-tickets/healthcheck` |

**Path:** `/dory-for-tickets/healthcheck`
**Expected:** HTTP 200

---

## Scaling

- **AWS Account:** 820987038150 (wdpr-ecommerce-prod)
- **Cluster:** wdpr-ecommerce-S0001323-usw2-prd
- **Service:** doryfortickets-api-prod-live
- **Launch type:** EC2
- **Infra type:** ECS
- **Region:** us-west-2

### Service Names per Environment

| Environment | Account | Cluster | Service |
|-------------|---------|---------|---------|
| Production  | 820987038150 (wdpr-ecommerce-prod) | wdpr-ecommerce-S0001323-usw2-prd | doryfortickets-api-prod-live   |
| Stage       | 168997411205 (wdpr-ecommerce-test) | wdpr-ecommerce-S0001323-usw2-stg | doryfortickets-api-stage-live  |
| Load        | 168997411205 (wdpr-ecommerce-test) | wdpr-ecommerce-S0001323-usw2-lod | doryfortickets-api-load-live   |
| Latest      | 718439781381 (wdpr-ecommerce-dev)  | wdpr-ecommerce-S0001323-usw2-lst | doryfortickets-api-latest-live |

**Scale manually (prod):**

```bash
aws ecs update-service --cluster wdpr-ecommerce-S0001323-usw2-prd --service doryfortickets-api-prod-live --desired-count <N> --region us-west-2
```

## Failover

- TBD — no documentation found in Confluence

## Rollback

- TBD — no documentation found in Confluence

## Monitoring

### Splunk

- **Index:** wdpr_dory_for_tickets
- **Dashboard:** [dory_for_tickets](https://wdpr-splunk-prod.wdprapps.disney.com/en-US/app/launcher/dory_for_tickets)
- **Example query:** `index=wdpr_dory_for_tickets`
- **Error query:** `index=wdpr_dory_for_tickets level=ERROR`

### AppDynamics

- **Production:** [App 515 / Component 306832](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=515&component=306832&dashboardMode=force)
- **Load:** [App 2983 / Component 7462060](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=2983&component=7462060&dashboardMode=force)

### CloudWatch

- **Dashboard:** [PACE-DLR-wdpr-ecommerce-S0001323-usw2-prd-Ver5](https://us-west-2.console.aws.amazon.com/cloudwatch/home?region=us-west-2#dashboards:name=PACE-DLR-wdpr-ecommerce-S0001323-usw2-prd-Ver5)

## Deployment

- **Pipeline:** Harness
- **Pipeline URL:** https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/module/ci/orgs/Commerce/projects/WDPRD_Dory_For_Tickets/pipelines
- **Repository:** https://github.disney.com/commerce/wdpr-ecommerce-doryfortickets-api
- **Brand:** DLR/WDW
- **Region:** us-west-2

## Configuration

- **Config Manager:** TBD — no documentation found in Confluence
- **Toggles:** TBD — no documentation found in Confluence

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| TBD | TBD | TBD |
