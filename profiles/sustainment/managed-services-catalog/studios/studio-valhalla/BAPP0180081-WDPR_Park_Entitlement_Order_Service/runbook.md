# Runbook — PEOS (Park Entitlement Order Service)

Sources:
- [UC - PEOS WDW - Runbook](https://confluence.disney.com/spaces/WDPROS/pages/691602159/UC+-+PEOS+WDW+-+Runbook)
- [UC - PEOS DLR - Runbook](https://confluence.disney.com/spaces/WDPROS/pages/691604408/UC+-+PEOS+DLR+-+Runbook)

## Source Code & CI/CD

| Item | URL |
|------|-----|
| Repository | https://github.disney.com/wdprt-paap-api/wdpr-park-entitlement-order-service |
| Jenkins | https://ee.cicd.wdprapps.disney.com/job/wdpr-park-entitlement-order-service |
| SonarQube | https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdat.api%3Apark-entitlement-order-svc |
| JMeter Scripts | https://github.disney.com/PE/PE_Scripts/tree/master/Mobile/UnifiedCheckout/WDW |

## AppDynamics — WDW (us-east-1)

- Latest (3994): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=3994&component=7458661
- Stage (4094): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=4094&component=7459189
- Load (4125): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=4125&component=7459284
- Production (825): https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=825&component=306759

## AppDynamics — DLR (us-west-2)

- Production (826): https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=826&component=306761

## ECS Clusters

### WDW (us-east-1)
| Environment | Cluster |
|-------------|---------|
| Latest | wdw-ecommerce-S0001479-use1-lst |
| Stage | wdw-ecommerce-S0001479-use1-stg |
| Load | wdw-ecommerce-S0001479-use1-lod |
| Production | wdw-ecommerce-S0001479-use1-prd |

### DLR (us-west-2)
| Environment | Cluster |
|-------------|---------|
| Latest | dlr-ecommerce-S0001477-usw2-lst |
| Stage | dlr-ecommerce-S0001477-usw2-stg |
| Load | dlr-ecommerce-S0001477-usw2-lod |
| Production | dlr-ecommerce-S0001477-usw2-prd |

## Version / Health Endpoints

### WDW
| Environment | URL |
|-------------|-----|
| Latest | https://latest.peos-wdw.wdprapps.disney.com/version |
| Stage | https://stage.peos-wdw.wdprapps.disney.com/version |
| Load | https://load.peos-wdw.wdprapps.disney.com/version |
| Production | https://peos-wdw.wdprapps.disney.com/version |

### DLR
| Environment | URL |
|-------------|-----|
| Latest | https://latest.peos-dlr.wdprapps.disney.com/version |
| Stage | https://stage.peos-dlr.wdprapps.disney.com/version |
| Load | https://load.peos-dlr.wdprapps.disney.com/version |
| Production | https://peos-dlr.wdprapps.disney.com/version |

## Redis (ElastiCache)

| Environment | Redis ID |
|-------------|----------|
| Latest | peos-svc-latest |
| Stage | peos-svc-stage |
| Load | peos-svc-load |
| Production | peos-svc-prod |

## Splunk

```
index=wdpr_peos
```

Alarms recipient: WDAT.DL-sustainmentstudios@disney.com

## Restart Procedures

### WDW
```bash
aws ecs update-service --cluster wdw-ecommerce-S0001479-use1-prd --service peos-svc-prod-live --force-new-deployment --region us-east-1
```

### DLR
```bash
aws ecs update-service --cluster dlr-ecommerce-S0001477-usw2-prd --service peos-svc-prod-live --force-new-deployment --region us-west-2
```

Validate version endpoint returns 200 after restart.

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Validate version endpoint and Splunk logs

## Known Gaps

- Unit test coverage below 80% threshold
- API documentation: TODO
