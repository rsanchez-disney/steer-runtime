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

| System | Contact | Email | When to Engage |
|--------|---------|-------|----------------|
| Profile VAS | Martin Uribe | martin.x.uribe.-nd@disney.com | VAS Duplicate Key cascading, band data failures |
| xBMS / Fulfillment | Will McKnight | — | Band orders/entitlements issues |
| AuthenticatorJS | Cesar Muñoz | Cesar.A.Munoz.Acevedo.-ND@disney.com | Login/auth failures |
| Akamai | ops-global-parks-se-guestexp | — | 502 errors, edge routing |
| DCL Reservation | External team | — | DCL page data unavailable |
| Product Team | Melanie Bosco | — | Eligibility/entitlement escalations |
| Disney POC (Frontend) | Gino Caverzan | gino.x.caverzan.-nd@disney.com | SPA architecture, feature decisions |
| Disney POC (Web/Services) | Glenn Raposo | glenn.raposo@disney.com | Web/Services ownership |
| MB+C physical shipment | Merchandise / Fulfillment | — | Physical band shipment issues |
| DCL orders not in XBMS | app-global-magicband | — | DCL order sync issues |

## On-Call

- **On-call Number:** +1 934 647 4549
- **Incidents Channel:** DX Profile Incidents Ack
- **Triage Channel:** MB-Triage-Latest-Stage-Load-Prod
- **Rotation:** Weekly (every Wednesday at 12:00 AM) | Client Time Zone: EST (GMT-4)

## Escalation Path

| Level | Contact | Email |
|-------|---------|-------|
| L1 | On-Call Glober | — |
| L2 | Cesar Muñoz | Cesar.A.Munoz.Acevedo.-ND@disney.com |
| L3 | Martin Uribe | martin.x.uribe.-nd@disney.com |
| L4 | Sebastian Marin / Celeste | Sebastian.Marin.-ND@disney.com |
| L5 | Eugenio Tomasino | — |

## Useful Tools

| Tool | URL | Purpose |
|------|-----|---------|
| ServiceNow | https://disney.service-now.com | INCs, CTASKs, PRBs |
| Splunk PROD | https://splunk.wdprapps.disney.com | index: wdpr-profile-ui |
| AppDynamics | https://disney-prod.saas.appdynamics.com | core-profile-mb-spa-ha-east / west |
| ContentSquare | https://app.contentsquare.com | Duck Out errors, UX drops |
| AWS CloudWatch | https://aws.wdprapps.disney.com | ECS, CPU, Memory alarms |
| Harness | https://disney.harness.io | CI/CD Deployments |
| Akamai | https://control.akamai.com/apps/edge-diagnostics | Translate Error String |
| xBMS | — | Band order verification |
| Vincent | — | xBMS link ID verification |
| Snowman | https://tools.toolbox.disney.com/snowman | Bulk Incident Update |
