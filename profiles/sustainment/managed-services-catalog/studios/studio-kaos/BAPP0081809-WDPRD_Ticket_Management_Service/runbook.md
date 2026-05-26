# TMS — Ticket Management Service Runbook

Source: [DLR TMS Runbook](https://confluence.disney.com/spaces/WDPROS/pages/681701749/DLR+TMS+Runbook)

## Source Code & CI/CD

| Item | URL |
|------|-----|
| Repository | https://github.disney.com/commerce/wdpr-ecommerce-tms-svc |
| Harness | https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Commerce/projects/WDPRD_Ticket_Management_Service/deployments |
| SonarQube | https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro.service%3Aticket-management-service |
| JMeter Scripts | https://github.disney.com/PE/PE_Scripts/tree/master/DevStudios/OnlineEVAS_TMS |

## Splunk Dashboards

- DLR TMS Monitoring: https://splunk.wdprapps.disney.com/en-US/app/launcher/dlr_tms_monitoring
- DLR Claims Dashboard: https://splunk.wdprapps.disney.com/en-US/app/launcher/dlr_claim_spa

## Swagger / API Docs

| Cluster | Environment | URL |
|---------|-------------|-----|
| Internal | Latest | https://latest.tms.int.dlr.wdpro.disney.com/ticket-management-service/docs/index.html |
| Internal | Stage | https://stage.tms.int.dlr.wdpro.disney.com/ticket-management-service/docs/index.html |
| Internal | Load | https://lt.tms.int.dlr.wdpro.disney.com/ticket-management-service/docs/index.html |
| Internal | Production | https://tms.int.dlr.wdpro.disney.com/ticket-management-service/docs/index.html |
| External | Latest | https://latest.tms.dlr.wdpro.disney.com/ticket-management-service/docs/index.html |
| External | Stage | https://stage.tms.dlr.wdpro.disney.com/ticket-management-service/docs/index.html |
| External | Load | https://lt.tms.dlr.wdpro.disney.com/ticket-management-service/docs/index.html |
| External | Production | https://tms.dlr.wdpro.disney.com/ticket-management-service/docs/index.html |

## AppDynamics

### Production
- DLR TMS INT: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=501&component=306250&dashboardMode=force
- DLR TMS EXT: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=501&component=306249&dashboardMode=force
- WDW TMS INT: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=563&component=288251&dashboardMode=force
- eGalaxy Backend: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_BACKEND_DASHBOARD&application=501&backendDashboard=108531&dashboardMode=force

### Lower Environments (INT)
- Latest: https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2852&component=6151099&dashboardMode=force
- Stage: https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2981&component=6163110&dashboardMode=force
- Load: https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=3057&component=6153092&dashboardMode=force

### Lower Environments (EXT)
- Latest: https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2852&component=6151176&dashboardMode=force
- Stage: https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=2981&component=6163109&dashboardMode=force
- Load: https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=3057&component=6152987&dashboardMode=force

## Database Access

Request via RITM: IT Customer Services → Tech Services → Application Support WDPR → MariaDB Support and Services

Note: DB password is encrypted in Nimbus (not Vault).

### DLR Databases — Master

| Environment | Host |
|-------------|------|
| Latest | dlr-tms-svc-mariadb-latest.che79lwtdc3w.us-west-2.rds.amazonaws.com:4001/dlrtms_latest |
| Stage | dlr-tms-svc-stage-master.wdatdbs.disney.com:4001/dlrtms_stage |
| Load | dlr-tms-svc-load-master.wdatdbs.disney.com:4001/dlrtms_lt |
| Prod | dlr-tms-svc-prod-master.wdatdbs.disney.com:4001/dlrtms_prod |

### DLR Databases — Read Replica

| Environment | Host |
|-------------|------|
| Latest | dlr-tms-svc-mariadb-latest-replica.che79lwtdc3w.us-west-2.rds.amazonaws.com:4001/dlrtms_latest |
| Stage | dlr-tms-svc-stage-readreplica.wdatdbs.disney.com:4001/dlrtms_stage |
| Load | dlr-tms-svc-load-readreplica.wdatdbs.disney.com:4001/dlrtms_lt |
| Prod | dlr-tms-svc-prod-readreplica.wdatdbs.disney.com:4001/dlrtms_prod |

### WDW Databases

| Environment | Host |
|-------------|------|
| Latest | wdw-tms-latest-mysql.czadbdnytwxi.us-west-2.rds.amazonaws.com:3306/wdwtms_latest |
| Stage | wdw-tms-stage-mysql.czadbdnytwxi.us-west-2.rds.amazonaws.com:3306/wdwtms_stage |
| Load | wdw-tms-lt-mysql.czadbdnytwxi.us-west-2.rds.amazonaws.com:3306/wdwtms_lt |
| Prod | wdw-tms-prod-mysql.czadbdnytwxi.us-west-2.rds.amazonaws.com:3306/wdwtms_prod |

## Redis (ElastiCache)

| Environment | Host |
|-------------|------|
| Latest | dlr-tms-latest-ec.i8pkwr.0001.usw2.cache.amazonaws.com |
| Stage | dlr-tms-stage-ec.i8pkwr.0001.usw2.cache.amazonaws.com |
| Load | dlr-tms-lt-ec.i8pkwr.0001.usw2.cache.amazonaws.com |
| Production | dlr-tms-prod-ec.i8pkwr.0001.usw2.cache.amazonaws.com |

## RabbitMQ — Management Console

| Environment | URL |
|-------------|-----|
| Latest | https://latest.dlr-ent-rmq.wdprapps.disney.com/#/ |
| Stage | https://stage.tms-rmq.wdprapps.disney.com/ |
| Load | https://load.dlr-ent-rmq.wdprapps.disney.com/#/ |
| Production | https://dlr-ent-rmq.wdprapps.disney.com/#/ |

## RabbitMQ (Keyring)

| Environment | Host |
|-------------|------|
| Production | prod.mq.keyring.disneyland.disney.go.com:5672 |
| Load | lt.mq.keyring.disneyland.disney.go.com:5672 |
| Stage | stage.mq.keyring.disneyland.disney.go.com:5672 |
| Latest | stage.mq.keyring.disneyland.disney.go.com:5672 |

Contact: Krista.l.betts

TMS DLR has two deployments (INT and EXT):

| Deployment | Desired Count | PACE | Schedule | Region | Notes |
|------------|--------------|------|----------|--------|-------|
| TMS DLR INT | 40 | No | — | West2 | Static desired count |
| TMS DLR New | 9 | Yes | 05:00–02:00 EST | West2 | Replaces legacy EXT |
| TMS DLR EXT legacy | 0 | — | — | — | Decommissioned |

- **Scale up:** Adjust desired count in ECS; TMS DLR New is PACE-managed
- **Scale down:** PACE handles nightly scale-down for TMS DLR New; INT is static

## Restart Procedures

1. Identify the ECS cluster: `dlr-ecommerce-S0001477-usw2` (West2 Region)
2. Force new deployment via ECS console or CLI:
   ```bash
   aws ecs update-service --cluster dlr-ecommerce-S0001477-usw2 --service <tms-service> --force-new-deployment
   ```
3. Monitor task drain — wait for old tasks to stop and new tasks to reach RUNNING state
4. Validate health check returns 200

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Validate health check and Splunk logs for errors post-rollback

---

## Endpoint Dependencies

### Get Tickets by SWID
1. Calls eGalaxy async (refresh once/day internal, once/hour external)
2. Calls DTI QAM for eligibility flags (cached in REDIS)
3. Calls LexVAS for digital product info (cached in eHCache)

### Get Tickets by VID
1. Calls eGalaxy if ticket not in DB
2. Calls eGalaxy async to refresh (once/day internal, once/hour external)
3. Calls LexVAS for digital product info (cached in eHCache)

### Get Annual Passes
1. Searches DB only (no eGalaxy)
2. Calls DTC for DTI renewable eligibility (cached in DB)

### Get Upgradable Tickets
1. Searches DB only (no eGalaxy)
2. Calls DTC for DTI upgradable eligibility (cached in DB)
