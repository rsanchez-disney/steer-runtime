# Troubleshooting — WDPR Ant-Man Lambda Combine

## Common Issues

### Issue: High Invocation Count (Unexpected)

**Symptoms:** Grafana shows spike in invocations; possible error/retry loop.

**Resolution:**
1. Investigate source of invocations — check if S3 events are triggering excessively
2. Check CloudWatch logs for error patterns causing retries
3. If error loop, fix root cause and invocations will normalize

---

### Issue: High Error Rate

**Symptoms:** Grafana errors panel shows spike; combined content not being written to S3.

**Resolution:**
1. Check Splunk: `index=wdpr_d-scribe source="*usw2-prd-ant-man-combine-lambda*" level=ERROR`
2. Check CloudWatch logs: `/aws/lambda/wdpr-content-S01431-usw2-prd-ant-man-combine-lambda`
3. Investigate root cause — S3 write failures, payload issues, or content format errors
4. Manually trigger via GCx Tools API if needed to reprocess

---

### Issue: High Duration (Slow Execution)

**Symptoms:** Lambda execution time exceeding expected duration.

**Resolution:**
1. Check CloudWatch logs for the specific invocation
2. Optimize code, reduce payload size, or increase allocated memory
3. Use AWS X-Ray for tracing and identifying bottlenecks

---

### Issue: Throttles (Concurrency Limit Exceeded)

**Symptoms:** Grafana throttles panel shows non-zero values.

**Resolution:**
1. Increase reserved concurrency for the Lambda function
2. Optimize function to reduce execution time
3. Implement backoff strategy for retries

---

### Issue: Combined Content Not Updating in S3

**Symptoms:** Expected combined JSON files not appearing or updating in S3 bucket.

**Resolution:**
1. Check if S3 events are triggering the Lambda
2. Check Splunk/CloudWatch for processing errors
3. Manually trigger via GCx Tools API:
   ```
   POST https://gcx-tools-api.wdprapps.disney.com/process/combine
   {"conversationId": "Test", "create": ["legacy/preview/en-US/legacy/LgcyServices/{id}.json"], "delete": []}
   ```

---

## Escalation Decision Tree

- If S3 event triggers not firing → check S3 event notification configuration
- If S3 write failures → escalate to Platform Engineering
- If throttling → increase concurrency
- If code/logic issues → escalate to Ant-Man Dev team

## Known Quirks

- Uses Java 17 runtime
- Lambda naming pattern: `wdpr-content-S01431-usw2-{env}-ant-man-combine-lambda`
- Deployed across multiple AWS accounts (prod=211570175858, test=716715798470, dev=539934483486)
- Has Splunk logging available (source: `*usw2-prd-ant-man-combine-lambda*`)
- Manual trigger available via GCx Tools API Gateway POST to `/process/combine`
- Part of the Filter Lambda architecture
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas
