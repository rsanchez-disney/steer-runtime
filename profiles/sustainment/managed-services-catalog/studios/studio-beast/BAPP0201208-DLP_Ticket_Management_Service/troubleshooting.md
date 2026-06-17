# Troubleshooting — DLP Ticket Management Service

## Common Issues

### Issue: TMS cluster failure — ticket display and linking impacted

**Symptoms:** Guests cannot see tickets or link/unlink entitlements. Operations failing: Link Entitlements, Get Guest Tickets, Get Tickets, Unlike Entitlements.

**Root Cause:** TMS ECS service down or degraded. Could be caused by Galaxy Database issues.

**Resolution:** Check TMS health endpoint. Verify ECS service `tms-ticket-management-service-provider-prod-live` in cluster `dlp-apps-S0001479-euw1-prd`. Check Splunk dashboard "DLP - Tickets Management Service Provider". If Galaxy-related, check eGalaxy URLs.

---

### Issue: eGalaxy Database slow responses (>30 seconds)

**Symptoms:** TMS responding slowly, timeouts on ticket operations.

**Root Cause:** Galaxy Database performance degradation on dedicated TMS servers.

**Resolution:** Check AppDynamics `DLP_PROD_GALAXY_SQL51_GENIE` (primary) and `DLP_PROD_GALAXY_SQL53_GENIE` (secondary/failover). Use Splunk query to get Conversation IDs for eGalaxy responses >30s. Galaxy index: `index=wdpr_egalaxy_dlp`. Escalate to Galaxy/infrastructure team.

---

### Issue: Ticket Preloader batch failure

**Symptoms:** Guests not receiving entitlement notifications for the day. No preload data after 6:00 AM.

**Root Cause:** Preloader cannot connect to eGalaxy database (on-prem), or TMS notification endpoint unavailable.

**Resolution:** Check Splunk Preloader dashboard. Verify eGalaxy connectivity from on-prem. Verify TMS endpoint `/ticket-management-service/v2/entitlements/{visualId}/notification` is responding. Note: Preloader is on-prem, NOT AWS.

---

### Issue: EPS product information unavailable

**Symptoms:** Guests lose access to product information. Product-ticket association failing.

**Root Cause:** EPS endpoint down or database connectivity issue.

**Resolution:** Check EPS health. Verify ECS cluster `dlp-apps-S0001479-euw1-prd`. Check MariaDB `dlp-tms-mariadb-prod` health.

---

### Issue: MariaDB connectivity issues

**Symptoms:** TMS operations failing, data not persisting.

**Root Cause:** RDS MariaDB instance `dlp-tms-mariadb-prod` degradation.

**Resolution:** Check RDS health in AWS Console. Verify connectivity from ECS tasks.

---

## Escalation Decision Tree

- If Galaxy Database issue → escalate to Galaxy/infrastructure team (check SQL51/SQL53)
- If ECS/infrastructure issue → Cloud OPS
- If application logic → Luigi Squad (app-frdlp-guestprofile)
- If Preloader on-prem issue → on-prem infrastructure team
- If MariaDB/RDS issue → Cloud OPS

## Known Quirks

- Ticket Preloader is deployed ON-PREM (not AWS)
- Preloader runs daily at 6:00 AM
- Galaxy has dedicated servers for TMS (SQL51 write, SQL53 read/failover)
- TMS PROD runs 10 tasks, Load runs 5, Stage/Latest run 2
- Kinesis stream has 1 provisioned shard
