# Troubleshooting — WDPRD Preference Admin

## Common Issues

### Issue: Cannot access Preference Admin

**Symptoms:** Cast Members unable to log in or access the admin tool.

**Root Cause:** OneID Cast Member authentication failure or service unavailability.

**Resolution:**
1. Verify OneID health for Cast Member auth
2. Check if ECS service is running
3. If Preference Service (BAPP0170520) is down, admin tool will not function

---

### Issue: Preference data not loading

**Symptoms:** Admin tool loads but preference data is empty or errors.

**Root Cause:** Preference Service (BAPP0170520) backend failure.

**Resolution:**
1. Check Preference Service health
2. Check Redis cache health (Preference Service uses ElastiCache Redis)
3. Escalate to Andrew Southwick (andrew.southwick@disney.com) if Preference Service is down

---

### Issue: Akamai 502 errors

**Symptoms:** 502 Bad Gateway when accessing the admin tool.

**Root Cause:** Origin not responding or Akamai routing misconfigured.

**Resolution:**
1. Translate Akamai error string at https://control.akamai.com/apps/edge-diagnostics/#/home
2. If origin down → check ECS task health
3. If routing issue → create ServiceNow INC for ops-global-parks-se-guestexp

---

## Escalation Decision Tree

- If Cast Member auth fails → check OneID health, escalate to IDY Jira
- If preference data not loading → check Preference Service (BAPP0170520) health
- If service completely down → escalate to Gino Caverzan (gino.x.caverzan.-nd@disney.com)
- LOW severity — internal tool only, no guest-facing impact

## Known Quirks

- Internal tool only — no guest-facing impact (LOW severity)
- Backend entirely dependent on Preference Service (BAPP0170520)
- Angular 18 frontend
- Tech Lead (from Team/Contacts): Gino Caverzan owns Preference Admin

## ⚠️ FIRST: Check Banned Guest (Axis)
Before any investigation — search SWID in [Axis](https://axis.disney.network). If "Experience Access Restriction" → resolve as Working as Designed (NEVER inform guest).

## Reassignment Groups (Routing)

| Pattern | Assignment Group |
|---------|-----------------|
| OneID / Login / OTP | Jira IDY-* (NOT ServiceNow) |
| Akamai / Edge / DNS / 502s | ops-global-parks-se-guestexp |
| Disney CAST L4 escalation | app-global-cerebro |
| AWS Infrastructure | ops-global-parks-se-guestexp |
