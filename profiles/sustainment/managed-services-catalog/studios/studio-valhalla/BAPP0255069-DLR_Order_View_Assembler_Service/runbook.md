# Runbook — DLR Order View Assembler Service (OrderVAS)

Source: [UC - OrderVAS DLR Runbook](https://confluence.disney.com/spaces/WDPROS/pages/691604368/UC+-+OrderVAS+DLR+Runbook)

## Source Code & CI/CD

| Item | URL |
|------|-----|
| Repository | https://github.disney.com/wdpro-peplite/ecommerce-order-vas-java-17 |
| Harness | https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDW_Order_View_Assembler_Service/pipelines |
| Rundeck | https://rundeck.wdprapps.disney.com/project/ecommerce-order-vas-java-17_aws/job/show/7bcbc6a0-e0f6-4316-950a-c4a8a28440e5 |
| API Docs | https://order-vas-r53-dlr.wdprapps.disney.com/wdpr-order-vas/api/api-docs/?url=/wdpr-order-vas/api/openapi.json |

## AppDynamics

- Stage (6838): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=6838&component=7556010&dashboardMode=force
- Load (6808): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&application=6808&dashboardMode=force
- Production (1742): https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=1742&component=368015&dashboardMode=force

Note: Latest AppD not configured.

## ECS Clusters

Region: us-west-2 | Cluster prefix: dlr-ecommerce-S0014867-usw2

| Environment | Cluster |
|-------------|---------|
| Latest | dlr-ecommerce-S0014867-usw2-lst |
| Stage | dlr-ecommerce-S0014867-usw2-stg |
| Load | dlr-ecommerce-S0014867-usw2-lod |
| Production | dlr-ecommerce-S0014867-usw2-prd |

## Version / Health Endpoints

| Environment | URL |
|-------------|-----|
| Latest | https://latest.order-vas-r53-dlr.wdprapps.disney.com/wdpr-order-vas/version |
| Stage | https://stage.order-vas-r53-dlr.wdprapps.disney.com/wdpr-order-vas/version |
| Load | https://load.order-vas-r53-dlr.wdprapps.disney.com/wdpr-order-vas/version |
| Production | https://order-vas-r53-dlr.wdprapps.disney.com/wdpr-order-vas/version |

## Redis (ElastiCache) — us-west-2

| Environment | Redis ID |
|-------------|----------|
| Latest | order-vas-latest |
| Stage | order-vas-stage |
| Load | order-vas-load |
| Production | order-vas-prod |

## Splunk

```
index=wdpr_dlr_ordervas
```

Alarms recipient: WDAT.DL-sustainmentstudios@disney.com

## Scaling

| Parameter | Value |
|-----------|-------|
| Desired Count | 15 |
| PACE Configured | Yes |
| Schedule Start | 06:00 EST |
| Schedule End | 03:00 EST |

Note: Legacy Java 8 OrderVAS has desired count 3 with PACE.

## Internal Load Balancer

- https://order-vas-r53-dlr.wdprapps.disney.com/

## Restart Procedures

1. AWS Console → ECS → Cluster: `dlr-ecommerce-S0014867-usw2-prd` → Service: order-vas-prod-live
2. Update service → Force new deployment
3. Monitor task drain and validate version endpoint returns 200

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Validate version endpoint and Splunk logs
