# Troubleshooting — WDPR AuthenticatorJS

## Common Issues

### Issue: Login Loops (OneID V5 Trust State)

**Symptoms:** Users stuck in infinite login redirect. OneID V5 Trust State transitions failing. P1/P2 severity. Related BAPPs: 0248309, 0180489. Reference: INC28962695.

**Root Cause:** Token expiry or Trust State value mismatch between AuthenticatorJS and OneID.

**Resolution:**
1. Check AuthenticatorJS logs in Splunk: `index=wdpr-profile-ui Identifiers.App-Name="AuthenticatorJS" level>=40`
2. Verify OneID token expiry and Trust State value (use SWID in Cribl)
3. If widespread: check OneID service health
4. If isolated: clear user session and retry
5. Escalate to IDY Jira if OneID-side issue confirmed

---

### Issue: Aggressive Retry Policy — Cascading Failures

**Symptoms:** High error rates during OneID degradation. Multiple retries amplifying load.

**Root Cause:** No circuit breaker implemented (planned). AuthenticatorJS retries aggressively when OneID is slow/degraded.

**Resolution:**
1. Confirm OneID degradation via OneID team
2. If systemic, coordinate with OneID team for resolution
3. Circuit breaker is planned (Jira: GCXPWS-11168)

---

### Issue: Silent Failure Mode

**Symptoms:** No alerts fire but guests report login failures. Impact discovered only through guest complaints.

**Root Cause:** Static bundle on S3/Akamai has no healthcheck. No dedicated monitoring alerts (MAXIMUM RISK alert gap).

**Resolution:**
1. Manually verify S3 bundle accessibility
2. Check Splunk for error patterns
3. Needed: Synthetic monitoring of S3 bundle, cookie injection failure rate alerts (Jira: GCXPWS-11168)

---

## Escalation Decision Tree

- If login loops affecting multiple guests → P1, escalate to Cesar Munoz immediately
- If OneID-side issue confirmed → escalate to IDY Jira
- If S3/CDN issue → escalate to ops-global-parks-se-guestexp
- If JWT token generation failing → escalate to Andrew Southwick (Profile JWT Service)
- If isolated to single user → clear session, retry, close ticket

## Known Quirks

- No dedicated monitoring alerts — highest-risk gap in the ecosystem
- Root cause of #1 incident type (Login Loops — 45% of all incidents YTD)
- Impact is SILENT until multiple guests report
- V4 and V5 coexist — Universal Interface abstraction layer handles both
- Functional user WDPR-CICD-dpep-devops needed for S3/KMS access during deploys
