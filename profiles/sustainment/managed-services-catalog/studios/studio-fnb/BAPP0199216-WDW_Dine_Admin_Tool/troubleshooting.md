# Troubleshooting — WDW Dine Admin Tool

## Common Issues

### Issue: Admin UI not loading

**Symptoms:** Cast members cannot access dineadmintool.wdprapps.disney.com

**Root Cause:** ECS task unhealthy or Akamai routing issue

**Resolution:**
1. Check all 3 health endpoints (svc, api, ui)
2. Restart unhealthy service via ECS force deployment
3. Check CloudWatch logs for specific errors

---

### Issue: Config changes not propagating to DiSCO

**Symptoms:** Admin saves config but DiSCO service doesn't reflect changes

**Root Cause:** Config sync delay or DiSCO cache not refreshing

**Resolution:**
1. Verify config was saved (check RDS directly if needed)
2. DiSCO may need cache refresh — restart DiSCO service if urgent

---

## Escalation Decision Tree

- If UI issue → restart dineadmintool ECS services
- If config propagation → check DiSCO service health

## Known Quirks

- Internal tool — operations team impacted, not guests directly
