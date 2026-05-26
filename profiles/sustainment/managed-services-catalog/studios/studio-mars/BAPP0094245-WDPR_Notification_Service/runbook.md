# Runbook — Notification Service

## Health Check

### DLR
- URL: https://dlrns.wdprapps.disney.com/notifysvc/info
- Grafana: https://sid.disney.com/grafana/d/6cRDMP8nz/atlas-observability-metrics-ecs?orgId=1&var-Environment=prod&var-Account=wdpr-apps&var-Region=us-west-2&var-clusters=dlr-commerce2-01323-prod&var-service=notifysvc-prod-live
- AppDynamics: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=447&component=3194&dashboardMode=force

### WDW
- URL: https://wdwns.wdprapps.disney.com/notifysvc/info
- Grafana: https://sid.disney.com/grafana/d/6cRDMP8nz/atlas-observability-metrics-ecs?orgId=1&var-Environment=prod&var-Account=wdpr-apps&var-Region=us-east-1&var-clusters=wdw-sales2-01323-prod&var-service=notifysvc-prod-live
- AppDynamics: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=447&component=307070&dashboardMode=force
