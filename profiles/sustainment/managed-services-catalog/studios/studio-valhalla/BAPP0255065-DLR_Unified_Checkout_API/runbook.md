# DLR Unified Checkout API — Runbook

## Service Recovery

### Restart ECS tasks
1. AWS Console → ECS → Cluster: dlr-ecommerce-S0001477-usw2-prd → Service: uc-api-prod-live
2. Update service → Force new deployment
3. Monitor task drain and validate health check

## Scaling

| Parameter | Value |
|-----------|-------|
| Desired Count | 15 |
| PACE Configured | Yes |
| Schedule Start | 06:00 EST |
| Schedule End | 03:00 EST |
| Region | West2 (us-west-2) |

- **Scale up:** Adjust desired count in ECS or update PACE policy
- **Scale down:** PACE handles nightly scale-down automatically

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Monitor via Grafana PACE dashboard
