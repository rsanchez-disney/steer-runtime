# Troubleshooting — WDW Dine Self Check-In Service

## Common Issues

### Issue: Guests cannot check-in to reservations

**Symptoms:** App shows error when attempting check-in, high error rate in Splunk

**Root Cause:** DREAMS connectivity issue or DynamoDB throttling

**Resolution:**
1. Check health: `https://dine-sci-svc.wdprapps.disney.com/svc/healthcheck`
2. Splunk: `index=wdpr_disco level=ERROR`
3. Check DynamoDB throttling in CloudWatch
4. If DREAMS unreachable, escalate to Dining reservations team

---

### Issue: Wait times not updating

**Symptoms:** Walk-up list shows stale wait times or "unavailable"

**Root Cause:** Redis cache staleness or background calculation failures

**Resolution:**
1. Check Redis connectivity from ECS tasks
2. Monitor Splunk DiSCO dashboard for calculation errors
3. Service restart may resolve stale cache

---

### Issue: Notifications not sending (Ready-to-Check-In)

**Symptoms:** Guests don't receive push notifications to check-in

**Root Cause:** Automic job JOBS.WDPR_DINING.NOTIFY_WDW not running or AJO/Shuri failure

**Resolution:**
1. Verify Automic job is scheduled and running
2. Check AJO/Shuri notification delivery
3. Escalate to Automic admin or Shuri team

---

## Escalation Decision Tree

- If DREAMS issue → Dining reservations team
- If notifications → Automic admin + AJO/Shuri team
- If Redis/DynamoDB → check AWS infrastructure
- If P1/P2 → DTOC bridge

## Known Quirks

- DynamoDB has separate tables per environment (check correct env)
- WDW and DLR DiSCO are separate deployments — fix must be applied to both
