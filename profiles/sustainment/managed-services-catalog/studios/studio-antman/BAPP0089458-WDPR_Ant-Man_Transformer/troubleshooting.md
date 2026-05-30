# Troubleshooting — WDPR Ant-Man Transformer

## Common Issues

### Issue: Transformation Failures / Content Not Updating

**Symptoms:** Downstream consumers receiving stale content, error spikes in Splunk, transformed content not appearing in S3.

**Root Cause:** Schema changes in assembled content, S3 read/write failures, or transformation logic errors.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*transformer-prod/*" ERROR earliest=-1h | stats count by error_code, message | sort -count`
2. Identify which content types are failing
3. Check if Assembler output format changed (BAPP0089443)
4. Verify S3 bucket access (d-scribe-content-live)

---

### Issue: High Latency / Processing Backlog

**Symptoms:** Content transformation falling behind, increasing lag between assembly and delivery.

**Root Cause:** High content volume, resource constraints, or slow S3 operations.

**Resolution:**
1. Check processing throughput: `index=wdpr_d-scribe source="*transformer-prod/*" | timechart count by status`
2. Monitor ECS task resource utilization (CPU/memory)
3. Check CloudWatch dashboard: wdpr-content-ant-man-services-fargate-prod
4. Scale up if resource-constrained

---

### Issue: Service Crash / OOM

**Symptoms:** Service becomes unresponsive, ECS tasks restarting.

**Root Cause:** Large content payload processing or memory leak.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*transformer-prod/*" "OutOfMemoryError" OR "FATAL" earliest=-4h`
2. Bounce affected ECS tasks
3. Check AppDynamics for memory trends
4. If persistent, escalate to Ant-Man Dev team

---

## Escalation Decision Tree

- If content format/schema issues → check Assembler (BAPP0089443) output
- If S3 access issues → escalate to Cloud Platform team
- If transformation logic bugs → escalate to Ant-Man Dev team
- If resource exhaustion → scale up or escalate to Cloud Platform

## Known Quirks

- Part of the D-Scribe content pipeline: Assembler → Transformer → Watcher
- Uses Node 20.19 runtime (unlike Java-based Assembler)
- Shares `wdpr_d-scribe` Splunk index — filter by `source="*transformer-prod/*"` for production
- S3 buckets are in account 876496569223 (wdpr-apps), ECS is in 211570175858 (wdpr-content-prod)
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ddsycmiacwwe8d/gcx-platform-status-dashboard
