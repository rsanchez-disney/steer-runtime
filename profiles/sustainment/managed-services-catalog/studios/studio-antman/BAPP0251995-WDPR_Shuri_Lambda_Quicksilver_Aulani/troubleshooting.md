# Troubleshooting — WDPR Shuri Lambda Quicksilver Aulani

## Common Issues

### Issue: API Gateway Errors

**Symptoms:** QuickSilver API Gateway returning errors; Lambda not being triggered.

**Resolution:**
1. Check Grafana Lambda metrics for invocation/error patterns
2. Reference QuickSilver API Gateway docs: https://confluence.disney.com/spaces/ECM/pages/682154035/Quicksilver+API+Gateway
3. Verify API Gateway configuration and permissions
4. Note: No CloudWatch logs or Splunk available — debugging limited to Grafana metrics

---

### Issue: Throttles

**Symptoms:** Grafana throttles panel shows non-zero values.

**Resolution:**
1. Increase reserved concurrency for the Lambda function
2. Optimize function to reduce execution time

---

## Escalation Decision Tree

- If API Gateway issues → check QuickSilver API Gateway configuration
- If throttling → increase concurrency
- If code/logic issues → escalate to Ant-Man Dev team

## Known Quirks

- Uses Python 3.9 runtime
- Deployed via Jenkins (not Harness)
- **No Splunk available** and **no CloudWatch log group** — debugging very limited
- Lambda naming: wdpr-content-S01431-usw2-{env}-quicksilver-aulani-lambda
- Triggered by QuickSilver API Gateway
- Grafana dashboard: https://grafana.wdprapps.disney.com/d/ae6p0xe9kritce/gcx-lambdas
