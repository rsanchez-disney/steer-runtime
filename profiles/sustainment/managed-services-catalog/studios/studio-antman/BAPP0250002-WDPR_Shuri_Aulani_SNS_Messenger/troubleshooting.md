# Troubleshooting — WDPR Shuri Aulani SNS Messenger

## Common Issues

### Issue: API Gateway Errors (Hulkling)

**Symptoms:** Aulani content calls failing; Hulkling API Gateway returning errors.

**Resolution:**
1. Verify auth configuration and expected headers for Aulani gateway route
2. Check CloudWatch logs for Lambda errors (prd-shuri-aulani-lambda-logs)
3. Correlate requestId and timestamps across CloudWatch logs for API GW and Lambda

---

### Issue: SNS Publish Failures

**Symptoms:** Lambda executes but messages not reaching downstream subscribers.

**Resolution:**
1. Validate SNS topic policy/IAM permissions
2. Check payload size limits (SNS max 256KB)
3. Verify SNS subscriptions and any SQS backlog/DLQs
4. Re-drive the request after fixing permissions or payload issues

---

### Issue: Downstream Silent (No Response)

**Symptoms:** SNS messages published but downstream not processing.

**Resolution:**
1. Verify SNS subscriptions are active and healthy
2. Check SQS DLQs for failed messages
3. Verify downstream Lambda/SQS consumers are running

---

### Issue: High Error Rate / Throttles

**Symptoms:** Grafana errors or throttles panels showing spikes.

**Resolution:**
1. Check CloudWatch logs for error patterns
2. If throttled, increase reserved concurrency
3. Optimize function to reduce execution time
4. Implement backoff strategy for retries

---

## Escalation Decision Tree

- If Hulkling API Gateway issues → check Hulkling (BAPP0202830) health
- If SNS publish failures → check topic ARN/permissions, escalate to Platform Engineering
- If downstream subscribers silent → check SQS/Lambda subscriptions and DLQs
- If code/logic issues → escalate to Ant-Man Dev team

## Known Quirks

- Uses Python 3.9 runtime
- Triggered by Hulkling API Gateway (not a direct API Gateway like Incognito variant)
- Shares GitHub repo with Incognito SNS Messenger (WDPR-ECM/shuri-sns-messenger)
- Shares Harness project (WDW_Shuri_Aulani_SNS_Messenger) with Incognito variant
- Lambda naming: {env}-shuri-aulani-lambda (shorter pattern than other Lambdas)
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas
