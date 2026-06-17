# Runbook — DLP Virtual Queue

## ECS Service Details

| Environment | Cluster | Service |
|-------------|---------|---------|
| Prod | dlp-apps-S0001481-euw1-prd | virtual-queue-provider-prod-live |
| Stage | dlp-apps-S0001481-euw1-stg | virtual-queue-provider |
| Load | dlp-apps-S0001481-euw1-lod | virtual-queue-provider |
| Latest | dlp-apps-S0001481-euw1-lst | virtual-queue-provider |

---

## Monitoring

### Splunk (PROD)
- wdpr-dlp-is-operations-virtual-queue-provider
- wdpr-dlp-is-operations-virtual-queue-provider_ERRORS
- wdpr-dlp-is-operations-virtual-queue-provider_BOOKING_ERRORS
- DLP Virtual Queue - Command Center
- DLP Virtual Queue Functional Dashboard
- DLP_Virtual_Queue_IE_KPI

### AppDynamics
| Environment | Dashboards |
|-------------|-----------|
| Prod | PROD_DLP_PAAP_wdpr-dlp-is-operations-virtual-queue-provider, operations-virtual-queue-provider |
| Stage | STAGE_DLP_PAAP_wdpr-dlp-is-operations-virtual-queue-provider |
| Load | LOAD_DLP_PAAP_wdpr-dlp-is-operations-virtual-queue-provider |

### Grafana
- DLP Digital - PROD - Mobile Back-End API Gateway Global Dashboard
- DLP Digital - PROD - Mobile Back-End Services - Nodes/Memory/CPU
- AWS Digital Cluster Metrics
- DLP Digital - PROD - Mobile Back-End Databases

---

## Swagger

https://stage.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-operations-virtual-queue-provider/swagger-ui/index.html#/

---

## Restart Procedures

1. Access ECS cluster `dlp-apps-S0001481-euw1-prd` in eu-west-1
2. Force new deployment on service `virtual-queue-provider-prod-live`

**Validation:** Check health endpoints and Splunk "Command Center" dashboard.

---

## Rollback

- Harness: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/module/ci/orgs/Disneyland_Paris/projects/DLP_Mission_Control/overview

## Contacts

| System | Contact | When to Engage |
|--------|---------|----------------|
| Lineberty | support@lineberty.com / (+33) 09.73.72.33.06 | Pass management, TLS certificate, API issues |
| Airship | Airship team | Notification delivery issues |
| Tickets Linking (BAPP0203964) | Luigi Squad | Ticket retrieval issues |
| Guest Extended Profile (BAPP0177719) | Luigi Squad | Lineberty userId mapping issues |
| Cloud OPS | ops-frdlp-cloudops | ECS/infrastructure issues |
