# Troubleshooting — WDPR Shuri Lambda DLR Guest Entry

## Common Issues

### Issue: API Gateway Errors

**Symptoms:** Consumers receiving 4xx/5xx errors from the DLR Guest Entry API.

**Resolution:**
1. Check API Gateway console: https://us-west-2.console.aws.amazon.com/apigateway/main/apis/basyohxxv4/resources?api=basyohxxv4&region=us-west-2
2. Check CloudWatch logs for Lambda errors
3. Verify Lambda function is not throttled (Grafana throttles panel)
4. Check if API Gateway integration is correctly configured

---

### Issue: High Error Rate

**Symptoms:** Grafana errors panel shows spike; API returning errors.

**Resolution:**
1. Check CloudWatch logs: `/aws/lambda/wdpr-content-S01431-usw2-prd-dlr-guest-entry-svc`
2. Investigate root cause — S3 access issues, payload problems, or downstream errors
3. Check if Lambda timeout is being hit (duration panel)

---

### Issue: High Duration / Timeouts

**Symptoms:** Lambda execution time exceeding expected duration; API Gateway timing out.

**Resolution:**
1. Check Grafana duration panel for spikes
2. Check CloudWatch logs for slow operations
3. Verify S3 read/write performance
4. Increase Lambda memory allocation if needed (also increases CPU)

---

### Issue: Throttles

**Symptoms:** Grafana throttles panel shows non-zero values; some requests rejected.

**Resolution:**
1. Increase reserved concurrency for the Lambda function
2. Check if traffic spike is legitimate or an error loop
3. Request AWS account limit increase if needed

---

## Escalation Decision Tree

- If API Gateway issues → check gateway configuration, escalate to Platform Engineering
- If S3 access issues → escalate to Platform Engineering
- If throttling → increase concurrency
- If code/logic issues → escalate to Ant-Man Dev team

## Known Quirks

- Uses Python 3.9 runtime (different from other Ant-Man Lambdas which use Java/Node)
- Triggered by API Gateway (ID: basyohxxv4) — not EventBridge or Filter Lambda
- Deployed via Jenkins (not Harness like most other services)
- Lambda naming: wdpr-content-S01431-usw2-{env}-dlr-guest-entry-svc
- Deployed across multiple AWS accounts (prod=211570175858, test=716715798470, dev=539934483486)
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas
