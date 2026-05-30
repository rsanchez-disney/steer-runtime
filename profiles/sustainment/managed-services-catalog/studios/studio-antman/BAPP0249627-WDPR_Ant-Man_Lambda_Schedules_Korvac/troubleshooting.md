# Troubleshooting — WDPR Ant-Man Lambda Schedules Korvac

## Common Issues

### Issue: High Duration (Slow Execution)

**Symptoms:** Lambda execution time exceeding expected duration; Grafana duration panel shows spikes.

**Resolution:**
1. Check CloudWatch logs for the specific invocation
2. Optimize code, reduce payload size, or increase allocated memory (also increases CPU)
3. Use AWS X-Ray for tracing and identifying bottlenecks

---

### Issue: High Error Rate

**Symptoms:** Grafana errors panel shows spike; scheduled content not processing.

**Resolution:**
1. Check CloudWatch logs: `/aws/lambda/wdpr-content-S0001431-usw2-prd-korvac-scheduler`
2. Monitor error rate, investigate root cause in logs
3. Implement error handling and retries if needed
4. Check if downstream HTTP services are available

---

### Issue: Throttles (Concurrency Limit Exceeded)

**Symptoms:** Grafana throttles panel shows non-zero values; invocations being rejected.

**Resolution:**
1. Increase reserved concurrency for the Lambda function
2. Optimize function to reduce execution time
3. Implement backoff strategy for retries
4. Request AWS account limit increase if needed

---

### Issue: Schedules Are Stale (Not Updating)

**Symptoms:** Schedule content not refreshing on expected cadence.

**Resolution:**
1. Confirm EventBridge rules are firing: check rule state in AWS Console
2. Verify the correct payload/env/host/path is being used
3. Check CloudWatch logs for invocation evidence
4. If rule is disabled, re-enable it

---

### Issue: HTTP Calls Failing

**Symptoms:** Lambda invokes but downstream HTTP calls return errors.

**Resolution:**
1. Validate host/path configuration in Lambda environment variables
2. Check TLS certificate validity
3. Verify downstream service availability
4. Retry after upstream outage is resolved

---

### Issue: Invocations Missing (Lambda Not Firing)

**Symptoms:** No invocations showing in Grafana; CloudWatch logs empty for expected time window.

**Resolution:**
1. Verify EventBridge rule state (enabled/disabled)
2. Check Lambda trigger configuration and permissions
3. Verify IAM role has correct permissions
4. Check if rule was accidentally modified or deleted

---

## Escalation Decision Tree

- If EventBridge rule not firing → check rule state, escalate to Platform Engineering
- If downstream HTTP failures → check target service health
- If throttling → increase concurrency or escalate to Platform Engineering
- If code/logic issues → escalate to Ant-Man Dev team

## Known Quirks

- This is a serverless Lambda function — no ECS tasks to restart
- Triggered by EventBridge cron rules (not HTTP requests)
- No Splunk available — use CloudWatch Logs for debugging
- Grafana dashboard for Lambda metrics: https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas
- Uses Node.js 16 runtime
- Naming pattern: wdpr-content-S0001431-usw2-{env}-korvac-scheduler
- EventBridge rule includes "mpg-currentWeek" suggesting weekly MealPeriod processing
- All environments in single AWS account 876496569223 (wdpr-apps)
