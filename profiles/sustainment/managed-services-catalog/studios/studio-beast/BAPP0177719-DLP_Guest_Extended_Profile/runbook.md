# Runbook — DLP Guest Extended Profile

## Health Check URLs

### Extended Profile Provider

| Environment | Service |
|-------------|---------|
| Prod | extended-profile-provider-prod-live (dlp-apps-S0001481-euw1-prd) |
| Stage | extended-profile-provider-stage-live (dlp-apps-S0001481-euw1-stg) |
| Load | extended-profile-provider-load-live (dlp-apps-S0001481-euw1-lod) |
| Latest | extended-profile-provider-latest-live (dlp-apps-S0001481-euw1-lst) |

### OID Purge Processor

| Environment | Deep Health Check |
|-------------|-------------------|
| Prod | https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-guest-oid-purge-processor/healthcheck/deep |
| Stage | https://stage.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-guest-oid-purge-processor/healthcheck/deep |
| Load | https://load.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-guest-oid-purge-processor/healthcheck/deep |
| Latest | https://latest.dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/wdpr-dlp-is-guest-oid-purge-processor/healthcheck/deep |

### GEP Consent Cleaner (Lambda)

| Environment | Lambda Function |
|-------------|-----------------|
| Prod | dlp-apps-B0177719-euw1-prd-guest-gep-consentcleaner-f0 |
| Stage | dlp-apps-B0177719-euw1-stg-guest-gep-consentcleaner-f0 |
| Load | dlp-apps-B0177719-euw1-lod-guest-gep-consentcleaner-f0 |
| Latest | dlp-apps-B0177719-euw1-lst-guest-gep-consentcleaner-f0 |

---

## Monitoring Dashboards

### Splunk
| Component | Dashboard |
|-----------|-----------|
| Extended Profile Provider | wdpr-dlp-is-guest-extended-profile-provider |
| All Batches | DLP Guest Profile Batches executions |
| CI Consent Extractor | CI Consent Extractor |
| Purge Extractor | Purge Extractor |
| Purge Processor | Guest Purge Processor |
| Consent Cleaner | GEP Consent Cleaner |

### AppDynamics (PROD)
| Dashboard |
|-----------|
| PROD_DLP_BAPP0177719_wdpr-dlp-is-guest-extended-profile-provider |
| PROD_DLP_PAAP_wdpr-dlp-is-guest-extended-profile-provider |
| epevent_guest-extended-profile-provider (Application Dashboard) |
| GUEST PURGE EXTRACTOR |
| GUEST PURGE PROCESSOR |

### Grafana
- DLP Digital - PROD - Mobile Back-End API Gateway Global Dashboard
- DLP Digital - PROD - Mobile Back-End Services - Nodes/Memory/CPU
- AWS Digital Cluster Metrics

---

## Restart Procedures

### Extended Profile Provider (ECS)
1. Access ECS cluster `dlp-apps-S0001481-euw1-prd`
2. Force new deployment on service `extended-profile-provider-prod-live`

### OID Purge Processor (ECS)
1. Access ECS cluster `dlp-apps-S0001481-euw1-prd`
2. Force new deployment on service `oid-purge-processor-prod-live`

### GEP Consent Cleaner (Lambda)
- Lambda is scheduled — no restart needed. If stuck, manually invoke from AWS Console.

### Batch Jobs (CI Consent Extractor, Purge Extractor)
- Re-trigger via Rundeck

**Validation:** Check health endpoints and Splunk dashboards for recovery.

---

## Rundeck URLs

| Component | Rundeck |
|-----------|---------|
| Extended Profile Provider | https://rundeck.wdprapps.disney.com/project/wdpr-dlp-is-guest-extended-profile-provider_aws/activity |
| CI Consent Extractor | https://rundeck.wdprapps.disney.com/project/wdpr-dlp-is-guest-ci-consent-extractor_aws/activity |
| GEP Consent Cleaner | https://rundeck.wdprapps.disney.com/project/dlp-apps-bapp0177719-guest-gep-consentcleaner_aws/activity |
| Purge Extractor | https://rundeck.wdprapps.disney.com/project/wdpr-dlp-is-guest-purge-extractor_aws/activity |
| Purge Processor | https://rundeck.wdprapps.disney.com/project/wdpr-dlp-is-guest-oid-purge-processor_aws/activity |

---

## Scaling

- **Extended Profile Provider:** Increase ECS task count in dlp-apps-S0001481-euw1-prd
- **OID Purge Processor:** Increase ECS task count
- **Lambda/Batches:** Auto-scaling (Lambda) or re-schedule (batches)

## Rollback

- Use Harness pipeline: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/module/ci/orgs/Disneyland_Paris/projects/DLP_Guest_Extended_Profile/pipelines

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| RabbitMQ | Infrastructure team | Message broker connectivity issues |
| MariaDB (RDS) | Cloud OPS | Database connectivity/performance issues |
| OneID IAM | Identity team | Account identity issues |
| CNS | CNS team | Purge event delivery issues |
| AWS S3 | Cloud OPS | Bucket access/permission issues |
