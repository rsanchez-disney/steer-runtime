# Troubleshooting — WDPR Ant-Man Lambda Bundle

## Common Issues

### Issue: High Error Rate

**Symptoms:** Grafana errors panel shows spike; content bundles not being created.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*usw2-prd-ant-man-bundle-lambda*" level=ERROR`
2. Check CloudWatch logs: `/aws/lambda/wdpr-content-S01431-usw2-prd-ant-man-bundle-lambda`
3. Investigate root cause — S3 write failures, payload issues, or content format errors
4. Manually trigger via GCx Tools API if needed

---

### Issue: High Duration (Slow Execution)

**Symptoms:** Lambda execution time exceeding expected duration.

**Resolution:**
1. Check CloudWatch logs for the specific invocation
2. Optimize code, reduce payload size, or increase allocated memory
3. Use AWS X-Ray for tracing and identifying bottlenecks

---

### Issue: Throttles

**Symptoms:** Grafana throttles panel shows non-zero values.

**Resolution:**
1. Increase reserved concurrency for the Lambda function
2. Optimize function to reduce execution time
3. Implement backoff strategy for retries

---

### Issue: Content Bundles Not Updating

**Symptoms:** Expected bundle files not appearing or updating in S3.

**Resolution:**
1. Check if trigger events are firing
2. Check Splunk/CloudWatch for processing errors
3. Manually trigger via GCx Tools API Gateway (see documentation)

---

## Escalation Decision Tree

- If S3 access issues → escalate to Platform Engineering
- If throttling → increase concurrency
- If code/logic issues → escalate to Ant-Man Dev team
- If related to Combine Lambda → check BAPP0249949

## Known Quirks

- Uses Java 17 runtime
- Lambda naming: wdpr-content-S01431-usw2-{env}-ant-man-bundle-lambda
- Part of the Filter Lambda architecture (alongside Combine Lambda)
- Deployed across multiple AWS accounts (prod=211570175858, test=716715798470, dev=539934483486)
- Has Splunk logging (source: `*usw2-prd-ant-man-bundle-lambda*`)
- Manual trigger via GCx Tools API Gateway
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas
