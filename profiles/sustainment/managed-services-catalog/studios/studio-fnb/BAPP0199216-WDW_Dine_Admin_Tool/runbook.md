# Runbook — WDW Dine Admin Tool

## Restart Procedures

1. AWS Console → ECS → Cluster: wdpr-revmgmt-S0001422-use1-prd
2. Restart each service: dineadmintool-svc-prod-live, dineadmintool-api-prod-live, dineadmintool-ui-prod-live
3. "Update service" → "Force new deployment"

**Validation:**
- Config Service: `https://dineadmintool.wdprapps.disney.com/dine-self-checkin-config-service/api/v1/healthcheck`
- Admin API: `https://dineadmintool.wdprapps.disney.com/dine-admin-tool/api/v1/healthcheck`
- Admin UI: `https://dineadmintool.wdprapps.disney.com/healthcheck`

---

## Scaling

- **Scale up:** Increase ECS desired count. Internal tool — minimal scaling needed.
- **Scale down:** Can run single task.

## Failover

- RDS MariaDB handles AZ failover

## Rollback

- Harness/Rundeck rollback to previous task definition

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| DiSCO service | prd-global-fnb | If config changes not propagating |
