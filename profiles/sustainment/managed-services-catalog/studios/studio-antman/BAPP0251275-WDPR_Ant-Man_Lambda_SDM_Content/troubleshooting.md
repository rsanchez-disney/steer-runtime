# Troubleshooting — WDPR Ant-Man Lambda SDM Content

## Common Issues

### Issue: High Error Rate

**Symptoms:** Grafana errors panel shows spike; SDM content not being processed.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*usw2-prd-ant-man-sdm-content-lambda*" level=ERROR`
2. Check CloudWatch logs: `/aws/lambda/wdpr-content-S01431-usw2-prd-ant-man-sdm-content-lambda`
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

### Issue: SDM Content Not Processing

**Symptoms:** ScheduleUpdate or PublishNotification not being processed.

**Resolution:**
1. Verify Filter Lambda is triggering this Lambda
2. Check Splunk/CloudWatch for processing errors
3. Manually trigger via GCx Tools API Gateway (ScheduleUpdate/PublishNotification)

---

## Escalation Decision Tree

- If Filter Lambda not triggering → check Filter Lambda health
- If S3 write failures → escalate to Platform Engineering
- If throttling → increase concurrency
- If code/logic issues → escalate to Ant-Man Dev team

## Known Quirks

- Uses Java 17 runtime
- Lambda naming: wdpr-content-S01431-usw2-{env}-ant-man-sdm-content-lambda
- Triggered by Filter Lambda (not directly by events)
- Manual trigger for ScheduleUpdate/PublishNotification via GCx Tools API Gateway
- Deployed across multiple AWS accounts (prod=211570175858, test=716715798470, dev=539934483486)
- Has Splunk logging (source: `*usw2-prd-ant-man-sdm-content-lambda*`)
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas
