# Runbook — DLP Guest CRM Event Publisher

## Health Check URLs

| Environment | Health Check | Deep Health Check |
|-------------|-------------|-------------------|
| Prod | Available | Available |
| Stage | Available | Available |
| Load | Available | Available |
| Latest | Available | Available |

---

## ECS Service Details

| Environment | Cluster | Service Name |
|-------------|---------|--------------|
| Prod | dlp-apps-S0001481-euw1-prd | crm-event-v2-publisher-prod-live |
| Stage | dlp-apps-S0001481-euw1-stg | crm-event-v2-publisher-stage-live |
| Load | dlp-apps-S0001481-euw1-lod | crm-event-v2-publisher-load-live |
| Latest | dlp-apps-S0001481-euw1-lst | crm-event-v2-publisher-latest-live |

---

## RabbitMQ

| Environment | URL | Instance (ASG) |
|-------------|-----|----------------|
| Prod | https://dlp-is-rmq.wdprapps.disney.com/ | dlp-is-rmq-prod-asg |
| Stage | https://stage.dlp-is-rmq.wdprapps.disney.com/ | dlp-is-rmq-stage-asg |
| Load | https://load.dlp-is-rmq.wdprapps.disney.com/ | dlp-is-rmq-load-asg |
| Latest | https://latest.dlp-is-rmq.wdprapps.disney.com/ | dlp-is-rmq-latest-asg |

**User:** f-wdpr-monitor-rw-gp-rmq

---

## Monitoring Dashboards

### Splunk
| Environment | Dashboard |
|-------------|-----------|
| Prod | DLP - Guest Profile CRM Event Publisher |
| Stage | DLP - Guest Profile CRM Event Publisher |

### AppDynamics
| Environment | Dashboards |
|-------------|-----------|
| Prod | PROD_DLP_PAAP_GUEST-PROFILE, crmweb3_guest-crm-event-v2-publisher (Application Dashboard) |
| Stage | STAGE_DLP_PAPP_wdpr-dlp-is-guest-crm-event-v2-publisher, crmweb3_guest-crm-event-v2-publisher (Application Dashboard) |

### Grafana
- DLP Digital - PROD - Mobile Back-End Services - Nodes/Memory/CPU
- AWS Digital Cluster Metrics

---

## Restart Procedures

1. Access ECS cluster `dlp-apps-S0001481-euw1-prd` in eu-west-1
2. Force new deployment on service `crm-event-v2-publisher-prod-live`

**Validation:** Check health endpoint and Splunk dashboard for event processing recovery.

---

## Scaling

- **Scale up:** Increase ECS desired task count
- **Scale down:** Reduce task count (minimum 1 for processing)

## Rollback

- Use Harness pipeline: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/module/ci/orgs/Disneyland_Paris/projects/DLP_Guest_CRM_Event_Publisher/pipelines

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| RabbitMQ | Infrastructure team | Broker down, queue issues |
| Salesforce | CRM team | Downstream delivery failures |
| Keyring (BAPP0177699) | Luigi Squad | Ticket/pass event source issues |
| Guest Extended Profile (BAPP0177719) | Luigi Squad | Profile/consent event source issues |
| Travelbox | Booking team | Booking event source issues |
| OneID / Google Cloud | Identity team | Account event source issues, duplicates |
