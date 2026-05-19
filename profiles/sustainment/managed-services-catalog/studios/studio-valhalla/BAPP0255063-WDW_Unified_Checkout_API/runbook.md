# WDW Unified Checkout API — Runbook

## Service Recovery

### Restart ECS tasks
1. AWS Console → ECS → Cluster: wdw-ecommerce-S0001479-use1-prd → Service: uc-api-prod-live
2. Update service → Force new deployment

### Scale up
1. Same path → Update desired count
2. Monitor via Grafana PACE dashboard
