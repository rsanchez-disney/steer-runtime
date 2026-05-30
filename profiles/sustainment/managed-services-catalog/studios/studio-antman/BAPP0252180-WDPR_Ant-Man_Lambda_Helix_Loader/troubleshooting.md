# Troubleshooting — WDPR Ant-Man Lambda Helix Loader

## Common Issues

### Issue: Content Not Loading into Helix

**Symptoms:** Content not appearing in Helix after publish.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*usw2-prd-d-scribe-to-helix-lambda*" level=ERROR`
2. Check CloudWatch logs: `/aws/lambda/wdpr-content-S01431-usw2-prd-d-scribe-to-helix-lambda`
3. Verify Filter Lambda is triggering this Lambda

### Issue: High Error Rate

**Symptoms:** Grafana errors panel shows spike.

**Resolution:**
1. Check Splunk/CloudWatch for error details
2. Verify S3 content availability and Helix downstream health
3. Check if payload format has changed

---

### Issue: Throttles

**Symptoms:** Grafana throttles panel shows non-zero values.

**Resolution:**
1. Increase reserved concurrency
2. Optimize function to reduce execution time

---

## Escalation Decision Tree

- If Filter Lambda not triggering → check Filter Lambda health
- If Helix downstream issues → escalate to Ant-Man Sustainment
- If S3 access issues → escalate to Platform Engineering
- If code/logic issues → escalate to Ant-Man Dev team

## Known Quirks

- Uses Python 3.9 runtime
- Deployed via Jenkins (not Harness)
- Lambda naming: wdpr-content-S01431-usw2-{env}-d-scribe-to-helix-lambda (note: "d-scribe-to-helix" not "helix-loader")
- Triggered by Filter Lambda
- Manual populate via GCx Tools API `/helixloader/populate` endpoint
- Has Splunk logging (source: `*usw2-prd-d-scribe-to-helix-lambda*`)
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas
