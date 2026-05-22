# Runbook — WDPR Commerce Bolt Landing SPA

## Restart Procedures

1. TBD — no documentation found in Confluence
2. TBD — no documentation found in Confluence

**Validation:** TBD — no documentation found in Confluence

---

## Scaling

- **Type:** S3-hosted SPA + Harness-deployed API — auto-scales
- **No manual ECS scaling** — deployed via Harness pipeline
- **Region:** us-west-2

### Lambda Functions per Environment

| Environment | Account | Function Name |
|-------------|---------|---------------|
| Production  | 820987038150 (wdpr-ecommerce-prod) | bolt-landing-api-production-api |
| Stage       | 168997411205 (wdpr-ecommerce-test) | bolt-landing-api-stage-api |
| Load        | 168997411205 (wdpr-ecommerce-test) | bolt-landing-api-load-api |
| Latest      | 718439781381 (wdpr-ecommerce-dev)  | bolt-landing-api-latest-api |

## Failover

- TBD — no documentation found in Confluence

## Rollback

- TBD — no documentation found in Confluence

## Health Check

| Environment | URL |
|-------------|-----|
| Production  | `https://origin.production.bolt-landing.wdprapps.disney.com/` |
| Stage       | `https://origin.stage.bolt-landing.wdprapps.disney.com/` |
| Load        | `https://origin.load.bolt-landing.wdprapps.disney.com/` |
| Latest      | `https://origin.latest.bolt-landing.wdprapps.disney.com/` |

**Note:** Bolt Landing uses a catch-all route (`/{any+}`). No dedicated healthcheck endpoint — use root path.
**Expected:** HTTP 200

## Monitoring

### Splunk

- **Index:** wdpr_bolt (also wdpr_dlr_com_shared_api, filter: BoltLanding)
- **Dashboards:**
  - [Sales Flow (prod)](https://splunk.wdprapps.disney.com/en-US/app/launcher/studio_kaos__dlr_bolt_landing_spa)
  - [UC (prod)](https://splunk.wdprapps.disney.com/en-US/app/launcher/studio_kaos__dlr_bolt_landing_uc_dashboard)
  - [Sales Flow (lowers)](https://stage.splunk.wdprapps.disney.com/en-US/app/launcher/studio_kaos__dlr_bolt_landing_spa_dashboard)
  - [UC (lowers)](https://stage.splunk.wdprapps.disney.com/en-US/app/launcher/studio_kaos__dlr_bolt_landing_uc_dashboard)
- **Example query:** `index=wdpr_bolt`

### AppDynamics

- **App:** TBD — no documentation found in Confluence

## Deployment

- **Pipeline:** Harness
- **Pipeline URL:** https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/Bolt_Landing/pipelines
- **Repository SPA:** https://github.disney.com/commerce/wdpr-ecommerce-bolt-landing-spa
- **Repository API:** https://github.disney.com/commerce/wdpr-ecommerce-bolt-landing-api
- **Brand:** DLR
- **Region:** us-west-2
- **Deploy process:** Merge PR → auto-deploys to latest → manually promote to stage/load/prod via Harness (requires approval per phase)

## Configuration

- **Config Manager:** bolt-landing-spa-app-config-model (model), bolt-landing-app-config (instance)
- **Toggles:** disablePinEntry (default: false) — hides pin entry and shows warning when offer ended

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Bolt Service (Rhino team) | Rhino team | PIN validation issues or Bolt Service outages |
