# Troubleshooting — WDPR Ant-Man Watcher

## Common Issues

### Issue: Goliath Not Showing Combine Data (Returns Null)

**Symptoms:** A Goliath call returns the combine with a "null" value.

**Root Cause:** Content not properly published, process combine not executed, or duplicate IDs in S3 bucket.

**Resolution:**
1. Check if all the data seems to be correctly published in S3
2. Try to do a process combine through gcx-tools-api
3. If that doesn't work, check the S3 bucket to see if there are duplicates of the ID
4. Check Splunk: `index=wdpr_d-scribe source="*watcher-prod/*" ERROR | rex "\"statusCode\":\"(?<errorCode>\d\d\d)\"" | rex "\"message\":\"(?<message>[^\"]+)\"" | stats count by errorCode, message | sort -count`

---

### Issue: Content Not Being Served / Read Failures

**Symptoms:** Watcher calls not returning page data, consumers receiving errors.

**Root Cause:** S3 bucket access issues, content not published by upstream services, or service health issues.

**Resolution:**
1. Check health: `https://ant-man-watcher.wdprapps.disney.com/information`
2. Verify content exists in S3 bucket (d-scribe-content-live)
3. Check if Assembler/Transformer have published content recently
4. Check Splunk for errors: `index=wdpr_d-scribe source="*watcher-prod/*" ERROR earliest=-30m`

---

### Issue: High Latency / Slow Content Reads

**Symptoms:** Content reads taking longer than expected, consumers reporting slow responses.

**Root Cause:** S3 read performance issues, high traffic volume, or resource constraints.

**Resolution:**
1. Check latency: `index=wdpr_d-scribe source="*watcher-prod/*" "*SUCCESS : PT*" | rex "SUCCESS : PT(?<responseTime>[0-9.]+)S" | stats avg(responseTime) as avg_RT p95(responseTime) as p95_RT`
2. Check CloudWatch dashboard: wdpr-content-ant-man-services-fargate-prod
3. Scale up ECS tasks if resource-constrained

---

## Escalation Decision Tree

- If Goliath combine data null → check S3 for duplicates, try process combine via gcx-tools-api
- If content not published → check Assembler (BAPP0089443) and Transformer (BAPP0089458)
- If S3 access issues → escalate to Cloud Platform team
- If infrastructure/ECS issues → escalate to Cloud Platform team
- If logic bugs → escalate to Ant-Man Dev team

## Known Quirks

- Watcher integrates with Goliath for combine data — null returns often indicate S3 duplicates
- Process combine can be triggered manually via gcx-tools-api
- Shares `wdpr_d-scribe` Splunk index — filter by `source="*watcher-prod/*"` for production
- Has a dedicated Splunk dashboard: https://splunk.wdprapps.disney.com/en-GB/app/launcher/watcher_prod
- S3 buckets are in account 876496569223 (wdpr-apps), ECS is in 211570175858 (wdpr-content-prod)
