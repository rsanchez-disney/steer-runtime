# Runbook — DLP DGE API.BIO Services

## Health Check URLs

### BIO Schedules Provider

| Environment | Health Check | Deep Health Check |
|-------------|-------------|-------------------|
| Prod | Available | Available |
| Stage | Available | Available |
| Load | Available | Available |
| Latest | Available | Available |

### BIO Wait Times Provider

| Environment | Health Check | Deep Health Check |
|-------------|-------------|-------------------|
| Prod | Available | Available |
| Stage | Available | Available |
| Load | Available | Available |
| Latest | Failing (intentionally disabled) | Failing (intentionally disabled) |

### BIO Attractions Downtime Publisher

| Environment | Health Check | Deep Health Check |
|-------------|-------------|-------------------|
| Prod | Available | Available |
| Stage | Available | https://dlp-microservice-stage.emea.wdpr.disney.com:8443/WDPR-DLP-IS/wdpr-dlp-is-operations-bio-attractions-downtime-publisher/healthcheck/deep |
| Load | Available | Available |
| Latest | Failing (intentionally disabled) | Failing (intentionally disabled) |

**Healthcheck Manager:** https://stage.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-devops-mobileapp-healthcheck-manager/health-ui

---

## Health Check Verification (per APP-36902)

1. **Verify the Service Started Correctly** — Confirm no errors in AppDynamics
2. **Check the Deep Healthcheck Endpoint** — Access deep healthcheck URL
3. **Verify the Cron Job Status** (Downtime Publisher only) — Check Splunk logs for cron job start, verify events pulled to target URL

---

## Monitoring Dashboards

### Splunk
| Service | Dashboard |
|---------|-----------|
| Schedules | wdpr-dlp-is-operations-bio-schedules-park-provider |
| Wait Times | wdpr-dlp-is-operations-bio-wait-times-provider |
| Downtime | wdpr-dlp-is-operations-bio-attractions-downtime-publisher |

### AppDynamics (PROD)
| Service | Dashboards |
|---------|-----------|
| Schedules | PROD_DLP_PAAP_wdpr-dlp-is-operations-bio-schedules-park-provider |
| Wait Times | PROD_DLP_PAAP_wdpr-dlp-is-operations-bio-wait-times-provider |
| Downtime | PROD_DLP_PAAP_wdpr-dlp-is-operations-bio-attractions-downtime-publisher |
| Database | DLP_PROD_BIO_GENIE |

### Grafana
- DLP Digital - PROD - Mobile Back-End API Gateway Global Dashboard

### CloudWatch (Wait Times)
| Environment | Dashboard |
|-------------|-----------|
| Prod | dlp-apps-B090262-euw1-prd-waitime |
| Stage | dlp-apps-B090262-euw1-stg-waitime |
| Load | dlp-apps-B090262-euw1-lod-waitime |

### CloudWatch (Schedules)
| Environment | Dashboard |
|-------------|-----------|
| Prod | dlp-apps-B0215510-euw1-prd-schedules-provider |
| Stage | dlp-apps-B0215510-euw1-stg-schedules-provider |
| Load | dlp-apps-B0215510-euw1-lod-schedules-provider |

---

## Restart Procedures

1. These services are hosted on-prem in DLP Genie Datacenter (NOT ECS)
2. Restart via on-prem service management
3. For Downtime Publisher: verify cron job restarts after service restart

**Validation:** Check health endpoints and Splunk dashboards for traffic recovery.

---

## Scaling

- **Note:** On-prem hosted — scaling requires coordination with DLP Genie Datacenter ops

## Failover

- Individual services are independent — one can fail without affecting the others
- BIO Database is shared — if it fails, all three services are affected

## Rollback

- Use Harness pipeline: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/module/ci/orgs/Disneyland_Paris/projects/DLP_DGE_API_BIO_Services/overview

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| BIO Database | DLP.DL-IS.GUESTOLOGY@disney.com | Database connectivity issues |
| BIO GUI Admin | DLP.DL-IS.GUESTOLOGY@disney.com | Data content issues |
| EA System (Orion) | Orion Services team | Downtime Publisher event source issues |
| DLP Genie Datacenter | Infrastructure ops | On-prem hosting issues |
