# Troubleshooting — DLP DGE API.BIO Services

## Common Issues

### Issue: BIO Database connectivity intermittence

**Symptoms:** All three BIO services experience timeouts or errors. AppDynamics shows database connection failures on DLP_PROD_BIO_GENIE dashboard.

**Root Cause:** Occasional connectivity intermittence with the BIO database (on-prem DLP Genie Datacenter).

**Resolution:** Check BIO Database health. If persistent, escalate to BIO/Guestology team (DLP.DL-IS.GUESTOLOGY@disney.com). Monitor AppDynamics DLP_PROD_BIO_GENIE dashboard.

---

### Issue: Wait Times not updating (V1 or V2)

**Symptoms:** Guests see stale or no wait times for attractions. Splunk dashboard shows no recent data.

**Root Cause:** BIO Wait Times Provider may have lost connection to BIO Database, or the service is down.

**Resolution:** Check health endpoint. Verify Splunk dashboard `wdpr-dlp-is-operations-bio-wait-times-provider`. Check AppDynamics `operations_bio_wait_times_provider`. If database issue, escalate to BIO team.

---

### Issue: Schedules not displaying correctly

**Symptoms:** Guests see incorrect or missing opening hours for parks/activities.

**Root Cause:** BIO Schedules Provider connectivity issue or stale data in BIO Database.

**Resolution:** Check health endpoint. Verify Splunk dashboard `wdpr-dlp-is-operations-bio-schedules-park-provider`. Check if BIO GUI Admin has correct data entered.

---

### Issue: Downtime Publisher cron job not running

**Symptoms:** Attraction downtime status not updating. Guests not informed about closed attractions.

**Root Cause:** Cron job failed to start or cannot reach EA System (Orion Services).

**Resolution:** Check Splunk logs for cron job status. Verify events are being pulled to target URL. Check AppDynamics `operations_bio-attractions-downtime-publisher`. If EA System issue, escalate to Orion Services team.

---

### Issue: Health check failing in Latest environment

**Symptoms:** Health check returns failure for Latest environment.

**Root Cause:** Service is intentionally disabled in Latest environment.

**Resolution:** This is expected behavior. No action needed.

---

## Escalation Decision Tree

- If BIO Database connectivity issue → escalate to BIO/Guestology (DLP.DL-IS.GUESTOLOGY@disney.com)
- If EA System / Orion issue (downtime publisher) → escalate to Orion Services team
- If infrastructure / on-prem issue → escalate to DLP Genie Datacenter ops
- If application logic issue → Storm Squad (app-frdlp-attraction-dge)
- If data content issue (wrong schedules/times) → check BIO GUI Admin, escalate to BIO team

## Known Quirks

- All services hosted on-prem in DLP Genie Datacenter (NOT ECS)
- Health check intentionally failing in Latest environment
- BIO Attractions Downtime Publisher is organizationally part of DPA ONE BAPP despite being in this BAPP
- Wait Times V2 only applies to DPA guests
