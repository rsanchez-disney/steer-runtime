# Troubleshooting — WDPRT GAM Profile Web API Service

## Common Issues

### Issue: GAM Routing Failures

**Symptoms:** 500 errors when WAM cannot reach GAM. Multiple SPAs affected simultaneously. P1/P2 severity.

**Root Cause:** GAM service unavailable or network connectivity issues between WAM and GAM.

**Resolution:**
1. Check AppDynamics: core-profile-wam-ha-east / core-profile-wam-ha-west
2. Verify GAM health
3. Check Splunk: `index=wdpr-gam ids.app=wdw-webapi environment=prod "error" "GAM"`
4. Escalate to Enterprise Technology if GAM-side issue

---

### Issue: DynamoDB Session Throttling

**Symptoms:** Slow responses, session creation failures. Users experiencing intermittent login issues. P2 severity.

**Root Cause:** DynamoDB read/write capacity exceeded on table wdpr-gam-b0253435-prd-webapi.

**Resolution:**
1. Check CloudWatch ThrottledRequests metric for DynamoDB table
2. Check Splunk: `index=wdpr-gam ids.app=wdw-webapi environment=prod "DynamoDB" "Throttle" | timechart count span=5m`
3. Consider increasing DynamoDB capacity if sustained throttling
4. Monitor session error rates

---

### Issue: GSS Proxy 502/504

**Symptoms:** CM proxy fails. 502/504 errors from gssmain.wdprapps.disney.com. P2 severity. Reference: INC25819362.

**Root Cause:** GSS proxy connectivity failure.

**Resolution:** Clear cookies for gssmain.wdprapps.disney.com. If persistent, escalate.

---

### Issue: Error rate exceeds endpoint thresholds

**Symptoms:** Specific endpoint error rate exceeds documented threshold (see business-rules.md for thresholds).

**Root Cause:** Varies by endpoint — could be downstream service failure, DynamoDB issues, or application bug.

**Resolution:**
1. Identify which endpoint is failing: `index=wdpr-gam ids.app=wdw-webapi environment=prod msg.code>=500 | stats count by msg.path`
2. Check downstream service health for that endpoint
3. If /profile-api/authentication/session > 1% → critical, check DynamoDB and OneID
4. If /profile-api/avatars > 0.003% → check VAS health

---

## Escalation Decision Tree

- If ALL SPAs affected → P1, this service is likely down. Check ECS health, force new deployment. Escalate to Andrew Southwick.
- If GAM routing failures → escalate to Enterprise Technology
- If DynamoDB throttling → check CloudWatch, consider capacity increase
- If specific endpoint failing → identify downstream dependency and escalate to relevant team
- If GSS proxy issues → clear cookies, reference INC25819362
- For sustainment issues → Yash Sugandh, Nerio Baez, Julian Martinez

## Known Quirks

- ECS clusters use legacy BAPP ID B0082601 (from Node WAM) in cluster names, not B0253435
- DynamoDB table name uses the new BAPP ID: wdpr-gam-b0253435-prd-webapi
- Splunk dashboard name: "Profile GAM WEBAPI"
- Vault paths differ between East (gam2) and West (gam) in prod
- Migrated from Node.js (BAPP0082601) to Java 17 — some documentation may still reference old BAPP
