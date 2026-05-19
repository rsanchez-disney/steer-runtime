# DLR Order Service — Runbook

## Service Recovery

### Restart ECS tasks
1. AWS Console → ECS → Cluster: paap-d-prod → Service: order-service-prod-live
2. Update service → Force new deployment

### Scale up
1. Same path → Update desired count
2. Monitor via Grafana PACE dashboard
