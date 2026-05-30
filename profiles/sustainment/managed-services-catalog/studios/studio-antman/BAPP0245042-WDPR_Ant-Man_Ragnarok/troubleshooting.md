# Troubleshooting — WDPR Ant-Man Ragnarok

## Common Issues

### Issue: .ini Validation Failures

**Symptoms:** Configuration validation errors, content pipeline rejecting .ini files.

**Root Cause:** Malformed .ini configuration files, missing required fields, or format changes.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*ragnarok-prod/*" "ini" OR "validation" level=ERROR earliest=-1h | stats count by message | sort -count`
2. Identify which .ini file is failing validation
3. Verify .ini file format and required fields
4. If format changed, escalate to Ant-Man Dev team

---

### Issue: Service Errors / 5xx Responses

**Symptoms:** Content operations failing, HTTP 500/503 responses.

**Root Cause:** ECS task failures, S3 connectivity issues, OOM, or deployment problems.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*ragnarok-prod/*" level=ERROR earliest=-30m | stats count by error_code, message | sort -count`
2. Verify health check: `https://antman-ragnarok.wdprapps.disney.com/information`
3. Check ECS task health (service: antman-ragnarok-prod-live)
4. Bounce tasks if OOM; rollback if deployment-related

---

### Issue: Slow Response Times

**Symptoms:** Content operations taking longer than expected.

**Root Cause:** S3 read/write latency, high traffic volume, or resource constraints.

**Resolution:**
1. Check latency: `index=wdpr_d-scribe source="*ragnarok-prod/*" | stats avg(response_time) p95(response_time)`
2. Check CloudWatch dashboard: PACE-DLR-wdpr-content-S0001431-usw2-prd-5Ver
3. Scale up ECS tasks if resource-constrained

---

## Escalation Decision Tree

- If .ini validation issues → check file format, escalate to Ant-Man Dev if needed
- If S3 access issues → escalate to Cloud Platform team
- If infrastructure/ECS issues → escalate to Cloud Platform team
- If application logic bugs → escalate to Ant-Man Dev team

## Known Quirks

- Uses Java 11.0.23 (older runtime, unlike most Ant-Man services on Java 17)
- Handles .ini configuration validation — known troubleshooting topic
- URL pattern uses `antman-ragnarok` (no hyphen between ant and man)
- CloudWatch dashboards use PACE-DLR-wdpr-content-S0001431 pattern
- Shares `wdpr_d-scribe` Splunk index — filter by `source="*ragnarok-prod/*"` for production
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ddsycmiacwwe8d/gcx-platform-status-dashboard
