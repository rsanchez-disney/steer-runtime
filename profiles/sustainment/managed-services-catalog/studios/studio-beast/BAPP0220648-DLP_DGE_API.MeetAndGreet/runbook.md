# Runbook — DLP DGE API.MeetAndGreet

## Restart Procedures

1. Go to Rundeck: https://rundeck.wdprapps.disney.com/project/wdpr-dlp-is-sales-srv-meet-and-greet-provider_aws/activity
2. Execute restart job for the target environment
3. Alternatively, force new deployment via Harness: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Disneyland_Paris/projects/DLP_DGE_API_MeetAndGreet/overview

**Validation:**
- Check health check returns 200: https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-sales-srv-meet-and-greet-provider/healthcheck
- Check deep health check: https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-sales-srv-meet-and-greet-provider/healthcheck/deep
- Verify no errors in Splunk dashboard

---

## Health Check URLs

| Environment | Health Check | Deep Health Check |
|-------------|-------------|-------------------|
| Prod | https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-sales-srv-meet-and-greet-provider/healthcheck | https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-sales-srv-meet-and-greet-provider/healthcheck/deep |
| Stage | https://stage.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-sales-srv-meet-and-greet-provider/healthcheck | https://stage.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-sales-srv-meet-and-greet-provider/healthcheck/deep |
| Load | https://load.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-sales-srv-meet-and-greet-provider/healthcheck | https://load.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-sales-srv-meet-and-greet-provider/healthcheck/deep |
| Latest | https://latest.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-sales-srv-meet-and-greet-provider/healthcheck | https://latest.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-sales-srv-meet-and-greet-provider/healthcheck/deep |

**Healthcheck Manager:** https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-devops-mobileapp-healthcheck-manager/health-ui

---

## Scaling

- **Scale up:** Increase ECS desired count via AWS Console (cluster: dlp-apps-S0001481-euw1-prd, service: srv-meet-and-greet-provider-prod-live)
- **Scale down:** Decrease ECS desired count back to normal

## Failover

- Single-region deployment (eu-west-1) — no multi-region failover
- If service is unhealthy, ECS will automatically replace tasks

## Rollback

- Use Harness to redeploy previous artifact version
- Verify via health check after rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Lineberty | support@lineberty.com / (+33) 09.73.72.33.06 | Booking API outages or degradation |
| Mobile APP | app-frdlp-mobile-apps / DLP.DL-MOBILE.APP.TEAM@disney.com | Mobile app integration issues |
| Guest Extended Profile | Beast team | Profile data issues |
| Keyring | Beast team | Guest identity/portfolio issues |
