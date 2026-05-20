# Runbook — WDPR CME Admin

## Restart Procedures

1. Identify the target ECS cluster (DLR or WDW — see health checks below)
2. Force new deployment:
   ```bash
   aws ecs update-service --cluster <cluster> --service cme-admin --force-new-deployment
   ```
3. Monitor task drain and validate health check returns 200

**Validation:** Confirm health check endpoint returns 200 for the target region.

### Health Check

#### DLR
- URL: https://cme-admin-dlr.wdprapps.disney.com/admin/healthcheck
- ECS Cluster: dlr-ecommerce-S98628-usw2-prd

#### WDW
- URL: https://cme-admin-wdw.wdprapps.disney.com/admin/healthcheck
- ECS Cluster: wdw-ecommerce-S00892-use1-prd

---

## Scaling

CME Admin is a low-traffic internal tool — no PACE configuration needed.

| Region | Desired Count | PACE | Notes |
|--------|--------------|------|-------|
| DLR | 3 | No | Static — internal admin UI |
| WDW | 3 | No | Static — internal admin UI |

- **Scale up:** Manually increase desired count in ECS if needed during bulk config operations
- **Scale down:** Return to desired count of 3 after operations complete

## Failover

- CME Admin is non-critical (internal tool). No automated failover.
- If one region is down, use the other region's admin UI for configuration.

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Validate health check endpoint

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| CME Backend | app-global-cme | Configuration issues affecting reservations |
