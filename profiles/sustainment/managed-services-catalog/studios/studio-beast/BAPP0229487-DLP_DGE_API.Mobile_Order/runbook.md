# Runbook — DLP DGE API.Mobile Order

## Restart Procedures

1. Access ECS cluster `dlp-apps-S0001481-euw1` in eu-west-1
2. Force new deployment on service `iod-food-order-provider-prod-live`

**Validation:** Check health endpoint and Splunk INBOUND dashboard for traffic recovery.

---

## Scaling

- **Scale up:** Increase desired task count in ECS service via AWS console or Rundeck
- **Scale down:** Reduce desired task count (minimum 2 for HA)

## Failover

- DFM can disable Click & Collect service entirely or individual restaurants as a circuit breaker

## Rollback

- Use Harness pipeline to redeploy previous version: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Disneyland_Paris/projects/DLP_DGE_API_MobileOrder/overview
- Rundeck for operational tasks: https://rundeck.wdprapps.disney.com/project/wdpr-dlp-is-sales-iod-food-order-provider_aws

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Agilysys OnDemand | app-frdlp-support-pos | Menu/timeslot issues, web view errors, kitchen preparation failures |
| MPG / WorldPay | app-frdlp-spid-monetique | Payment processing failures |
| Mobile APP | app-frdlp-mobile-apps | Mobile app UI issues, CTA problems |
| Cloud OPS | ops-frdlp-CloudOps | ECS/infrastructure issues |
| Flex SRE | ops-global-Flex SRE | Reverse proxy / IG Web Server issues |
| Software Engineering | app-frdlp-software-engineering | Backend logic / RDJ flow issues |
