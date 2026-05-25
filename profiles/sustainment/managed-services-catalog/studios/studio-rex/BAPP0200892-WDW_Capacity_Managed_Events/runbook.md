# Runbook — WDW Capacity Managed Events

## Restart Procedures

1. Identify the target component's ECS service (see scaling table for cluster details)
2. Force new deployment:
   ```bash
   aws ecs update-service --cluster <cluster> --service <service> --force-new-deployment
   ```
3. Monitor task drain and validate health checks return 200

**Validation:** Confirm all component health checks pass and Splunk error rate is stable.

---

## Scaling

All WDW CME components are PACE-configured (04:00–01:00 EST):

| Component | Desired Count | PACE | Schedule | Region |
|-----------|--------------|------|----------|--------|
| CME Retrieval | 60 | Yes | 04:00–01:00 EST | East |
| CME Eligibility | 40 | Yes | 04:00–01:00 EST | East |
| CME Availability | 40 | Yes | 04:00–01:00 EST | East |
| CME Reservation | 20 | Yes | 04:00–01:00 EST | East |

- **Scale up:** Adjust desired count in ECS or update PACE policy for the target component
- **Scale down:** PACE handles nightly scale-down automatically

## Failover

- CME components are single-region (East). No cross-region failover configured.
- If a component is unhealthy, restart via ECS force new deployment.

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Validate health checks and Splunk error rates

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| GAM WDW | | Entitlement issues |
| CME Backend | app-global-cme | Reservation 500 errors |
