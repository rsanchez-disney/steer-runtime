# Runbook — DLP API DGE.BOOK DINE

## ECS Service Details (Book Dine Provider)

| Environment | Cluster | Service |
|-------------|---------|---------|
| Prod | dlp-apps-S0001481-euw1-prd | drs-book-dine-provider-prod-live |
| Stage | dlp-apps-S0001481-euw1-stg | drs-book-dine-provider-stage-live |
| Load | dlp-apps-S0001481-euw1-lod | drs-book-dine-provider-load-live |
| Latest | dlp-apps-S0001481-euw1-lst | drs-book-dine-provider-latest-live |

---

## Monitoring

### Splunk
| Component | PROD | Lowers |
|-----------|------|--------|
| Provider | wdpr-dlp-is-sales-drs-book-dine-provider | wdpr-dlp-is-sales-drs-book-dine-provider |
| Provider BOT | wdpr-dlp-is-sales-drs-book-dine-provider BOT MONITORING | LATENCY AND BOT MONITORING |
| Publisher | wdpr-dlp-is-sales-drs-book-dine-publisher | — |

### AppDynamics
| Environment | Dashboards |
|-------------|-----------|
| Prod | PROD_DLP_PAAP_wdpr-dlp-is-sales-drs-book-dine-provider, PROD_DLP_PAAP_SALES-BOOKDINE, prod_dlp-is_sales-bookdine_aws |
| Stage | STAGE_DLP_PAAP_SALES-BOOKDINE, stage_dlp-is_sales-bookdine_aws |
| Load | LOAD_DLP_PAAP_wdpr-dlp-is-bookdine_sales-drs-book-dine-provider, load_dlp-is_sales-bookdine_aws |

### Grafana
- DLP Digital - PROD - Mobile Back-End API Gateway Global Dashboard
- DLP Digital - PROD - Mobile Back-End Services - Nodes/Memory/CPU
- AWS Digital Cluster Metrics

---

## Restart Procedures

### Book Dine Provider (ECS)
1. Access ECS cluster `dlp-apps-S0001481-euw1-prd` in eu-west-1
2. Force new deployment on service `drs-book-dine-provider-prod-live`

### Book Dine Publisher (Batch)
- Re-trigger via Rundeck: https://rundeck.wdprapps.disney.com/project/wdpr-dlp-is-sales-drs-book-dine-publisher_aws/activity

**Validation:** Check health endpoints and Splunk dashboards.

---

## DFM Process

1. Contact ITOC team through their MS Teams Channel
2. Explain guest impact on current situation
3. Ask if putting a DFM would be necessary
4. They put the DFM on their own

---

## Swagger

https://stage.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-sales-drs-book-dine-provider/swagger-ui.html

## Rollback

- Harness: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/module/ci/orgs/Disneyland_Paris/projects/DLP_API_DGE_BOOK_DINE/overview
- Rundeck (Provider): https://rundeck.wdprapps.disney.com/project/wdpr-dlp-is-sales-drs-book-dine-provider_aws/activity

## Contacts

| System | Contact | When to Engage |
|--------|---------|----------------|
| DRS | app-frdlp-support-pos / Guillaume Dubuisson | Booking system issues, QSLWebBooking.asmx |
| Mobile APP (Owner L3) | app-frdlp-mobile-apps / DLP.DL-MOBILE.APP.TEAM@disney.com | App-level issues |
| Bio Schedules | Beast team | Restaurant opening hours issues |
| Notification Service | Beast team | Email delivery issues |
| Cloud OPS | ops-frdlp-cloudops | ECS/infrastructure issues |
| ITOC | MS Teams Channel | DFM requests |
