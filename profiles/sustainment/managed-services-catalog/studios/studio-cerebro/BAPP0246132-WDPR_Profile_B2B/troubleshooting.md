# Troubleshooting — WDPR Profile B2B

## Common Issues

### Issue: Aggregated-profile endpoint returning 500

**Symptoms:** Internal consumers reporting failures retrieving aggregated profile data. 500 errors in Splunk.

**Root Cause:** Downstream dependency (B2C, OneID, GAM) unavailable or service internal error.

**Resolution:** Check Splunk logs: `index=wdpr-gam "ids.app"="us-east-1-profile-b2b-service" level>=40`. Identify failing downstream service. Check B2C and OneID health.

---

### Issue: Service token authentication failures

**Symptoms:** 401/403 errors from downstream consumers. Service-to-service calls rejected.

**Root Cause:** Service token expired, Vault secret rotation, or OneID authentication issue.

**Resolution:** Verify Vault secrets at secret/gam/profile/b2b-svc/us-east-1/prod. Check OneID service health. Force new deployment to pick up rotated secrets.

---

### Issue: Health check failures

**Symptoms:** ALB health checks failing at /profile-b2b/v1/bb8/status/summary.

**Root Cause:** Service startup failure, dependency connectivity issue, or Vault access problem.

**Resolution:** Check ECS task logs. Verify Vault paths are accessible. Force new deployment if tasks are stuck.

---

## Escalation Decision Tree

- If aggregated-profile endpoint down → check B2C health first, then escalate to Andrew Southwick
- If authentication failures → check Vault secrets and OneID, escalate to Andrew Southwick
- If both regions down → escalate to Andrew Southwick / Zachary Boone immediately
- If downstream consumers cascading → notify Glenn Raposo (Manager) for coordination

## Known Quirks

- Internal-only access — no direct guest-facing impact unless downstream services cascade
- Uses S-prefixed BAPP ID in cluster names (S0246132) instead of B-prefix
- Replacement for legacy BAPP0054836
- Medium severity — impact is indirect through downstream service failures
- Also logs to `wdpr_profile_ui` index via FluentBit (source: `*profile-b2b*`)

## ⚠️ FIRST: Check Banned Guest (Axis)
Before any investigation — search SWID in [Axis](https://axis.disney.network). If "Experience Access Restriction" → resolve as Working as Designed (NEVER inform guest).

## Splunk Dashboards

- **Splunk PROD:** https://splunk.wdprapps.disney.com (index: `wdpr-gam`)

## Investigation Queries

### Errors (level >= 40)
```spl
index=wdpr-gam "ids.app"="us-east-1-profile-b2b-service" level>=40 earliest=-1h
```

### 5XX Errors
```spl
index=wdpr-gam "ids.app"="*profile-b2b*" msg.code>=500 environment=prod earliest=-1h | stats count by msg.code, msg.path | sort -count
```

### Volume Timechart (24h)
```spl
index=wdpr-gam "ids.app"="*profile-b2b*" environment=prod earliest=-24h | timechart span=1h count
```

### FluentBit Logs (alternative index)
```spl
index=wdpr_profile_ui source="*profile-b2b*" earliest=-1h | stats count by source | sort -count
```

### FluentBit Errors
```spl
index=wdpr_profile_ui source="*profile-b2b*" ("error" OR "warn" OR "504" OR "failed") earliest=-1h | stats count by source | sort -count
```

### Current Hour vs Previous Hour
```spl
index=wdpr-gam "ids.app"="*profile-b2b*" environment=prod level>=40 earliest=-1h | stats count as current_errors | appendcols [search index=wdpr-gam "ids.app"="*profile-b2b*" environment=prod level>=40 earliest=-2h latest=-1h | stats count as previous_hour_errors]
```

## Reassignment Groups (Routing)

| Pattern | Assignment Group |
|---------|-----------------|
| OneID / Login / OTP | Jira IDY-* (NOT ServiceNow) |
| Akamai / Edge / DNS / 502s | ops-global-parks-se-guestexp |
| Disney CAST L4 escalation | app-global-cerebro |
| AWS Infrastructure | ops-global-parks-se-guestexp |
