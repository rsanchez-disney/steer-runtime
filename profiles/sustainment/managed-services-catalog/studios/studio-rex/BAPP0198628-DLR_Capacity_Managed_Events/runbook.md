# Runbook — DLR Capacity Managed Events

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

All DLR CME components are PACE-configured (08:00 EST – 05:00 EST next day):

| Component | Desired Count | PACE | Schedule | Region |
|-----------|--------------|------|----------|--------|
| CME Retrieval | 40 | Yes | 08:00–05:00 EST | West2 |
| CME Eligibility | 30 | Yes | 08:00–05:00 EST | West2 |
| CME Availability | 30 | Yes | 08:00–05:00 EST | West2 |
| CME Reservation | 20 | Yes | 08:00–05:00 EST | West2 |

- **Scale up:** Adjust desired count in ECS or update PACE policy for the target component
- **Scale down:** PACE handles nightly scale-down automatically

## Failover

- CME components are single-region (West2). No cross-region failover configured.
- If a component is unhealthy, restart via ECS force new deployment.

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Validate health checks and Splunk error rates

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| eGalaxy DLR | app-cadlr-galaxy | Entitlement/penalty issues |
| CME Backend | app-global-cme | Reservation 500 errors |
