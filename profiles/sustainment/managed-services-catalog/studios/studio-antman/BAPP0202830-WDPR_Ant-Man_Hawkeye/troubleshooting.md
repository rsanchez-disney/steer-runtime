# Troubleshooting — WDPR Ant-Man Hawkeye

## Common Issues

### Issue: Service Errors / 5xx Responses

**Symptoms:** Experience Builder operations failing, HTTP 500/503 responses.

**Root Cause:** ECS task failures, S3 connectivity issues, OOM, or deployment problems.

**Resolution:**
1. Check Splunk: `index="wdpr_d-scribe" source="*hawkeye-prod/*" level=ERROR earliest=-30m | stats count by error_code, message | sort -count`
2. Verify health check: `https://shuri-hawkeye.wdprapps.disney.com/information`
3. Check ECS task health in AWS Console (cluster: wdpr-content-B0202830-usw2-prod-shuri-hawkeye)
4. Bounce tasks if OOM; rollback if deployment-related

---

### Issue: Slow Response Times

**Symptoms:** Experience content operations taking longer than expected.

**Root Cause:** S3 read/write latency, high traffic volume, or resource constraints.

**Resolution:**
1. Check latency: `index="wdpr_d-scribe" source="*hawkeye-prod/*" | stats avg(response_time) p95(response_time)`
2. Check CloudWatch dashboard: wdpr-content-ant-man-services-fargate-prod
3. Check AppDynamics for bottlenecks
4. Scale up ECS tasks if resource-constrained

---

### Issue: Content Not Updating

**Symptoms:** Experience content changes not reflected in downstream consumers.

**Root Cause:** S3 write failures, upstream pipeline issues, or caching.

**Resolution:**
1. Check S3 bucket (d-scribe-content-live) for recent file updates
2. Verify upstream D-Scribe pipeline health
3. Check Splunk for write errors: `index="wdpr_d-scribe" source="*hawkeye-prod/*" "S3" OR "write" level=ERROR`

---

## Escalation Decision Tree

- If S3 access issues → escalate to Cloud Platform team
- If content pipeline issues → check Assembler/Transformer
- If infrastructure/ECS issues → escalate to Cloud Platform team
- If application logic bugs → escalate to Ant-Man Dev team

## Known Quirks

- Hawkeye is also known as "XBS - Experience Builder"
- Part of the Shuri platform family (uses shuri-hawkeye naming)
- Shares `wdpr_d-scribe` Splunk index — filter by `source="*hawkeye-prod/*"` for production
- ECS cluster pattern: wdpr-content-B0202830-usw2-{env}-shuri-hawkeye
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ddsycmiacwwe8d/gcx-platform-status-dashboard
- General troubleshooting: https://disneyexperiences.atlassian.net/wiki/spaces/GIT/pages/462603981/Ant-Man+General+Troubleshooting
