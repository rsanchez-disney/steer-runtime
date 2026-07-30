# Runbook — FNF New Connection Methods SPA

## Restart Procedures

1. Use Rundeck: fnf-new-connection-methods-spa-ha_aws
2. Or redeploy via Harness FnF pipeline
3. Or use Nimbus: nimbus_deploy/fnf-new-connection-methods-spa-ha

**Validation:** Hit healthcheck endpoints:
- East: https://origin.use1.fnf-new-connection-methods.gam-prod.wdprapps.disney.com/healthcheck
- West: https://origin.usw2.fnf-new-connection-methods.gam-prod.wdprapps.disney.com/healthcheck

---

## Scaling

- **Scale up:** ECS Fargate auto-scaling. Alert thresholds: CPU > 30%, Memory > 50%.
- **Scale down:** ECS Fargate auto-scaling handles scale-down.

## Failover

- Active-active across US-EAST-1 (WDW) and US-WEST-2 (DLR)
- Route 53 geo-routing handles failover between regions
- If one region is unhealthy, traffic routes to the other region automatically

## Rollback

- Redeploy previous version via Harness FnF pipeline
- Rundeck: fnf-new-connection-methods-spa-ha_aws
- Nimbus: nimbus_deploy/fnf-new-connection-methods-spa-ha
- If analytics 404: check if file is loaded on S3, if not rebuild and deploy the SPA

## Contacts for External Dependencies

| System | Contact | Email | When to Engage |
|--------|---------|-------|----------------|
| Profile WebAPI WAM (BAPP0253435) | Andrew Southwick | andrew.southwick@disney.com | When backend service calls fail |
| Profile VAS (BAPP0242566) | Martin Uribe | martin.x.uribe.-nd@disney.com | When connected guests data unavailable |
| AuthenticatorJS (BAPP0248309) | Cesar Muñoz | Cesar.A.Munoz.Acevedo.-ND@disney.com | When login/auth fails |
| Akamai CDN | ops-global-parks-se-guestexp | — | When CDN/WAF issues (502, BOTMAN rules) |
| GAM | GAM team | — | When friend list data source issues |
| Glenn Raposo | Disney Manager | glenn.raposo@disney.com | Web/Services ownership |
| Krista Betts | Tech Director | krista.l.betts@disney.com | Executive escalation |

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
| AppDynamics | https://disney-prod.saas.appdynamics.com | core-fnf-spa-ha-east / west |
| ContentSquare | https://app.contentsquare.com | UX monitoring, Duck Out errors |
| AWS CloudWatch | https://aws.wdprapps.disney.com | ECS, CPU, Memory alarms |
| Harness | https://disney.harness.io | CI/CD Deployments |
| Akamai | https://control.akamai.com/apps/edge-diagnostics | Translate Error String |
| Snowman | https://tools.toolbox.disney.com/snowman | Bulk Incident Update |
