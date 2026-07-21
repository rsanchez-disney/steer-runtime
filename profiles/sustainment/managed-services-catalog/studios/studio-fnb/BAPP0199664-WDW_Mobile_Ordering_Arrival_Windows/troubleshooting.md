# Troubleshooting — WDW Mobile Ordering Arrival Windows

## Common Issues

### Issue: No available arrival windows showing

**Symptoms:** Guests see "no available times" for WDW locations

**Root Cause:** Missing attendance configuration or service down

**Resolution:**
1. Check health: `https://wdwarrw-svc.wdprapps.disney.com/arrival-window-service/healthcheck`
2. Check Splunk alerts: "WDW Arrival Windows Service Missing Attendance Configuration"
3. Verify RDS connectivity (wdw-arrivalwindow-prod-master.wdatdbs.disney.com)

---

### Issue: Cross-region failover needed

**Symptoms:** Primary region (us-east-1) unavailable

**Root Cause:** Regional AWS issue

**Resolution:**
1. RDS has cross-region replica in us-west-2
2. DR activation requires senior leadership approval

---

## Escalation Decision Tree

- If service down → restart ECS, check RDS
- If DR needed → Ryan Purdy (Director) approval
- If P1/P2 → DTOC bridge

## Known Quirks

- Cross-region RDS replica is read-only — full DR requires promotion
