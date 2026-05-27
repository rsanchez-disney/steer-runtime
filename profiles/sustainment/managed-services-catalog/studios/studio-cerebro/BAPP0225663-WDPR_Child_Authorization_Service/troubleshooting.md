# Troubleshooting — WDPR Child Authorization Service

## Common Issues

### Issue: PRIVO consent verification failures

**Symptoms:** Parents unable to authorize child accounts. Consent flow returns errors or times out.

**Root Cause:** PRIVO external service unavailable or responding with errors.

**Resolution:** Check PRIVO service status (external vendor). Verify network connectivity to PRIVO endpoints. Check Vault secrets for PRIVO API credentials. Escalate to PRIVO support if their service is down.

---

### Issue: Child profile data unavailable

**Symptoms:** Child account details/profile cannot be retrieved. 500 errors on child profile endpoints.

**Root Cause:** Service unable to connect to data store or internal dependency failure.

**Resolution:** Check ECS task health. Verify Vault secrets are accessible. Check service logs for connection errors.

---

### Issue: Health check failures

**Symptoms:** ALB health checks failing at /child-auth-svc/healthcheck.

**Root Cause:** Service startup failure, Vault secret rotation, or dependency connectivity issue.

**Resolution:** Check ECS task logs. Verify Vault paths are accessible (secret/gam2/child-auth/svc-ha/us-east-1/prod). Force new deployment if tasks are stuck.

---

## Escalation Decision Tree

- If PRIVO external service down → contact PRIVO support (external vendor), notify Andrew Southwick
- If service completely down in both regions → escalate to Andrew Southwick / Martin Uribe immediately
- If COPPA compliance at risk → escalate to Glenn Raposo (Manager) — regulatory risk
- If child auth flow broken in SPA → escalate to Profile SPA team (Gino Caverzan)

## Known Quirks

- PRIVO is an external vendor dependency — outages are outside Disney's control
- Internal accessibility only — not directly accessible from public internet
- COPPA compliance is a regulatory requirement — outages carry legal risk
- Low traffic service compared to B2C/VAS but high business criticality due to compliance
- AppDynamics uses separate tiers: core-child-auth-svc-ha-east / core-child-auth-svc-ha-west
