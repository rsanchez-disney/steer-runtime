# Troubleshooting — DLP Mobile API Gateway

## Common Issues

### Issue: API Gateway returning 5xx errors

**Symptoms:** Multiple downstream services failing simultaneously. Mobile app unable to reach any backend.

**Root Cause:** AWS API Gateway infrastructure issue.

**Resolution:** Escalate immediately to Cloud OPS (ops-frdlp-cloudops). Dev/support does NOT touch infrastructure.

---

### Issue: Authentication/authorization failures

**Symptoms:** Clients receiving 401/403 errors. Valid tokens being rejected.

**Root Cause:** API Gateway auth configuration issue or token validation service degradation.

**Resolution:** Escalate to Cloud OPS. Verify if issue is gateway-level or downstream service-level.

---

### Issue: Rate limiting / throttling

**Symptoms:** Clients receiving 429 Too Many Requests. Specific endpoints being throttled.

**Root Cause:** Rate limit thresholds exceeded, possibly due to traffic spike or misconfiguration.

**Resolution:** Escalate to Cloud OPS for rate limit adjustment if legitimate traffic.

---

### Issue: Specific route failing while others work

**Symptoms:** One or more API routes returning errors while the rest of the gateway is healthy.

**Root Cause:** Downstream microservice issue, not gateway itself.

**Resolution:** Identify which downstream service is failing. Troubleshoot that specific BAPP. Gateway is likely healthy.

---

## Escalation Decision Tree

- If gateway-wide issue (all routes) → escalate to Cloud OPS (ops-frdlp-cloudops) immediately
- If specific route failing → troubleshoot the downstream microservice
- If auth issues → Cloud OPS
- If rate limiting → Cloud OPS for threshold review
- **Dev/support does NOT touch infrastructure**

## Known Quirks

- This is a shared infrastructure component managed entirely by Cloud OPS
- Any gateway-level change requires Cloud OPS involvement
- Single point of entry — gateway issues cascade to ALL services
