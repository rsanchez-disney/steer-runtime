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
