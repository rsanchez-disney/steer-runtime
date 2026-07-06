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
3. Escalate to Andrew Southwick if Preference Service is down

---

## Escalation Decision Tree

- If Cast Member auth fails → check OneID health, escalate to IDY Team
- If preference data not loading → check Preference Service (BAPP0170520) health
- If service completely down → escalate to Gino Caverzan (Tech Lead)
- LOW severity — internal tool only, no guest-facing impact

## Known Quirks

- Internal tool only — no guest-facing impact (LOW severity)
- Minimal documentation available on Confluence Cloud for this service
- Backend entirely dependent on Preference Service (BAPP0170520)
