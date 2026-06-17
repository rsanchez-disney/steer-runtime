# Runbook — DLP Disney Premier Access Ultimate

## ECS Service Details

### DPA All Access Show Provider

| Environment | Cluster | Service |
|-------------|---------|---------|
| Prod | dlp-apps-S0001481-euw1-prd | dpa-all-access-show-provider-prod-live |
| Stage | dlp-apps-S0001481-euw1-stg | dpa-all-access-show-provider-stage-live |
| Load | dlp-apps-S0001481-euw1-lod | dpa-all-access-show-provider-load-live |
| Latest | dlp-apps-S0001481-euw1-lst | dpa-all-access-show-provider-latest-live |

### Guest Itinerary Provider

| Environment | Cluster | Service |
|-------------|---------|---------|
| Prod | dlp-apps-S0001481-euw1-prd | guest-itinerary-provider-prod-live |
| Stage | dlp-apps-S0001481-euw1-stg | guest-itinerary-provider-stage-live |
| Load | dlp-apps-S0001481-euw1-lod | guest-itinerary-provider-load-live |
| Latest | dlp-apps-S0001481-euw1-lst | guest-itinerary-provider-latest-live |

---

## Redis

- **PROD:** https://eu-west-1.console.aws.amazon.com/elasticache/home?region=eu-west-1#/redis/dpaallaccessshow-prod

---

## Monitoring

### Splunk (PROD)
- ALL-ACCESS - Global Technical Dashboard
- ALL-ACCESS - Technical Errors Dashboard
- ALL-ACCESS - Global Functional Dashboard
- ALL-ACCESS - Functional Fulfilment Issues
- DLP MOBILE DPA ULTIMATE (FUNC)
- DLP DPA Ultimate (refresh)
- PSP - Payment Methods / Errors / Worldpay Payment Issues
- ITINERARY - Global Technical Dashboard
- SYS Functional / Technical / Errors / Fulfillment / Global Dashboards

### AppDynamics
| Environment | Dashboard |
|-------------|-----------|
| Prod | PROD_DLP_PAAP_wdpr-dlp-is-operations-dpa-all-access-show-provider |
| Stage | STAGE_DLP_PAAP_wdpr-dlp-is-operations-dpa-all-access-show-provider |
| Load | LOAD_DLP_PAAP_wdpr-dlp-is-operations-dpa-all-access-show-provider |

### Grafana
- All Access (DPA Ultimate and SYS) — API Gateway entry

### CloudWatch
- DPA All Access API Gateway (Prod/Stg/Load)
- DPA ElastiCache Redis (Prod/Stg/Load)
- Guest Itinerary (Prod/Stg/Load)

---

## DFM Process

1. Contact ITOC team through their MS Teams Channel
2. Explain guest impact
3. Ask if DFM is necessary — they put it on their own

---

## Restart Procedures

1. Access ECS cluster `dlp-apps-S0001481-euw1-prd` in eu-west-1
2. Force new deployment on `dpa-all-access-show-provider-prod-live`

**Validation:** Check health endpoints and Splunk dashboards.

---

## Rollback

- Harness CI/CD pipeline

## Contacts

| System | Contact | When to Engage |
|--------|---------|----------------|
| Experience Access | Sushil.Kumar@disney.com / app-frdlp-experienceaccess | Redemption, recovery, GSS, DAP |
| Experience Access Oncall | WDPR.DL-ExperienceAccessSustainment@disney.com / app-flwdw-ngexpas | After hours |
| Product Gateway | app-global-titus (via DTOC) | Product gateway issues |
| Core API | Nadim.X.Momin.-ND@disney.com / app-frdlp-coreapi | Order management |
| TBX Ops | app-global-l3tbxdlp (Teams: travelbox-production/travelbox-dlp) | TravelBox |
| Worldpay | Support.Flavien.Goirand@Worldpay.com (cc: Pierre Andre Marty, Lorry Moreau) | Payment |
| Airship | Adolo.X.Malonga.-ND@disney.com | Push notifications |
| Surqual | Discovery & Nav (business hours) / ECOM Oncall (weekends) | Product catalog |
| ITOC | MS Teams Channel | DFM, PC OPS engagement |
