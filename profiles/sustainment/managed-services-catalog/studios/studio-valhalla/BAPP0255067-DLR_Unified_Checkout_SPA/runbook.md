# DLR Unified Checkout SPA — Runbook

## Service Recovery

### Restart ECS tasks
1. AWS Console → ECS → Cluster: dlr-ecommerce-S0001477-usw2-prd → Service: uc-spa-prod-live
2. Update service → Force new deployment

### Scale up
1. Same path → Update desired count
2. Monitor via Grafana PACE dashboard
