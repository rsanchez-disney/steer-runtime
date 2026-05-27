# Runbook — WDPRD WDWDLRDCL Web Application Profile

## Restart Procedures

1. Access ECS cluster in AWS Console (wdpr-gam-prod account)
2. Navigate to cluster: wdw-gam2-B0180489-use1-profile-spa-ha-svc-prd (East) or dlr-gam-B0180489-usw2-profile-spa-ha-svc-prd (West)
3. Force new deployment on service profile-spa-ha-prod

**Validation:** Hit health check: origin.use1.profile-spa.wdprapps.disney.com/healthcheck and origin.usw2.profile-spa.wdprapps.disney.com/healthcheck

---

## Scaling

- **Scale up:** Increase desired task count in ECS service. Alert threshold: CPU > 30% | Memory > 50%
- **Scale down:** Reduce desired task count after confirming error rates are normal

## Failover

- Active-active across US-EAST-1 and US-WEST-2. Route 53 geo-routing handles automatic failover.
- Akamai CDN/WAF sits in front — if Akamai fails, escalate to ops-global-parks-se-guestexp

## Rollback

- Use Harness pipeline (disney.harness.io — profile-spa-ha) to deploy previous version
- Rundeck: profile-spa-ha_aws (Deploy to US-EAST & US-WEST simultaneously)
- Nimbus: nimbus_deploy/profile-spa-ha

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| AuthenticatorJS | Cesar Muñoz | Login loops, OneID Trust State issues |
| OneID | IDY Team (Jira) | Authentication failures, Trust State mismatches |
| Akamai | ops-global-parks-se-guestexp | 502 errors, edge routing issues |
| Profile B2C | Andrew Southwick | Backend API failures |
| Payment Methods | app-flwdw-payment | Payment removal issues |
| VAS | Martin Uribe | Avatar/data aggregation failures |
