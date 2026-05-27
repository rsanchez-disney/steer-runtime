# Troubleshooting — WDPR Profile B2C

## Common Issues

### Issue: Downscaling Spikes (401/403 at Night) — P3

**Symptoms:** Brief 401/403 error spikes between 2-4 AM ET.

**Root Cause:** Expected behavior during nightly downscaling. Tasks being replaced cause brief authentication failures.

**Resolution:** No action needed. This is expected P3 behavior. Errors self-resolve within minutes.

---

### Issue: Cache-Control Headers

**Symptoms:** Stale data served to clients, or caching issues with profile responses.

**Root Cause:** Previously a bug with incorrect Cache-Control headers.

**Resolution:** Fixed in v3.0.2 (Mar 28, 2026). If still occurring, verify deployed version is >= 3.0.2.

---

### Issue: OneID GuestController failures

**Symptoms:** Profile get/set operations failing. 500 or 503 errors on profile endpoints.

**Root Cause:** OneID GuestController downstream dependency unavailable or timing out.

**Resolution:** Check OneID service health. Verify network connectivity to OneID. Escalate to OneID team if their service is down.

---

### Issue: Health check failures across both regions

**Symptoms:** Both us-east-1 and us-west-2 health endpoints returning non-200.

**Root Cause:** Service-wide issue — could be bad deployment, Vault secret rotation failure, or shared dependency down.

**Resolution:** Check recent deployments. Verify Vault secrets are accessible. Check shared dependencies (OneID, GAM).

---

## Escalation Decision Tree

- If 401/403 spikes at 2-4 AM ET → no action needed (expected P3 behavior)
- If OneID failures → escalate to OneID team
- If both regions down → escalate to Andrew Southwick / Zachary Boone immediately
- If Akamai routing issues → escalate to CDN/WAF team
- If data integrity issues → escalate to Glenn Raposo (Manager)

## Known Quirks

- Downscaling at night (2-4 AM ET) causes brief 401/403 spikes — expected, no action needed (P3)
- Cache-Control header bug fixed in v3.0.2 (Mar 28, 2026)
- All endpoints require GUEST tokens only — service-to-service calls should use B2B (BAPP0246132) instead
- Revenue-critical service — System of Record for guest profile data
- External accessibility via Akamai (profile-svcs.wdprapps.disney.com)
