# Runbook — WDW UC SPA

## Health Check

- Grafana: https://sid.disney.com/grafana/d/6cRDMP8nz/atlas-observability-metrics-ecs?orgId=1&var-Environment=prod&var-Account=wdpr-ecommerce-prod&var-Region=us-east-1&var-clusters=wdw-ecommerce-S0001479-use1-prd&var-service=uc-spa-prod-live
- AppDynamics: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=680&component=306086&dashboardMode=force&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60

## Restart Procedures

1. AWS Console → ECS → Cluster: wdw-ecommerce-S0001479-use1-prd → Service: uc-spa-prod-live
2. Update service → Force new deployment
3. Monitor task drain and validate via Grafana

## Scaling

| Parameter | Value |
|-----------|-------|
| Desired Count | 15 |
| PACE Configured | Yes |
| Schedule Start | 04:00 EST |
| Schedule End | 01:00 EST |
| Region | East (us-east-1) |

- **Scale up:** Adjust desired count in ECS or update PACE policy
- **Scale down:** PACE handles nightly scale-down automatically

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Validate via Grafana and AppDynamics dashboards
