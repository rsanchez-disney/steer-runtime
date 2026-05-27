# Runbook — WDPRD WDWDLRDCL Web Application Magic Bands + Cards

## Restart Procedures

1. Access ECS cluster in AWS Console (wdpr-gam-prod account)
2. Navigate to cluster: wdw-gam2-B0180565-use1-profile-mb-spa-ha-svc-prd (East) or dlr-gam-B0180565-usw2-profile-mb-spa-svc-prd (West)
3. Force new deployment on service profile-mb-spa-ha-prod

**Validation:** Hit health check: https://origin.profilembspa.wdprapps.disney.com/healthcheck (East) and https://origin.usw2.profilembspa.wdprapps.disney.com/healthcheck (West)

---

## Scaling

- **Scale up:** Increase desired task count in ECS service. Alert thresholds: Error > 3% | ART East > 5s | West > 6s | CPU > 30% | Memory > 50%
- **Scale down:** Reduce desired task count after confirming error rates and response times are within thresholds

## Failover

- Active-active across US-EAST-1 and US-WEST-2. Route 53 geo-routing handles automatic failover.
- Akamai CDN/WAF sits in front.

## Rollback

- Use Harness pipeline (profile-mb-spa-ha) to deploy previous version
- Rundeck: profile-mb-spa-ha_aws (Deploy to US-EAST & US-WEST simultaneously)
- Nimbus: nimbus_deploy/profile-mb-spa-ha

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Profile VAS | Martin Uribe | VAS Duplicate Key cascading, band data failures |
| xBMS / Fulfillment | Will McKnight | Band orders/entitlements issues |
| AuthenticatorJS | Cesar Munoz | Login/auth failures |
| Akamai | ops-global-parks-se-guestexp | 502 errors, edge routing |
| DCL Reservation | External team | DCL page data unavailable |
| Product Team | Melanie Bosco | Eligibility/entitlement escalations |
