# Runbook — DLP DGE API.ORION services

## ECS Service Details

| Environment | Cluster | Services |
|-------------|---------|----------|
| Prod | dlp-apps-S0001481-euw1-prd | pea-attraction-provider-v2, psp-payment-methods-provider, push-notification-publisher, guest-itinerary-provider |
| Stage | dlp-apps-S0001481-euw1-stg | (same services) |
| Load | dlp-apps-S0001481-euw1-lod | (same services) |
| Latest | dlp-apps-S0001481-euw1-lst | (same services) |

---

## Monitoring

### Splunk (PROD)
| Service | Dashboards |
|---------|-----------|
| PEA V2 | Technical, Errors, Functional, Fulfillment Issues |
| PSP | wdpr-dlp-is-guest-psp-payment-methods-provider, _ERRORS, DLP_PSP_WORLDPAY_PAYMENT_ISSUES |
| Itinerary | wdpr-dlp-is-guest-itinerary-provider |
| Push Notification | wdpr-dlp-is-guest-push-notification-publisher |

### Splunk Alerts
- `[PROD][DPA/SYS] - PAYMENT_POSTED_NO_COMING_FROM_WORLDPAY`
- `MFO has non WorldPay payments`

### AppDynamics (PROD)
- prod_dlp-is_pea
- PROD_DLP_ORION_BAPP0218964
- PROD_DLP_PAAP_wdpr-dlp-is-operations-pea-attraction-provider-v2
- PROD_DLP_PAAP_wdpr-dlp-is-guest-psp-payment-methods-provider
- PROD_DLP_PAAP_wdpr-dlp-is-guest-push-notification-publisher

### CloudWatch
| Environment | Dashboards |
|-------------|-----------|
| Prod/Stage/Load | ElastiCache Redis, DLP Mobile App Dashboard, API Gateway PEA V2 |

### Grafana
- VM eGalaxy TMS (all environments)

---

## Redis

- **PROD:** https://eu-west-1.console.aws.amazon.com/elasticache/home?region=eu-west-1#/redis/peapass-prod

---

## Restart Procedures

1. Access ECS cluster `dlp-apps-S0001481-euw1-prd` in eu-west-1
2. Force new deployment on the affected service (pea-attraction-provider-v2, psp-payment-methods-provider, etc.)

**Validation:** Check health endpoints via Healthcheck Manager and Splunk dashboards.

---

## Harness CI/CD

| Service | Pipeline |
|---------|----------|
| PEA Attraction Provider | Harness |
| PSP Payment Methods | Harness |
| Guest Itinerary | Harness |
| Push Notification | Harness |

---

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Experience Access | Sushil.Kumar@disney.com / app-frdlp-experienceaccess | Pass management issues |
| Experience Access Oncall | WDPR.DL-ExperienceAccessSustainment@disney.com / app-flwdw-ngexpas | After hours |
| Core API | Nadim.X.Momin.-ND@disney.com / app-frdlp-coreapi | Order/Payment Reference issues |
| TBX Ops | ops-global-pcs-sre (Teams: travelbox-production) | TravelBox issues |
| Worldpay | Support.Flavien.Goirand@Worldpay.com (cc: Pierre Andre Marty, Lorry Moreau) | Payment processing |
| Airship | Adolo.X.Malonga.-ND@disney.com | Push notification delivery |
| Surqual | Discovery & Nav squad (business hours) / ECOM Oncall (weekends) | Product catalog |
| ITOC | MS Teams Channel | DFM requests, PC OPS engagement |
| PC OPS | Via ITOC (weekends via DPA Incident) | Assess impact, shut sales |
