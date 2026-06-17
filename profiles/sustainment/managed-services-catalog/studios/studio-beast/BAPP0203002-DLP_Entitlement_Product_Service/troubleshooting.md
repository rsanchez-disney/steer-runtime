# Troubleshooting — DLP Entitlement Product Service

## Common Issues

### Issue: Lambda invocation failures

**Symptoms:** TMS unable to retrieve product information. 5xx errors from product-finder endpoint.

**Root Cause:** Lambda function error, timeout, or cold start issues.

**Resolution:** Check Lambda logs in Splunk (`index=wdpr_dlp_cme source="eu-west-1:/aws/lambda/epsdlp-euw1-prd-cme-eps-product-finder:*"`). Check Lambda CloudWatch metrics. Verify API Gateway routing.

---

### Issue: Product information not found for valid SKU

**Symptoms:** Product finder returns empty/null for a known SKU.

**Root Cause:** Product data source (Tridion/CME Surqual) not updated or data sync issue.

**Resolution:** Verify product exists in Tridion. Check if SKU is correctly formatted. Test with Postman (GET PLU DETAILS endpoint).

---

### Issue: API Gateway timeout

**Symptoms:** Requests to product-finder endpoint timing out (29s API Gateway limit).

**Root Cause:** Lambda cold start or downstream dependency slow.

**Resolution:** Check Lambda duration metrics. Consider provisioned concurrency if cold starts are frequent.

---

## Escalation Decision Tree

- If Lambda/infrastructure issue → Cloud OPS
- If product data issue → check Tridion/CME Surqual, escalate to content team
- If application logic → Luigi Squad (app-frdlp-guestprofile)

## Known Quirks

- Node.js Lambda (not Java like most Beast services)
- Single endpoint only: product finder
- Repository is on GitLab (not GitHub)
- Splunk index: wdpr_dlp_cme
