# Troubleshooting — DLP Guest Membership Provider

## Common Issues

### Issue: Disney+ API returning errors

**Symptoms:** Membership verification failing for all guests. Discounts not being applied during booking. AppDynamics `prod_dlp-is_guest-membership` showing elevated error rate.

**Root Cause:** Disney+ Streaming Subscriber Benefits API down, API credentials expired, or network connectivity issue.

**Resolution:**
1. Check AppDynamics: `PROD_DLP_BAPP0248634_wdpr-dlp-is-guest-membership`
2. Check Splunk dashboard "wdpr-dlp-is-guest-membership-provider" for error patterns
3. Verify deep health check endpoint
4. If Disney+ API is down → contact DEE Technology Activation-3pp (DEE.Technology.Activation-3pp@disney.com)
5. For urgent outage → Slack: dee2supportcenter (24/7) or Phone: 860-766-3633
6. If Disney Streaming platform fully down → contact focal point: max.lesser@disneystreaming.com

---

### Issue: JWKS endpoint failure (authorization errors)

**Symptoms:** Frontend components receiving 401/403 when trying to verify Disney+ membership. Logs showing JWKS validation errors.

**Root Cause:** JWKS endpoint returning errors, key rotation issue, or AuthZ service unavailable.

**Resolution:**
1. Check Splunk for JWKS-related errors in "wdpr-dlp-is-guest-membership-provider"
2. Verify the JWKS endpoint is responding
3. Check AuthZ service health
4. If key rotation issue → escalate to Nicolas Miel (dev SME)
5. Force ECS restart if JWKS keys are cached stale in-memory

---

### Issue: Redis cache unavailable

**Symptoms:** Increased response times on membership lookups. Higher than normal call volume to Disney+ API. Possible rate limiting from Disney+.

**Root Cause:** Redis ElastiCache node failure, connection pool exhaustion, or network issue.

**Resolution:**
1. Check Grafana "DLP Digital - PROD - Mobile Back-End Databases" for Redis health
2. Service should continue operating without cache (direct Disney+ API calls) but with degraded performance
3. Monitor for Disney+ API rate limiting due to increased direct calls
4. If Redis node failed, AWS auto-recovery should kick in — monitor ElastiCache console

---

### Issue: MariaDB connection failure

**Symptoms:** Health check deep failing. Membership data not being persisted. New guest lookups may still work (via Disney+ API) but historical data unavailable.

**Root Cause:** RDS instance unhealthy, connection pool exhaustion, or credentials rotated.

**Resolution:**
1. Check RDS console: `dlp-is-guest-membership-mariadb-prod` (eu-west-1)
2. Check Grafana "DLP Digital - PROD - Mobile Back-End Databases"
3. Verify Splunk logs for connection errors
4. If connection pool exhaustion → restart ECS service
5. If RDS instance issue → escalate to DLP Cloud Ops (DLP.DL-IS.CLOUD.OPS@disney.com)

---

### Issue: Discounts not applied for valid Disney+ subscribers

**Symptoms:** Specific guests not receiving their Disney+ discount during booking despite active subscription.

**Root Cause:** Stale Redis cache with old subscription status, SWID mismatch, or Disney+ API returning incorrect data for specific account.

**Resolution:**
1. Verify guest SWID is correct in the request
2. Check if Redis cache has stale data for this guest (TTL may not have expired)
3. If single guest: may need cache invalidation for that SWID
4. If widespread: check Disney+ API response for subscription verification endpoint
5. Escalate to Disney+ team if their API returns incorrect subscription status

---

## Escalation Decision Tree

- If Disney+ API fully down → contact DEE Technology Activation-3pp / dee2supportcenter Slack
- If JWKS/auth issues → escalate to Nicolas Miel (dev SME)
- If infrastructure (ECS/RDS/Redis) → escalate to DLP Cloud Ops
- If frontend integration issues → escalate to DGE Mobile APP team
- If discounts not applied (business logic) → escalate to Aurelie Zandonella Calleghe (PO)

## Known Quirks

- Application has very few to no downtime historically
- Disney+ was the first membership integration; additional membership types are being added
- No front-end test cases exist for this application
- No automated tests exist — testing done via Postman collection (`wdpr-dlp-is-guest-membership-provider`)
- Stage environment has a specific D+ test account (documented in Xray/qTest)
