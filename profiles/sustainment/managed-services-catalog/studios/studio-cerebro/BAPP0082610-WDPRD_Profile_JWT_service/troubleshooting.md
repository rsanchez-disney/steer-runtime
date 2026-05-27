# Troubleshooting — WDPRD Profile JWT service

## Common Issues

### Issue: JWT token generation fails

**Symptoms:** AuthenticatorJS cannot complete login flow. All authenticated features break. Users stuck on login page.

**Root Cause:** Service unhealthy, DynamoDB throttling, or network connectivity to downstream services.

**Resolution:**
1. Check health check: use1.profile-jwt-ha.gam-prod.wdprapps.disney.com/jwt-service/api/v1/healthcheck
2. Check AppDynamics: core_profile-jwt-ha-east / core_profile-jwt-ha-west
3. Check DynamoDB CloudWatch metrics for throttling
4. If service unhealthy, force new ECS deployment

---

### Issue: Session validation failures

**Symptoms:** Authenticated API calls rejected with 401/403. Users logged out unexpectedly.

**Root Cause:** Token expiry, DynamoDB read failures, or token corruption.

**Resolution:**
1. Check Splunk: index=wdpr-gam ids.app="*profile-jwt*" environment=prod level>=40
2. Verify DynamoDB table health
3. If widespread, check if deployment introduced token format changes

---

## Escalation Decision Tree

- If JWT health check fails in both regions → P1, escalate to Andrew Southwick immediately
- If isolated to one region → monitor, Route 53 should failover automatically
- If DynamoDB throttling → check CloudWatch, consider increasing capacity
- If AuthenticatorJS reports JWT failures → verify JWT service health first, then escalate to Cesar Munoz

## Known Quirks

- AppDynamics names differ between environments: lower envs use "core-jwt-gam-svc-ha-east/west", prod uses "core_profile-jwt-ha-east/west"
- Service uses Node.js 16 (not yet migrated to Node.js 20 like other services)
