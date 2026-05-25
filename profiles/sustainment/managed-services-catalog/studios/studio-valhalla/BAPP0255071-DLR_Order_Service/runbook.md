# Runbook — DLR Order Service

Source: [UC - Order Service DLR Runbook](https://confluence.disney.com/spaces/WDPROS/pages/691602150/UC+-+Order+Service+DLR+Runbook)

## Source Code & CI/CD

| Item | URL |
|------|-----|
| Repository | https://github.disney.com/wdprt-paap-api/order-service |
| Jenkins | https://ee.cicd.wdprapps.disney.com/job/order-service/ |
| SonarQube | https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdat.api%3Aorder-svc |
| JMeter Scripts | https://github.disney.com/PE/PE_Scripts/tree/master/Mobile/UnifiedCheckout/DLR |
| API Docs | https://order-svc-dlr.wdprapps.disney.com/api/api-docs?url=/api/openapi.json |

## AppDynamics

- Latest (2198): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2198&component=5992937&dashboardMode=grid
- Stage (2308): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2308&component=6336554&dashboardMode=grid
- Load (2371): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2371&component=6401342&dashboardMode=grid
- Production (494): https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=494&component=306093&dashboardMode=grid

Note: DLR shares AppD apps with WDW Order Service (same paap-d cluster).

## ECS Clusters

Region: us-east-1 (shared with WDW)

| Environment | Cluster |
|-------------|---------|
| Latest | paap-d-latest |
| Stage | paap-d-stage |
| Load | paap-d-load |
| Production | paap-d-prod |

## Health Check Endpoints

| Environment | URL |
|-------------|-----|
| Latest | https://latest.order-svc-dlr.wdprapps.disney.com/application/health |
| Stage | https://stage.order-svc-dlr.wdprapps.disney.com/application/health |
| Load | https://load.order-svc-dlr.wdprapps.disney.com/application/health |
| Production | https://order-svc-dlr.wdprapps.disney.com/application/health |

## Redis (ElastiCache)

Lowers in us-west-2, Prod in us-east-1:

| Environment | Redis ID | Region |
|-------------|----------|--------|
| Latest | order-latest | us-west-2 |
| Stage | order-stage | us-west-2 |
| Load | order-load | us-west-2 |
| Production | order-prod | us-east-1 |

## Splunk

```
index=wdpr_core_api source=*:order-service*
```

Alarms recipient: WDAT.DL-sustainmentstudios@disney.com

## Scaling

| Parameter | Value |
|-----------|-------|
| Desired Count | 15 |
| PACE Configured | Yes |
| Schedule Start | 06:00 EST |
| Schedule End | 03:00 EST |

- **Scale up:** Adjust desired count in ECS or update PACE policy
- **Scale down:** PACE handles scale-down automatically at 03:00 EST

## Restart Procedures

1. AWS Console → ECS → Cluster: `paap-d-prod` → Service: order-service-prod-live
2. Update service → Force new deployment
3. Monitor task drain and validate health check returns 200

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Validate health check and Splunk logs

## Known Gaps

- Unit test coverage at 70% (below 80% threshold)
- Not showing in SonarQube portfolio
- No DLR-specific load test results found
