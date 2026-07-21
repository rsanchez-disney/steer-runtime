# Troubleshooting — WDW Dine Plan Middleware

## Common Issues

### Issue: DDP redemption failures

**Symptoms:** Guests with Dining Plan cannot use credits for mobile orders

**Root Cause:** Reservation Entitlement service unreachable or validation logic failure

**Resolution:**
1. Check MOO health check (DDP component in show-all response)
2. Splunk: check for entitlement-related errors in MOO logs
3. Escalate to web-global-ddp-eas if persistent

---

## Escalation Decision Tree

- If entitlement validation → web-global-ddp-eas
- If MOO integration → prd-global-fnb

## Known Quirks

- DDP rules change seasonally — validation logic may need updates
