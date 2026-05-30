# Troubleshooting — GCX Site Builder Cast WebAPI

## Common Issues

### Issue: API Returning 5xx Errors

**Symptoms:** Cast Portals SPA showing errors, API health check failing, HTTP 500/503 responses.

**Root Cause:** ECS task failures, S3 connectivity issues, OOM, or deployment problems.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*cast-webapi-prod*" level=ERROR earliest=-30m | stats count by error_code, message | sort -count`
2. Verify health check: `https://cast-portals.wdprapps.disney.com/cast-api/information`
3. Check ECS task health in AWS Console
4. Bounce tasks if OOM; rollback if deployment-related

---

### Issue: Slow API Responses

**Symptoms:** Cast Portals SPA loading slowly, timeout errors, p95 response times elevated.

**Root Cause:** S3 read latency, high traffic volume, or resource constraints.

**Resolution:**
1. Check latency: `index=wdpr_d-scribe source="*cast-webapi-prod*" | stats avg(response_time) p95(response_time) by endpoint | sort -p95`
2. Check CloudWatch dashboard: wdpr-content-ant-man-services-fargate-prod
3. Check AppDynamics for bottlenecks
4. Scale up ECS tasks if resource-constrained

---

### Issue: Stale Content Being Served

**Symptoms:** API returning outdated content, SPA showing old information.

**Root Cause:** Content not updated in S3 by upstream pipeline (Assembler/Transformer).

**Resolution:**
1. Check S3 bucket (d-scribe-content-live) for recent file updates
2. Verify Assembler/Transformer health
3. If upstream is failing, resolve upstream issue first (see BAPP0089443, BAPP0089458)

---

## Escalation Decision Tree

- If API errors → check ECS health, bounce tasks, or rollback
- If stale content → check D-Scribe pipeline (Assembler/Transformer)
- If S3 access issues → escalate to Cloud Platform team
- If infrastructure/ECS issues → escalate to Cloud Platform team
- If API logic bugs → escalate to Ant-Man Dev team

## Known Quirks

- WebAPI serves as the backend for Cast Portals SPA (BAPP0159179)
- Health endpoint is at `/cast-api/information` (not just `/information`)
- Uses Node 20.29 runtime
- Shares ECS cluster with Cast SPA (wdpr-content-B0159179-usw2-prod-gcx-cast-portals)
- Shares `wdpr_d-scribe` Splunk index — filter by `source="*cast-webapi-prod*"` for production
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ddsycmiacwwe8d/gcx-platform-status-dashboard
