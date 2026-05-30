# Troubleshooting — WDPR Ant-Man Services (Longshot)

## Service Overview

D-Scribe Longshot is a content delivery/transformation service (Java 17, Spring Boot) that serves content across multiple environments. It adjusts lanes on api-internal hosts via the X-Content-Host header.

- **Splunk:** `index="wdpr_d-scribe" source="*services-prod/*"`
- **Health:** https://d-scribe-services.wdprapps.disney.com/information
- **Grafana:** https://grafana.wdprapps.disney.com/d/ddsycmiacwwe8d/gcx-platform-status-dashboard

---

## Common Issues

### Issue: Lane Override Not Working (X-Content-Host)

**Symptoms:** Content served from wrong environment lane (e.g., prod-stage content appearing in prod).

**Root Cause:** Incorrect or missing `X-Content-Host` header in requests to api-internal.

**Resolution:**
1. Verify the request includes the correct `X-Content-Host` header value for the target environment
2. Check Splunk for routing: `index="wdpr_d-scribe" source="*services-prod/*" "X-Content-Host"`
3. Confirm the target environment cluster is healthy (check health endpoint for that env)
4. If header is correct but routing fails, check ECS task health in the target cluster

**Environment mapping:**
- prod → `svc-d-scribe-prod-live`
- prod-stage → `svc-d-scribe-prod-stage-live`
- prod-load → `svc-d-scribe-prod-load-live`
- prod-latest → `svc-d-scribe-prod-latest-live`
- stage → `svc-d-scribe-stage-live`
- latest → `svc-d-scribe-latest-live`

---

### Issue: URL Friendly ID Duplicated

**Symptoms:** Multiple content items resolve to the same URL Friendly ID, causing content collision or wrong content served.

**Resolution:**
1. Identify the duplicated URL Friendly ID in Splunk: `index="wdpr_d-scribe" source="*services-prod/*" "urlFriendlyId" "duplicate"`
2. Determine which content items share the ID
3. Coordinate with content authors to resolve the duplication at the source (Assembler/Gatekeeper)
4. If urgent, a manual override may be needed in the content store

---

### Issue: Analytics Tags Missing or Incorrect

**Symptoms:** Analytics tracking data not flowing correctly from content served by Longshot.

**Resolution:**
1. Check if the content item has analytics tags defined at the source
2. Verify Longshot is passing through tags: `index="wdpr_d-scribe" source="*services-prod/*" "analytics"`
3. If tags are present in source but missing in delivery, check transformation logic
4. Escalate to dev team if transformation is stripping tags

---

### Issue: High Error Rate / 5xx Responses

**Symptoms:** Spike in HTTP 500 errors, consumers reporting failures.

**Resolution:**
1. Check Splunk: `index="wdpr_d-scribe" source="*services-prod/*" ERROR earliest=-1h | stats count by error_code, message | sort -count`
2. Verify S3 bucket `d-scribe-content-live` is accessible
3. Check ECS task health in cluster `svc-d-scribe-prod-live`
4. If memory/GC issue, bounce affected tasks (ECS auto-replaces)

---

### Issue: Content Not Found (404)

**Symptoms:** Valid content IDs returning 404 from Longshot.

**Resolution:**
1. Verify content exists in S3: check `d-scribe-content-live` bucket
2. Check if content was recently published — may need time to propagate
3. Verify Assembler/Gatekeeper published successfully
4. Check Splunk: `index="wdpr_d-scribe" source="*services-prod/*" "404" "<contentId>"`

---

## Escalation Decision Tree

- Content routing/lane issue → verify X-Content-Host header, check cluster health
- URL Friendly ID collision → coordinate with content team, escalate to dev if systemic
- S3 access failures → check AWS S3 status, escalate to Cloud Platform
- Persistent 5xx after task bounce → escalate to Ant-Man Dev team
- Content missing after publish → check Assembler (BAPP0089443) and Gatekeeper (BAPP0089473) first

## Known Quirks

- Longshot is the content delivery layer — issues here affect all downstream consumers
- Lane override via X-Content-Host is critical for environment isolation in prod-stage/prod-load
- Service shares `wdpr_d-scribe` Splunk index with all Ant-Man apps — always filter by `source="*services-{env}/*"`
- S3 bucket naming appears swapped: prod-load uses `d-scribe-content-prod-stage` and prod-stage uses `d-scribe-content-prod-load`
