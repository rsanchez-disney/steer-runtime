# Troubleshooting — WDPR Ant-Man Sentinel

## Common Issues

### Issue: Service Errors / 5xx Responses

**Symptoms:** Content operations failing, HTTP 500/503 responses.

**Root Cause:** ECS task failures, S3 connectivity issues, OOM, or deployment problems.

**Resolution:**
1. Check Splunk: `index="wdpr_d-scribe" source="*sentinel-prod*" level=ERROR earliest=-30m | stats count by error_code, message | sort -count`
2. Verify health check: `https://d-tour-sentinel.wdprapps.disney.com/information`
3. Check ECS task health (service: d-tour-sentinel-prod-live)
4. Bounce tasks if OOM; rollback if deployment-related

---

### Issue: Slow Response Times

**Symptoms:** Content operations taking longer than expected.

**Root Cause:** S3 read/write latency, high traffic volume, or resource constraints.

**Resolution:**
1. Check latency: `index="wdpr_d-scribe" source="*sentinel-prod*" | stats avg(response_time) p95(response_time)`
2. Check CloudWatch dashboard: PACE-DLR-wdpr-content-S0001431-usw2-prd-5Ver
3. Scale up ECS tasks if resource-constrained

---

### Issue: Content Not Updating

**Symptoms:** Content changes not reflected downstream.

**Root Cause:** S3 write failures, upstream pipeline issues, or caching.

**Resolution:**
1. Check S3 bucket (d-scribe-content-live) for recent file updates
2. Verify upstream D-Scribe pipeline health
3. Check Splunk for write errors: `index="wdpr_d-scribe" source="*sentinel-prod*" "S3" OR "write" level=ERROR`

---

## Escalation Decision Tree

- If S3 access issues → escalate to Cloud Platform team
- If content pipeline issues → check Assembler/Transformer
- If infrastructure/ECS issues → escalate to Cloud Platform team
- If application logic bugs → escalate to Ant-Man Dev team

## Known Quirks

- Service is named d-tour-sentinel (URL pattern: d-tour-sentinel.wdprapps.disney.com)
- Uses Java 17.0.15
- No AppDynamics dashboards configured for this service
- CloudWatch dashboards use PACE-DLR-wdpr-content-S0001431 pattern
- Shares `wdpr_d-scribe` Splunk index — filter by `source="*sentinel-prod*"` for production
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ddsycmiacwwe8d/gcx-platform-status-dashboard
