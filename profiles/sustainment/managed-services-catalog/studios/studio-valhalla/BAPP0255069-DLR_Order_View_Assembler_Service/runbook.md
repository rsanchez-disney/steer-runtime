# DLR Order View Assembler Service — Runbook

## Service Recovery

### Restart ECS tasks
1. AWS Console → ECS → Cluster: dlr-ecommerce-S0014867-usw2-prd → Service: order-vas-prod-live
2. Update service → Force new deployment

### Scale up
1. Same path → Update desired count
2. Monitor via Grafana PACE dashboard
