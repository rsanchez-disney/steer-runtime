# Troubleshooting — WDPR Ant-Man Query

## Common Issues

### Issue: Stale Content Data

**Symptoms:** Mobile apps or web showing outdated content; content doesn't reflect recent publishes.

**Root Cause:** Assembler/Transformer (upstream) has failed or is delayed in processing content updates. Query serves content from CMS (BrokerDB) and upstream store it in the S3 which hasn't been updated.

**Resolution:**
1. Verify Assembler health: `index=wdpr_d-scribe source="*assembler-prod/*" level=ERROR earliest=-1h`
2. Verify Transformer health: `index=wdpr_d-scribe source="*transformer-prod/*" level=ERROR earliest=-1h`
3. Check S3 bucket (d-scribe-content-live) for recent file updates
4. If upstream is failing, resolve upstream issue first (see BAPP0089443, BAPP0089458)

---

### Issue: High Latency / Slow Queries

**Symptoms:** Mobile apps loading slowly, timeout errors from consumers, p95 response times elevated.

**Root Cause:** S3 read performance issues, high traffic volume, or resource constraints.

**Resolution:**
1. Check latency: `index=wdpr_d-scribe source="*query-prod/*" | stats avg(response_time) p95(response_time) by endpoint | sort -p95`
2. Check ECS task resource utilization (CPU/memory)
3. Check CloudWatch dashboard: PACE-DLR-wdpr-content-S0001431-usw2-prd-Ver5
4. Scale up ECS tasks if resource-constrained

---

### Issue: 5xx Errors / Service Unavailable

**Symptoms:** HTTP 500/503 responses, consumers unable to retrieve content.

**Root Cause:** S3 connectivity failure, OOM, or deployment issue.

**Resolution:**
1. `index=wdpr_d-scribe source="*query-prod/*" ERROR | rex "\"statusCode\":\"(?<errorCode>\d\d\d)\"" | stats count by errorCode`
2. Check ECS task health and recent deployments
3. Bounce tasks if OOM; rollback if deployment-related

---

## Escalation Decision Tree

- If stale content → check Assembler (BAPP0089443) and Transformer (BAPP0089458) first
- If S3 access issues → escalate to Cloud Platform team
- If consumer overload → notify consumer team
- If infrastructure → escalate to Cloud Platform team

## Known Quirks

- Query is a high-traffic service, traffic based on the number of publish requests processed in D-scribe CMS
- Read-only service — it never modifies content, only serves from CMS
- Uses shared ECS cluster (wdpr-content-S0001431-usw2-prd) unlike Assembler/Transformer/Gatekeeper which have dedicated clusters
- Shares `wdpr_d-scribe` index — filter by `source="*query-prod/*"` for production
- CloudWatch dashboards use PACE-DLR naming pattern for lower environments
