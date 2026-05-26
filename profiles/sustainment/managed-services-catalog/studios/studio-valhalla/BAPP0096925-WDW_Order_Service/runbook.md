# Runbook — WDW Order Service

Source: [UC - Order Service WDW Runbook](https://confluence.disney.com/spaces/WDPROS/pages/691604358/UC+-+Order+Service+WDW+Runbook)

## Source Code & CI/CD

| Item | URL |
|------|-----|
| Repository | https://github.disney.com/wdprt-paap-api/order-service |
| Jenkins | https://ee.cicd.wdprapps.disney.com/job/order-service/ |
| SonarQube | https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdat.api%3Aorder-svc |
| JMeter Scripts | https://github.disney.com/PE/PE_Scripts/tree/master/Mobile/UnifiedCheckout/WDW |
| API Docs | https://order-svc-wdw.wdprapps.disney.com/api/api-docs?url=/api/openapi.json |

## AppDynamics

- Latest (2198): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2198&component=5992937&dashboardMode=grid
- Stage (2308): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2308&component=6336554&dashboardMode=grid
- Load (2371): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2371&component=6401342&dashboardMode=grid
- Production (494): https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=494&component=306093&dashboardMode=grid

## ECS Clusters

Region: us-east-1

| Environment | Cluster |
|-------------|---------|
| Latest | paap-d-latest |
| Stage | paap-d-stage |
| Load | paap-d-load |
| Production | paap-d-prod |

## Health Check Endpoints

| Environment | URL |
|-------------|-----|
| Latest | https://latest.order-svc-wdw.wdprapps.disney.com/application/health |
| Stage | https://stage.order-svc-wdw.wdprapps.disney.com/application/health |
| Load | https://load.order-svc-wdw.wdprapps.disney.com/application/health |
| Production | https://order-svc-wdw.wdprapps.disney.com/application/health |

## Redis (ElastiCache)

| Environment | Redis ID |
|-------------|----------|
| Latest | order-latest |
| Stage | order-stage |
| Load | order-load |
| Production | order-prod |

## Splunk

```
index=wdpr_core_api source=*:order-service*
```

Alarms recipient: WDAT.DL-sustainmentstudios@disney.com

## Restart Procedures

1. AWS Console → ECS → Cluster: `paap-d-prod` → Service: order-service-prod-live
2. Update service → Force new deployment
3. Monitor task drain and validate health check returns 200

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
- Validate health check and Grafana metrics

## Known Gaps

- Unit test coverage at 70% (below 80% threshold)
- Not showing in SonarQube portfolio
