# Runbook — DLP OLCI

## Restart Procedures

1. Identify the failing component (PMS Registration Form Provider, Business Event Processor, or DocuSign Purge Processor)
2. Force new deployment via Harness or restart ECS tasks via AWS Console
3. Cluster: `dlp-apps-S0001481-euw1-prd`

**Validation:**
- PMS Registration Form Provider: https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-lodging-pms-registration-form-provider/healthcheck/deep
- OLCI Business Event Processor: https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-lodging-ooc-olci-business-event-processor/healthcheck/deep
- Verify no errors in Splunk functional dashboard

---

## Health Check URLs

### PMS Registration Form Provider

| Environment | Health Check | Deep Health Check |
|-------------|-------------|-------------------|
| Prod | https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-lodging-pms-registration-form-provider/healthcheck | /healthcheck/deep |
| Stage | https://stage.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-lodging-pms-registration-form-provider/healthcheck | /healthcheck/deep |
| Load | https://load.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-lodging-pms-registration-form-provider/healthcheck | /healthcheck/deep |
| Latest | https://latest.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-lodging-pms-registration-form-provider/healthcheck | /healthcheck/deep |

### OLCI Business Event Processor

| Environment | Health Check | Deep Health Check |
|-------------|-------------|-------------------|
| Prod | https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-lodging-ooc-olci-business-event-processor/healthcheck | /healthcheck/deep |
| Stage | https://stage.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-lodging-ooc-olci-business-event-processor/healthcheck | /healthcheck/deep |
| Load | https://load.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-lodging-ooc-olci-business-event-processor/healthcheck | /healthcheck/deep |
| Latest | https://latest.dlpis-digital.wdprapps.disney.com/wdpr-dlp-is-lodging-ooc-olci-business-event-processor/healthcheck | /healthcheck/deep |

---

## Scaling

- **Scale up:** Increase ECS desired count via AWS Console for the affected service on cluster `dlp-apps-S0001481-euw1-prd`
- **Scale down:** Decrease ECS desired count back to normal

## Failover

- Single-region deployment (eu-west-1) — no multi-region failover
- ECS will automatically replace unhealthy tasks
- If Business Event Processor is down, PMS Registration Form Provider can still get reservations directly from Opera

## Rollback

- Redeploy previous artifact version via Harness
- Verify via health check after rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Hotels OHIP | #dlp-hotels-ohip (Slack) | Opera PMS integration issues |
| DocuSign | External vendor | Envelope/signature service issues |
| Opera PMS | Hotels team | Reservation data issues |
