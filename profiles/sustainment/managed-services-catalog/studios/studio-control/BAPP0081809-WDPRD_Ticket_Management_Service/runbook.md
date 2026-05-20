# Runbook — TMS WDW

Source: [WDW TMS Runbook](https://confluence.disney.com/spaces/WDPROS/pages/681701804/WDW+TMS+Runbook)

## Source Code & CI/CD

| Item | URL |
|------|-----|
| Repository | https://github.disney.com/commerce/wdpr-ecommerce-tms-svc |
| Harness | https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPRD_Ticket_Management_Service/deployments |
| SonarQube | https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro.service%3Aticket-management-service |
| JMeter Scripts | https://github.disney.com/PE/PE_Scripts/tree/master/DevStudios/OnlineEVAS_TMS |

## Swagger / API Docs

| Cluster | Environment | URL |
|---------|-------------|-----|
| Internal | Latest | https://latest.tms.int.wdw.wdpro.disney.com/ticket-management-service/docs/index.html |
| Internal | Stage | https://stage.tms.int.wdw.wdpro.disney.com/ticket-management-service/docs/index.html |
| Internal | Load | https://lt.tms.int.wdw.wdpro.disney.com/ticket-management-service/docs/index.html |
| Internal | Production | https://tms.int.wdw.wdpro.disney.com/ticket-management-service/docs/index.html |
| External | Latest | https://latest.tms.wdw.wdpro.disney.com/ticket-management-service/docs/index.html |
| External | Stage | https://stage.tms.wdw.wdpro.disney.com/ticket-management-service/docs/index.html |
| External | Load | https://lt.tms.wdw.wdpro.disney.com/ticket-management-service/docs/index.html |
| External | Production | https://tms.wdw.wdpro.disney.com/ticket-management-service/docs/index.html |

## AppDynamics

### Production
- WDW TMS INT: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=563&component=288251&dashboardMode=force
- WDW TMS EXT: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=563&component=288169&dashboardMode=force

### Lower Environments (INT)
- Latest: https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2846&component=6394101&dashboardMode=force
- Stage: https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=3056&component=6401643&dashboardMode=force
- Load: https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=3058&component=6401747&dashboardMode=force

### Lower Environments (EXT)
- Latest: https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2846&component=6394100&dashboardMode=force
- Stage: https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=3056&component=6401644&dashboardMode=force
- Load: https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=3058&component=6401747&dashboardMode=force

## Health Check Endpoints

| Cluster | Environment | URL |
|---------|-------------|-----|
| Internal | Latest | https://latest.tms.int.wdw.wdpro.disney.com/ticket-management-service/health/deep |
| Internal | Stage | https://stage.tms.int.wdw.wdpro.disney.com/ticket-management-service/health/deep |
| Internal | Load | https://lt.tms.int.wdw.wdpro.disney.com/ticket-management-service/health/deep |
| Internal | Production | https://tms.int.wdw.wdpro.disney.com/ticket-management-service/health/deep |
| External | Latest | https://latest.tms.wdw.wdpro.disney.com/ticket-management-service/health/deep |
| External | Stage | https://stage.tms.wdw.wdpro.disney.com/ticket-management-service/health/deep |
| External | Load | https://lt.tms.wdw.wdpro.disney.com/ticket-management-service/health/deep |
| External | Production | https://tms.wdw.wdpro.disney.com/ticket-management-service/health/deep |

## ECS Clusters

AWS Account: commerce | Region: us-west-2

| Cluster | Environment | Service |
|---------|-------------|---------|
| INT | Latest | wdw-ecommerce-S0001479-usw2-lst / tmsint-wdw-svc-latest-live |
| INT | Stage | wdw-ecommerce-S0001479-usw2-stg / tmsint-wdw-svc-stage-live |
| INT | Load | wdw-ecommerce-S0001479-usw2-lod / tmsint-wdw-svc-load-live |
| INT | Production | wdw-ecommerce-S0001479-usw2-prd / tmsint-wdw-svc-prod-live |
| EXT | Latest | wdw-ecommerce-S0001479-usw2-lst / tms-wdw-svc-latest-live |
| EXT | Stage | wdw-ecommerce-S0001479-usw2-stg / tms-wdw-svc-stage-live |
| EXT | Load | wdw-ecommerce-S0001479-usw2-lod / tms-wdw-svc-load-live |
| EXT | Production | wdw-ecommerce-S0001479-usw2-prd / tms-wdw-svc-prod-live |

## Database Access

Note: DB password is encrypted in Nimbus (not Vault).

### WDW Databases

| Environment | Host |
|-------------|------|
| Latest | wdw-tms-svc-1-mariadb-latest.che79lwtdc3w.us-west-2.rds.amazonaws.com:4001/wdwtms_latest |
| Stage | wdw-tms-svc-stage-master.wdatdbs.disney.com:4001/wdwtms_stage |
| Load | wdw-tms-svc-load-master.wdatdbs.disney.com:4001/wdwtms_lt |
| Production | wdw-tms-prod-mysql.czadbdnytwxi.us-west-2.rds.amazonaws.com:3306/wdwtms_prod |

## Redis (ElastiCache)

| Environment | Host |
|-------------|------|
| Latest | wdwtms-latest.7ozysg.clustercfg.usw2.cache.amazonaws.com |
| Stage | wdw-tms-stage-ec.i8pkwr.0001.usw2.cache.amazonaws.com |
| Load | wdw-tms-lt-ec.i8pkwr.0001.usw2.cache.amazonaws.com |
| Production | wdw-tms-prod-ec.i8pkwr.0001.usw2.cache.amazonaws.com |

## Splunk Indexes

Legacy index: `wdw_tms`

After Cribl migration (v2.49+):
```
INT: index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-usw2*" ecs_task_definition="tmsint-svc*"
EXT: index=wdpr-ecommerce ecs_cluster="wdw-ecommerce-S0001479-usw2*" ecs_task_definition="tms-svc*"
```

## Restart Procedures

1. Identify the ECS cluster: `wdw-ecommerce-S0001479-usw2-prd` (us-west-2)
2. Force new deployment via ECS console or CLI:
   ```bash
   aws ecs update-service --cluster wdw-ecommerce-S0001479-usw2-prd --service <tmsint-wdw-svc-prod-live|tms-wdw-svc-prod-live> --force-new-deployment
   ```
3. Monitor task drain — wait for old tasks to stop and new tasks to reach RUNNING state
4. Validate health check returns 200

## Scaling

TMS WDW has two deployments (INT and EXT):

| Deployment | Desired Count | PACE | Schedule | Region | Notes |
|------------|--------------|------|----------|--------|-------|
| TMS WDW INT | 9 | Yes | 04:00–01:00 EST | West2 | PACE-managed |
| TMS WDW EXT | 3 | No | — | West2 | Min:3, Desire:3, Max:20 |

- **Scale up:** Adjust desired count in ECS; INT is PACE-managed, EXT requires manual scaling
- **Scale down:** INT scales down via PACE schedule; EXT stays at minimum (3)

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Validate health check and Splunk logs for errors post-rollback
