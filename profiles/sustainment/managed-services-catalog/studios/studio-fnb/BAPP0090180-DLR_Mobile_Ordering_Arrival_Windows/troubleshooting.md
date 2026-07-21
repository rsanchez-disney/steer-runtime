# Troubleshooting — DLR Mobile Ordering Arrival Windows

## Common Issues

### Issue: No available arrival windows showing

**Symptoms:** Guests see "no available times" when trying to order

**Root Cause:** Missing attendance configuration or service down

**Resolution:**
1. Check health: `https://dlrarrw-svc.wdprapps.disney.com/arrival-window-service/healthcheck`
2. Check Splunk alerts: "DLR Arrival Windows Service Missing Attendance Configuration"
3. Verify RDS connectivity (dlr-arrivalwindow-prod-master.wdatdbs.disney.com)
4. Check if location has attendance config in admin UI

---

### Issue: Overbooking / long wait at pickup

**Symptoms:** Too many orders in same window, guests waiting

**Root Cause:** Window sizing too large for location capacity

**Resolution:**
1. Adjust via Arrival Windows Admin UI
2. Check historical data for capacity patterns

---

## Escalation Decision Tree

- If service down → restart ECS, check RDS
- If configuration missing → operations team to add attendance config
- If P1/P2 → DTOC bridge

## Known Quirks

- Attendance configuration must be set per location — missing config = no windows
