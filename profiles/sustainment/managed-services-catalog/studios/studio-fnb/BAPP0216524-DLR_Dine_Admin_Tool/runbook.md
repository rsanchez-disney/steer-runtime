# Runbook — DLR Dine Admin Tool

## Restart Procedures

1. AWS Console → ECS → Cluster: dlr-revmgmt-S0001535-usw2-prd
2. Restart: dineadmintool-svc-prod-live, dineadmintool-api-prod-live, dineadmintool-ui-prod-live
3. "Update service" → "Force new deployment"

**Validation:**
- Config Service: `https://dineadmintool-dlr.wdprapps.disney.com/dine-self-checkin-config-service/api/v1/healthcheck`
- Admin API: `https://dineadmintool-dlr.wdprapps.disney.com/dine-admin-tool/api/v1/healthcheck`
- Admin UI: `https://dineadmintool-dlr.wdprapps.disney.com/healthcheck`

---

## Scaling

- **Scale up:** Increase ECS desired count.
- **Scale down:** Can run single task.

## Failover

- RDS MariaDB handles AZ failover

## Rollback

- Harness/Rundeck rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| DLR DiSCO | prd-global-fnb | Config changes not propagating |
