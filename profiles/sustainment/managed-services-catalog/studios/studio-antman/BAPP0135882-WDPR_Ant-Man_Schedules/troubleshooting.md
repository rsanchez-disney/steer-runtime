# Troubleshooting — WDPR Ant-Man Schedules (Kronos)

## Service Overview

D-Scribe Schedules (Kronos) is a schedule management service (Java 17, Spring Boot) that generates meal period XML and schedule XML files. It publishes schedule data to S3 for downstream consumption. Handles entity types: Facilities, Attractions, Entertainment, Events, MealPeriods, MerchandiseFacilities, FoodBeverageFacilities, GolfCourses, ActivityProducts, Products, Services, and Resorts (ToonFinder).

- **Splunk:** `index=wdpr_d-scribe source="*schedules-prod/*"`
- **Health:** https://d-scribe-schedules.wdprapps.disney.com/information
- **Grafana:** https://grafana.wdprapps.disney.com/d/ddsycmiacwwe8d/gcx-platform-status-dashboard

---

## Common Issues

### Issue: Force Update Endpoints

**Symptoms:** Schedule data is stale or not reflecting recent changes for specific entities.

**Resolution:**
1. Use the force update endpoints to trigger a re-generation of schedule data for the affected entity type
2. Monitor Splunk for processing: `index=wdpr_d-scribe source="*schedules-prod/*" "forceUpdate"`
3. Verify updated XML appears in S3 bucket `d-scribe-content-live`

---

### Issue: OpSheet Sync Failures

**Symptoms:** Operating sheet data not syncing correctly, schedule discrepancies for facilities.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*schedules-prod/*" "OpSheet" ERROR`
2. Verify the source OpSheet data is valid
3. If sync is stuck, trigger a force update for the affected facility
4. Check if the issue is specific to one entity type or widespread

---

### Issue: Naughty List

**Symptoms:** Certain entities consistently fail schedule generation or produce invalid XML.

**Resolution:**
1. Check the naughty list for entities that are known to have data issues
2. Splunk: `index=wdpr_d-scribe source="*schedules-prod/*" "naughtyList"`
3. Determine if the entity data needs correction at the source
4. If entity is incorrectly on the naughty list, coordinate with content team to fix source data

---

### Issue: Legacy Schedule Process Failures

**Symptoms:** Legacy schedule generation path fails, affecting older entity types.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*schedules-prod/*" "legacy" ERROR`
2. Verify the legacy process is still required for the affected entities
3. If the legacy path is deprecated for that entity, ensure it's migrated to the new path
4. Escalate to dev team if the legacy code path has a bug

---

### Issue: Batch Job 400 Errors

**Symptoms:** Batch schedule generation jobs returning HTTP 400 errors.

**Root Cause:** Malformed request data, invalid entity IDs, or missing required fields in batch payload.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*schedules-prod/*" "400" "batch"`
2. Identify the specific batch job and payload that triggered the error
3. Validate entity IDs exist and have required schedule data
4. If payload is correct, check if a recent code change broke validation

---

### Issue: Pricing View Errors

**Symptoms:** Pricing view schedule data not generating correctly or returning errors.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*schedules-prod/*" "PricingView" level=ERROR`
2. Verify pricing data source is available and returning valid data
3. Check if the issue is specific to certain products or widespread
4. Force update the affected pricing view entities

---

### Issue: High Error Rate / 5xx

**Symptoms:** Spike in errors, schedule generation failing broadly.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*schedules-prod/*" ERROR | rex "\"statusCode\":\"(?<errorCode>\d\d\d)\"" | rex "\"message\":\"(?<message>[^\"]+)\"" | stats count by errorCode, message | sort -count`
2. Verify S3 bucket `d-scribe-content-live` is accessible
3. Check ECS task health in cluster `d-scribe-prod`
4. If memory/GC issue, bounce affected tasks

---

## Escalation Decision Tree

- Schedule data stale → try force update endpoint first
- OpSheet sync issue → verify source data, then escalate to dev
- Naughty list entity → coordinate with content team for source data fix
- Batch job failures → check payload validity, escalate to dev if code issue
- S3 write failures → check AWS S3 status, escalate to Cloud Platform
- Persistent errors after bounce → escalate to Ant-Man Dev team

## Known Quirks

- Kronos handles many entity types — issues may be isolated to one type (e.g., only MealPeriods failing)
- S3 bucket naming appears swapped: prod-load uses `d-scribe-content-prod-stage` and prod-stage uses `d-scribe-content-prod-load`
- Schedule XML generation can be resource-intensive for large entity sets
- Force update endpoints are the primary self-service recovery tool
- Service shares `wdpr_d-scribe` Splunk index — always filter by `source="*schedules-{env}/*"`
