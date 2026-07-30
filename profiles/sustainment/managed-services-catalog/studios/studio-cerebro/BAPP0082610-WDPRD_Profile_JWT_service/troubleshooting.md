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
1. Check Splunk: `index=wdpr-gam ids.app="*profile-jwt*" environment=prod level>=40`
2. Verify DynamoDB table health
3. If widespread, check if deployment introduced token format changes

---

### Issue: Akamai 502 errors

**Symptoms:** 502 Bad Gateway when calling JWT endpoints through Akamai.

**Root Cause:** Origin not responding, or Akamai routing misconfigured.

**Resolution:**
1. Translate Akamai error string at https://control.akamai.com/apps/edge-diagnostics/#/home
2. If origin down → check ECS task health
3. If routing issue → create ServiceNow INC for ops-global-parks-se-guestexp

---

## Escalation Decision Tree

- If JWT health check fails in both regions → P1, escalate to Andrew Southwick (andrew.southwick@disney.com) immediately
- If isolated to one region → monitor, Route 53 should failover automatically
- If DynamoDB throttling → check CloudWatch, consider increasing capacity
- If AuthenticatorJS reports JWT failures → verify JWT service health first, then escalate to Cesar Muñoz (Cesar.A.Munoz.Acevedo.-ND@disney.com)
- If Akamai/502 errors → create INC for ops-global-parks-se-guestexp

## Known Quirks

- AppDynamics names differ between environments: lower envs use "core-jwt-gam-svc-ha-east/west", prod uses "core_profile-jwt-ha-east/west"
- Platform is Node.js 20 (per BAPPID Services page)
- DynamoDB table (PROD): wdpr-gam-b0253435-prd-webapi (shared with Java WAM)

## Splunk Dashboards

- **Splunk PROD:** https://splunk.wdprapps.disney.com (index: `wdpr-gam`)

## Investigation Queries

### ⚠️ FIRST: Check Banned Guest (Axis)
Before any investigation — search SWID in [Axis](https://axis.disney.network). If "Experience Access Restriction" → resolve as Working as Designed (NEVER inform guest).

### Errors (level >= 40)
```spl
index=wdpr-gam ids.app="*profile-jwt*" environment=prod level>=40 earliest=-1h
```

### Error Rate by Endpoint
```spl
index=wdpr-gam ids.app="*profile-jwt*" environment=prod earliest=-1h | stats count by msg.code, msg.path | sort -count
```

### Latency by Endpoint
```spl
index=wdpr-gam ids.app="*profile-jwt*" environment=prod earliest=-1h | stats avg(response_time) as avg_rt, p95(response_time) as p95_rt by endpoint
```

### Volume Timechart (24h)
```spl
index=wdpr-gam ids.app="*profile-jwt*" environment=prod earliest=-24h | timechart span=1h count
```

### 5XX Errors
```spl
index=wdpr-gam ids.app="*profile-jwt*" environment=prod msg.code>=500 earliest=-1h | stats count by msg.code, msg.path | sort -count
```

### OneID Authentication Issues
```spl
index=oneid {SWID}
```

## Reassignment Groups (Routing)

| Pattern | Assignment Group |
|---------|-----------------|
| OneID / Login / OTP | Jira IDY-* (NOT ServiceNow) |
| Akamai / Edge / DNS / 502s | ops-global-parks-se-guestexp |
| Disney CAST L4 escalation | app-global-cerebro |
| AWS Infrastructure | ops-global-parks-se-guestexp |
