# Runbook — DLP Ticket Management Service

## Health Check URLs (TMS Provider)

| Environment | Deep Health Check |
|-------------|-------------------|
| Prod | https://tms-int-dlp.wdprapps.disney.com/ticket-management-service/health/deep |
| Stage | https://stage.tms-int-dlp.wdprapps.disney.com/ticket-management-service/health/deep |
| Load | https://load.tms-int-dlp.wdprapps.disney.com/ticket-management-service/health/deep |
| Latest | https://latest.tms-int-dlp.wdprapps.disney.com/ticket-management-service/health/deep |

---

## ECS Service Details (TMS Provider)

| Environment | Cluster | Service | Tasks |
|-------------|---------|---------|-------|
| Prod | dlp-apps-S0001479-euw1-prd | tms-ticket-management-service-provider-prod-live | 10 |
| Stage | dlp-apps-S0001479-euw1-stg | tms-ticket-management-service-provider-stage-live | 2 |
| Load | dlp-apps-S0001479-euw1-lod | tms-ticket-management-service-provider-load-live | 5 |
| Latest | dlp-apps-S0001479-euw1-lst | tms-ticket-management-service-provider-latest-live | 2 |

---

## eGalaxy Dependency URLs

| Environment | URL |
|-------------|-----|
| Prod | https://as-wa-tms-lb.emea.wdpr.disney.com/ |
| Stage | https://as-wa-tms-lb-stage.emea.wdpr.disney.com/ |
| Load | https://as-wa-tms-lb-load.emea.wdpr.disney.com/ |
| Latest | https://as-wa-tms-lb-stage.emea.wdpr.disney.com/ |

**Galaxy AppDynamics:**
- DLP_PROD_GALAXY_SQL51_GENIE — Primary SQL DB (write rights)
- DLP_PROD_GALAXY_SQL53_GENIE — Secondary server (READ only, failover)

---

## Monitoring Dashboards

### Splunk (PROD)
- wdpr-dlp-is-guest-tms-ticket-management-service-provider
- DLP - Tickets Management Service Provider
- DLP-TMS-STANDBY-PASS
- DLP_TMS_EGALAXY
- VM Galaxy TMS

### Splunk Useful Queries
- Get Conversation IDs for eGalaxy responses >30s
- Galaxy index: `index=wdpr_egalaxy_dlp`

### Swagger
| Environment | URL |
|-------------|-----|
| Prod | https://tms-int-dlp.wdprapps.disney.com/ticket-management-service/docs/index.html |
| Stage | https://stage.tms-int-dlp.wdprapps.disney.com/ticket-management-service/docs/index.html |
| Load | https://load.tms-int-dlp.wdprapps.disney.com/ticket-management-service/docs/index.html |
| Latest | https://latest.tms-int-dlp.wdprapps.disney.com/ticket-management-service/docs/index.html |

---

## Database

| Environment | RDS |
|-------------|-----|
| Prod | dlp-tms-mariadb-prod (725065748993) |
| Stage | dlp-apps-test (564479547993) |
| Load | dlp-apps-test (564479547993) |
| Latest | dlp-apps-dev (301080195839) |

**PROD DB Console:** https://eu-west-1.console.aws.amazon.com/rds/home?region=eu-west-1#database:id=dlp-tms-mariadb-prod;is-cluster=false

---

## Kinesis

- **Stream:** dlp-apps-S0001479-euw1-tmsint-tmsint-prod
- **ARN:** arn:aws:kinesis:eu-west-1:725065748993:stream/dlp-apps-S0001479-euw1-tmsint-tmsint-prod
- **Shards:** 1 (provisioned)

---

## Restart Procedures

### TMS Provider (ECS)
1. Access ECS cluster `dlp-apps-S0001479-euw1-prd` in eu-west-1
2. Force new deployment on service `tms-ticket-management-service-provider-prod-live`

### Ticket Preloader (On-Prem)
- Deployed on-prem, NOT AWS
- Re-trigger batch execution (runs daily at 6:00 AM)

**Validation:** Check health endpoints and Splunk dashboards.

---

## Scaling

- **Prod:** 10 tasks (default)
- **Load:** 5 tasks
- **Stage/Latest:** 2 tasks
- Scale up by increasing ECS desired task count

## Rollback

- Redeploy previous version via CI/CD pipeline

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| eGalaxy Database | Galaxy/infrastructure team | DB slow (>30s), connectivity issues |
| MariaDB (RDS) | Cloud OPS | RDS health issues |
| On-prem infrastructure | On-prem ops | Ticket Preloader issues |
| Kinesis | Cloud OPS | Stream processing issues |
