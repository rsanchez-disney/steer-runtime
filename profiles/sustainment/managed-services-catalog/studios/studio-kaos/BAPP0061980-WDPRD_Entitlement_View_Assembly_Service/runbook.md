# Runbook — EVAS DLR

Source: [DLR EVAS Runbook](https://confluence.disney.com/spaces/WDPROS/pages/688921351/DLR+EVAS+Runbook)

## Source Code & CI/CD

| Item | URL |
|------|-----|
| Repository | https://github.disney.com/commerce/wdpr-ecommerce-evas-svc |
| Harness | https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPRD_EntitlementViewAssemblyService/deployments |
| SonarQube | https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro.service%3Aentitlement-view-assembly-service |
| JMeter Scripts | https://github.disney.com/PE/PE_Scripts/tree/master/DevStudios/OnlineEVAS_TMS |

## Config Manager (Toggles)

- Model: `evas-dlr-toggles-model`
- Config instance: `evas-global-toggles-dlr`

## AppDynamics

### Production (app_id: 501)
- DLR EVAS INT: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=501&component=306236&dashboardMode=force
- DLR EVAS EXT: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=501&component=306014&dashboardMode=force

### Lower Environments — Internal
- Latest (2852): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2852&component=6493727&dashboardMode=force
- Stage (2981): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2981&component=6187841&dashboardMode=force
- Load (3057): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=3057&component=6187955&dashboardMode=force

### Lower Environments — External
- Latest (2852): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2852&component=6493563&dashboardMode=force
- Stage (2981): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2981&component=6187792&dashboardMode=force
- Load (3057): https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=3057&component=6187898&dashboardMode=force

## ECS Clusters

Region: us-west-2 | Cluster: dlr-ecommerce-S0001477-usw2

| Component | Environment | Service |
|-----------|-------------|---------|
| INT | Latest | evasint-svc-latest-live |
| INT | Stage | evasint-svc-stage-live |
| INT | Load | evasint-svc-load-live |
| INT | Production | evasint-svc-prod-live |
| EXT | Latest | evas-svc-latest-live |
| EXT | Stage | evas-svc-stage-live |
| EXT | Load | evas-svc-load-live |
| EXT | Production | evas-svc-prod-live |

## Splunk

```
INT: index=wdpr-ecommerce ecs_cluster="dlr-ecommerce-S0001477-usw2-*" ecs_task_definition="evasint*"
EXT: index=wdpr-ecommerce ecs_cluster="dlr-ecommerce-S0001477-usw2-*" ecs_task_definition="evas-svc*"
```

Legacy index: `dlr_evas`

## Restart Procedures

1. Identify the ECS cluster: `dlr-ecommerce-S0001477-usw2-prd` (us-west-2)
2. Force new deployment:
   ```bash
   aws ecs update-service --cluster dlr-ecommerce-S0001477-usw2-prd --service <evasint-svc-prod-live|evas-svc-prod-live> --force-new-deployment
   ```
3. Monitor task drain — wait for old tasks to reach STOPPED
4. Validate health check returns 200

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Validate health check and Splunk logs

## CME Integration (Service-to-Service)

EVAS DLR calls CME retrieval for reservation data. Must use internal URLs (not Akamai):

| Environment | CME Retrieval URL |
|-------------|-------------------|
| Latest | https://latest.cme-rtrvl-dlr-int.wdprapps.disney.com/retrieval/api/reservations/swid/{swid}/ |
| Stage | https://stage.cme-rtrvl-dlr-int.wdprapps.disney.com/retrieval/api/reservations/swid/{swid}/ |
| Load | https://load.cme-rtrvl-dlr-int.wdprapps.disney.com/retrieval/api/reservations/swid/{swid}/ |
| Production | https://cme-rtrvl-dlr-int.wdprapps.disney.com/retrieval/api/reservations/swid/{swid}/ |
