# Runbook — EVAS WDW

Source: [WDW EVAS Runbook](https://confluence.disney.com/spaces/WDPROS/pages/688921376/WDW+EVAS+Runbook)

## Source Code & CI/CD

| Item | URL |
|------|-----|
| Repository | https://github.disney.com/commerce/wdpr-ecommerce-evas-svc |
| Harness | https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPRD_EntitlementViewAssemblyService/deployments |
| Jenkins (legacy) | https://ecommerce.cicd.wdprapps.disney.com/job/wdpr-ecommerce-evas-svc/view/Deploy/job/wdpr-ecommerce-evas-svc-aws-live/ |
| SonarQube | https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro.service%3Aentitlement-view-assembly-service |
| JMeter Scripts | https://github.disney.com/PE/PE_Scripts/tree/master/DevStudios/OnlineEVAS_TMS |

## Swagger / API Docs

| Cluster | Environment | URL |
|---------|-------------|-----|
| Internal | Latest | https://latest.evas.int.wdw.wdpro.disney.com/entitlement-view-assembly-service/docs/index.html |
| Internal | Stage | https://stage.evas.int.wdw.wdpro.disney.com/entitlement-view-assembly-service/docs/index.html |
| Internal | Load | https://lt.evas.int.wdw.wdpro.disney.com/entitlement-view-assembly-service/docs/index.html |
| Internal | Production | https://evas.int.wdw.wdpro.disney.com/entitlement-view-assembly-service/docs/index.html |
| External | Latest | https://latest.evas.wdw.wdpro.disney.com/entitlement-view-assembly-service/docs/index.html |
| External | Stage | https://stage.evas.wdw.wdpro.disney.com/entitlement-view-assembly-service/docs/index.html |
| External | Load | https://lt.evas.wdw.wdpro.disney.com/entitlement-view-assembly-service/docs/index.html |
| External | Production | https://evas.wdw.wdpro.disney.com/entitlement-view-assembly-service/docs/index.html |

## AppDynamics

### Production (app_id: 563)
- INT+EXT (unified): https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=563&component=349815&dashboardMode=force

### Lower Environments — Internal
- Latest (app_id: 2846): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2846&component=6402224&dashboardMode=force
- Stage (app_id: 3056): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=3056&component=6188388&dashboardMode=force
- Load (app_id: 3058): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=3058&component=6199072&dashboardMode=force

### Lower Environments — External
- Latest (app_id: 2846): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2846&component=6402224&dashboardMode=force
- Stage (app_id: 3056): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=3056&component=7536723&dashboardMode=force
- Load (app_id: 3058): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=3058&component=6188457&dashboardMode=force

## Health Check Endpoints

| Cluster | Environment | URL |
|---------|-------------|-----|
| Internal | Latest | https://latest.evas.int.wdw.wdpro.disney.com/entitlement-view-assembly-service/health/deep |
| Internal | Stage | https://stage.evas.int.wdw.wdpro.disney.com/entitlement-view-assembly-service/health/deep |
| Internal | Load | https://lt.evas.int.wdw.wdpro.disney.com/entitlement-view-assembly-service/health/deep |
| Internal | Production | https://evas.int.wdw.wdpro.disney.com/entitlement-view-assembly-service/health/deep |
| External | Latest | https://latest.evas.wdw.wdpro.disney.com/entitlement-view-assembly-service/health/deep |
| External | Stage | https://stage.evas.wdw.wdpro.disney.com/entitlement-view-assembly-service/health/deep |
| External | Load | https://lt.evas.wdw.wdpro.disney.com/entitlement-view-assembly-service/health/deep |
| External | Production | https://evas.wdw.wdpro.disney.com/entitlement-view-assembly-service/health/deep |

## ECS Clusters

Region: **us-east-1** | IAM Role: WDPR-ECOMMERCE_DEVELOPER

| Environment | Account ID | Cluster | Service |
|-------------|-----------|---------|---------|
| Latest | 718439781381 | wdw-ecommerce-S0001479-use1-lst | evas-svc-wdw-latest-live |
| Stage | 168997411205 | wdw-ecommerce-S0001479-use1-stg | evas-svc-wdw-stage-live |
| Load | 168997411205 | wdw-ecommerce-S0001479-use1-lod | evas-svc-wdw-load-live |
| Production | 820987038150 | wdw-ecommerce-S0001479-use1-prd | evas-svc-wdw-prod-live |

## Splunk

```
index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-use1-<env>*" ecs_task_definition="evas-svc-wdw*"
```

## Splunk Alerts

- WDW_EVAS - Unexpected level of 4xx
- WDW_EVAS - Unexpected level of 5xx
- EVAS_wdw | High time responses
- EVAS by dependencies | High time responses
- EVAS - Dependency timeout

Alarms reference: https://confluence.disney.com/display/WDPROS/Alarms

## Restart Procedures

1. Identify the ECS cluster: `wdw-ecommerce-S0001479-use1-prd` (us-east-1)
2. Force new deployment via ECS console or CLI:
   ```bash
   aws ecs update-service --cluster wdw-ecommerce-S0001479-use1-prd --service evas-svc-wdw-prod-live --force-new-deployment --region us-east-1
   ```
3. Monitor task drain — wait for old tasks to stop and new tasks to reach RUNNING state
4. Validate health check returns 200

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Validate health check and Splunk logs for errors post-rollback
