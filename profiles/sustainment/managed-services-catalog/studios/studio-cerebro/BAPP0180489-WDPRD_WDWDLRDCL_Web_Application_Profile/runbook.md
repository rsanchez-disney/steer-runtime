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

| System | Contact | Email | When to Engage |
|--------|---------|-------|----------------|
| AuthenticatorJS | Cesar Muñoz | Cesar.A.Munoz.Acevedo.-ND@disney.com | Login loops, OneID Trust State issues |
| OneID | IDY Team (Jira) | — | Authentication failures, Trust State mismatches |
| Akamai | ops-global-parks-se-guestexp | — | 502 errors, edge routing issues |
| Profile B2C | Andrew Southwick | andrew.southwick@disney.com | Backend API failures |
| Payment Methods | app-flwdw-payment | — | Payment removal issues |
| VAS | Martin Uribe | martin.x.uribe.-nd@disney.com | Avatar/data aggregation failures |
| Disney POC (Frontend) | Gino Caverzan | gino.x.caverzan.-nd@disney.com | SPA architecture, feature decisions |
| Disney POC (Web/Services) | Glenn Raposo | glenn.raposo@disney.com | Web/Services ownership |
| Tech Director | Krista Betts | krista.l.betts@disney.com | Executive escalation |

## On-Call

- **On-call Number:** +1 934 647 4549
- **Incidents Channel:** DX Profile Incidents Ack
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
| AppDynamics | https://disney-prod.saas.appdynamics.com | core-profile-spa-ha-east / west |
| ContentSquare | https://app.contentsquare.com | Duck Out errors, UX drops |
| Grafana | https://grafana.wdprapps.disney.com | ART, EPM, traffic |
| AWS CloudWatch | https://aws.wdprapps.disney.com | ECS, CPU, Memory alarms |
| Harness | https://disney.harness.io | CI/CD Deployments |
| Akamai | https://control.akamai.com/apps/edge-diagnostics | Translate Error String |
| Snowman | https://tools.toolbox.disney.com/snowman | Bulk Incident Update |
