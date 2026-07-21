# Runbook — WDPR Retail Tech Cloud Config Service

## Restart Procedures

1. Standard ECS restart: "Update service" → "Force new deployment"
2. Consumer services will reconnect to config server automatically

**Validation:**
- Consumer services can fetch configuration (check their health checks)
- No errors in service logs

---

## Scaling

- Low traffic — minimal scaling needed

## Failover

- Consumer services cache configs locally — brief outage tolerable

## Rollback

- Revert git config repository changes if bad configuration deployed

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Consumer services | prd-global-fnb | If services failing to get configs |
