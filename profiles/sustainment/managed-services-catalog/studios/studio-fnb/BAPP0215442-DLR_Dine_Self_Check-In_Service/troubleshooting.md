# Troubleshooting — DLR Dine Self Check-In Service

## Common Issues

### Issue: Guests cannot check-in to reservations

**Symptoms:** App shows error when attempting check-in at DLR

**Root Cause:** Same as WDW DiSCO — DREAMS or DynamoDB issues

**Resolution:**
1. Check health: `https://dine-sci-svc-dlr.wdprapps.disney.com/svc/healthcheck`
2. Splunk: `index=wdpr_disco_dlr level=ERROR`
3. Check DynamoDB throttling in us-west-2

---

### Issue: Notifications not sending (DLR)

**Symptoms:** Guests don't receive check-in notifications

**Root Cause:** Automic job JOBS.WDPR_DINING.NOTIFY_DLR not running

**Resolution:**
1. Verify Automic job scheduled and running
2. Escalate to Automic admin or Shuri team

---

## Escalation Decision Tree

- If DREAMS issue → Dining reservations team
- If notifications → Automic admin + AJO/Shuri team
- If P1/P2 → DTOC bridge

## Known Quirks

- DLR has smaller dining capacity — walk-up list issues have immediate guest impact
- Same codebase as WDW but deployed independently
