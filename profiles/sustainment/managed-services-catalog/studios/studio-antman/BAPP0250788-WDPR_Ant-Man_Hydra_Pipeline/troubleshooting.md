# Troubleshooting — WDPR Ant-Man Hydra Pipeline

## Common Issues

### Issue: API Gateway Errors

**Symptoms:** Hydra API Gateway returning errors; Lambda not being triggered.

**Resolution:**
1. Check Grafana Lambda metrics for invocation/error patterns
2. Check Splunk: `index=wdpr_d-scribe source="*usw2-prd-hydra-pipeline-lambda*" level=ERROR`
3. Verify API Gateway configuration and permissions
4. Check CloudWatch logs for Lambda execution details

---

### Issue: High Error Rate

**Symptoms:** Grafana errors panel shows spike.

**Resolution:**
1. Check Splunk for error details
2. Check CloudWatch logs for root cause
3. Verify S3 bucket access and content format
4. Note: No CI/CD pipeline — code changes require manual deployment

---

### Issue: Throttles

**Symptoms:** Grafana throttles panel shows non-zero values.

**Resolution:**
1. Increase reserved concurrency for the Lambda function
2. Optimize function to reduce execution time
3. Implement backoff strategy for retries

---

## Escalation Decision Tree

- If API Gateway issues → escalate to Platform Engineering
- If S3 access issues → escalate to Platform Engineering
- If code changes needed → contact Chandra Achanta (manual deployment required)
- If throttling → increase concurrency

## Known Quirks

- **One-time deployment — no CI/CD pipeline exists** (confirmed by Chandra Achanta)
- Uses Python 3.9 runtime
- Lambda naming: wdpr-content-S01431-usw2-{env}-hydra-pipeline-lambda
- Triggered by Hydra API Gateway
- GitHub repo is shuri-sns-messenger (shared repo)
- Any code changes require manual deployment
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas
