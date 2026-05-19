# TMS — Ticket Management Service Runbook

Source: [TMS Runbook](https://confluence.disney.com/spaces/WDPROS/pages/484022646/TMS)

## Splunk Dashboards

- DLR TMS Monitoring: https://splunk.wdprapps.disney.com/en-US/app/launcher/dlr_tms_monitoring
- DLR Claims Dashboard: https://splunk.wdprapps.disney.com/en-US/app/launcher/dlr_claim_spa

## AppDynamics

- DLR TMS INT: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=501&component=306250&dashboardMode=force
- DLR TMS EXT: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=501&component=306249&dashboardMode=force
- WDW TMS INT: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&application=563&component=288251&dashboardMode=force
- eGalaxy Backend: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_BACKEND_DASHBOARD&application=501&backendDashboard=108531&dashboardMode=force

## Database Access

Request via RITM: IT Customer Services → Tech Services → Application Support WDPR → MariaDB Support and Services

### DLR Databases

| Environment | Host |
|-------------|------|
| Latest | dlr-tms-latest-mysql.czadbdnytwxi.us-west-2.rds.amazonaws.com:3306/dlrtms_latest |
| Stage | dlr-tms-stage-mysql.czadbdnytwxi.us-west-2.rds.amazonaws.com:3306/dlrtms_stage |
| Load | dlr-tms-lt-mysql.czadbdnytwxi.us-west-2.rds.amazonaws.com:3306/dlrtms_lt |
| Prod | dlr-tms-prod-mysql.czadbdnytwxi.us-west-2.rds.amazonaws.com:3306/dlrtms_prod |

### WDW Databases

| Environment | Host |
|-------------|------|
| Latest | wdw-tms-latest-mysql.czadbdnytwxi.us-west-2.rds.amazonaws.com:3306/wdwtms_latest |
| Stage | wdw-tms-stage-mysql.czadbdnytwxi.us-west-2.rds.amazonaws.com:3306/wdwtms_stage |
| Load | wdw-tms-lt-mysql.czadbdnytwxi.us-west-2.rds.amazonaws.com:3306/wdwtms_lt |
| Prod | wdw-tms-prod-mysql.czadbdnytwxi.us-west-2.rds.amazonaws.com:3306/wdwtms_prod |

## RabbitMQ (Keyring)

| Environment | Host |
|-------------|------|
| Production | prod.mq.keyring.disneyland.disney.go.com:5672 |
| Load | lt.mq.keyring.disneyland.disney.go.com:5672 |
| Stage | stage.mq.keyring.disneyland.disney.go.com:5672 |
| Latest | stage.mq.keyring.disneyland.disney.go.com:5672 |

Contact: Krista.l.betts

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
