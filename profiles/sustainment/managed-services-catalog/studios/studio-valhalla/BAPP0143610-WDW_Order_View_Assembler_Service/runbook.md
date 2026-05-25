# Runbook — WDW Order View Assembler Service (OrderVAS)

Source: [UC - OrderVAS WDW Runbook](https://confluence.disney.com/spaces/WDPROS/pages/691602155/UC+-+OrderVAS+WDW+Runbook)

## Source Code & CI/CD

| Item | URL |
|------|-----|
| Repository | https://github.disney.com/wdpro-peplite/ecommerce-order-vas-java-17 |
| Harness | https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDW_Order_View_Assembler_Service/pipelines |
| Rundeck | https://rundeck.wdprapps.disney.com/project/ecommerce-order-vas-java-17_aws/job/show/7bcbc6a0-e0f6-4316-950a-c4a8a28440e5 |
| SonarQube | https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdat.api%3Aecommerce-order-vas |
| JMeter Scripts | https://github.disney.com/PE/PE_Scripts/tree/master/Mobile/UnifiedCheckout/WDW |
| API Docs (WDW) | https://order-vas-r53-wdw.wdprapps.disney.com/wdpr-order-vas/api/api-docs/?url=/wdpr-order-vas/api/openapi.json |
| API Docs (DLR) | https://order-vas-r53-dlr.wdprapps.disney.com/wdpr-order-vas/api/api-docs/?url=/wdpr-order-vas/api/openapi.json |

## AppDynamics

- Stage (6853): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&application=6853&dashboardMode=force
- Load (6854): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&application=6854&dashboardMode=force
- Production (1750): https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=1750&component=368124&dashboardMode=force

Note: Latest AppD not configured.

## ECS Clusters

Region: us-east-1 | Cluster prefix: wdw-ecommerce-S0014092-use1

| Environment | Cluster |
|-------------|---------|
| Latest | wdw-ecommerce-S0014092-use1-lst |
| Stage | wdw-ecommerce-S0014092-use1-stg |
| Load | wdw-ecommerce-S0014092-use1-lod |
| Production | wdw-ecommerce-S0014092-use1-prd |

## Version / Health Endpoints

| Environment | URL |
|-------------|-----|
| Latest | https://latest.order-vas-r53-wdw.wdprapps.disney.com/wdpr-order-vas/version |
| Stage | https://stage.order-vas-r53-wdw.wdprapps.disney.com/wdpr-order-vas/version |
| Load | https://load.order-vas-r53-wdw.wdprapps.disney.com/wdpr-order-vas/version |
| Production | https://order-vas-r53-wdw.wdprapps.disney.com/wdpr-order-vas/version |

## Redis (ElastiCache)

| Environment | Redis ID |
|-------------|----------|
| Latest | order-vas-latest |
| Stage | order-vas-stage |
| Load | order-vas-load |
| Production | order-vas-prod |

## Splunk

```
index=wdpr_wdw_ordervas OR index=wdpr_dlr_ordervas
```

Alarms recipient: WDAT.DL-sustainmentstudios@disney.com

## Scaling

| Parameter | Value |
|-----------|-------|
| Desired Count | 15 |
| PACE Configured | Yes |
| Schedule Start | 04:00 EST |
| Schedule End | 01:00 EST |

Note: Legacy Java 8 OrderVAS has desired count 3 with PACE.

- **Scale up:** Adjust desired count in ECS or update PACE policy
- **Scale down:** PACE handles scale-down automatically at 01:00 EST

## Restart Procedures

1. AWS Console → ECS → Cluster: `wdw-ecommerce-S0014092-use1-prd` → Service: order-vas-prod-live
2. Update service → Force new deployment
3. Monitor task drain and validate version endpoint returns 200

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Validate version endpoint and Splunk logs

## Internal Load Balancers

- WDW: https://order-vas-r53-wdw.wdprapps.disney.com/
- DLR: https://order-vas-r53-dlr.wdprapps.disney.com/

## Known Gaps

- Not showing in SonarQube portfolio
- Latest environment has no AppD configured
