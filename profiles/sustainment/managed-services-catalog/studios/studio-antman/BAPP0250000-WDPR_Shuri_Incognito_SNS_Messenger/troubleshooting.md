# Troubleshooting — WDPR Shuri Incognito SNS Messenger

## Common Issues

### Issue: API Gateway Errors

**Symptoms:** Incognito integration calls failing; API Gateway returning 4xx/5xx errors.

**Resolution:**
1. Check API Gateway console: https://us-west-2.console.aws.amazon.com/apigateway/main/apis/jbrwuadrpj/resources?api=jbrwuadrpj&region=us-west-2
2. Verify auth configuration and request headers expected by the Incognito gateway
3. Correlate issues with `requestId`/`x-correlation-id` across gateway logs and Lambda logs
4. Mitigation: retry after restoring IAM permissions or fixing invalid payload formats

---

### Issue: SNS Publish Failures

**Symptoms:** Lambda executes but messages not reaching downstream subscribers.

**Resolution:**
1. Check SNS topic permissions and ARN configuration
2. Verify payload size limits (SNS max 256KB)
3. Check retry behavior and DLQ configuration
4. If downstream is silent, confirm subscriptions (SQS/Lambda) are healthy and DLQs are empty

---

### Issue: High Error Rate

**Symptoms:** Grafana errors panel shows spike.

**Resolution:**
1. Check Grafana Lambda metrics for error patterns
2. Note: No CloudWatch log stream exists — debugging is limited to Grafana metrics
3. Check API Gateway logs for request-level errors
4. Verify Lambda function configuration and environment variables

---

### Issue: Throttles

**Symptoms:** Grafana throttles panel shows non-zero values.

**Resolution:**
1. Increase reserved concurrency for the Lambda function
2. Optimize function to reduce execution time
3. Implement backoff strategy for retries

---

## Escalation Decision Tree

- If API Gateway auth issues → verify IAM permissions, escalate to Platform Engineering
- If SNS publish failures → check topic ARN/permissions, escalate to Platform Engineering
- If downstream subscribers silent → check SQS/Lambda subscriptions and DLQs
- If code/logic issues → escalate to Ant-Man Dev team

## Known Quirks

- Uses Python 3.9 runtime
- **No AWS CloudWatch log stream exists** — debugging limited to Grafana metrics and API Gateway logs
- Lambda naming: wdpr-content-S01431-usw2-{env}-shuri-incognito-lambda
- Triggered by API Gateway (ID: jbrwuadrpj)
- Shares Harness project with Aulani SNS Messenger (WDW_Shuri_Aulani_SNS_Messenger)
- Shares GitHub repo with Aulani variant (WDPR-ECM/shuri-sns-messenger)
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas
