# Runbook — WDW Dine Plan Middleware

## Restart Procedures

1. Follow standard ECS restart procedure for the service
2. "Update service" → "Force new deployment" → Update

**Validation:**
- Verify MOO health check passes (DDP validation in health response)
- Monitor Splunk for DDP-related errors

---

## Scaling

- **Scale up:** Aligned with MOO scaling.
- **Scale down:** Follows MOO patterns.

## Failover

- Part of MOO service flow

## Rollback

- Standard Harness/Rundeck rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Dine Plan (EAS) | web-global-ddp-eas | DDP entitlement validation issues |
| Reservation Entitlement | web-global-ddp-eas | Coupon charge processing failures |
