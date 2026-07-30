# Runbook — WDPRD Profile JWT service

## Restart Procedures

1. Access ECS cluster in AWS Console (wdpr-gam-prod account)
2. Navigate to cluster: wdw-gam-B0082610-use1-profile-jwt-ha-jwt-prd (East) or dlr-gam-B0082610-usw2-profile-jwt-ha-jwt-prd (West)
3. Force new deployment on service jwt-ha-prod

**Validation:** Hit health check URL: use1.profile-jwt-ha.gam-prod.wdprapps.disney.com/jwt-service/api/v1/healthcheck

---

## Scaling

- **Scale up:** Increase desired task count in ECS service configuration
- **Scale down:** Reduce desired task count (monitor error rates before scaling down)

## Failover

- Active-active across US-EAST-1 and US-WEST-2. Route 53 handles geo-routing.
- If one region fails, traffic routes to the other automatically.

## Rollback

- Use Rundeck job: jwt-service-gam-ha_aws → Job: 03. Deploy Live - HA (deploy previous version)
- Nimbus: nimbus_deploy/jwt-service-gam-ha

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

## Contacts for External Dependencies

| System | Contact | Email | When to Engage |
|--------|---------|-------|----------------|
| JWT Architecture | Andrew Southwick | andrew.southwick@disney.com | Architecture decisions, token format changes |
| DynamoDB | AWS Support | — | Throttling or table issues |
| OneID | IDY Jira | — | Authentication failures upstream |
| AuthenticatorJS (BAPP0248309) | Cesar Muñoz | Cesar.A.Munoz.Acevedo.-ND@disney.com | If JWT calls failing from AuthenticatorJS |
| Akamai / Edge | ops-global-parks-se-guestexp | — | 502 errors, routing failures |
| Glenn Raposo | Disney Manager | glenn.raposo@disney.com | Web/Services ownership |
| Krista Betts | Tech Director | krista.l.betts@disney.com | Executive escalation |

## Useful Tools

| Tool | URL | Purpose |
|------|-----|---------|
| ServiceNow | https://disney.service-now.com | INCs, CTASKs, PRBs |
| Splunk PROD | https://splunk.wdprapps.disney.com | index: wdpr-gam |
| AppDynamics | https://disney-prod.saas.appdynamics.com | core_profile-jwt-ha-east / west |
| AWS CloudWatch | https://aws.wdprapps.disney.com | ECS Clusters, DynamoDB metrics |
| Harness | https://disney.harness.io | CI/CD Deployments |
| Akamai | https://control.akamai.com/apps/edge-diagnostics | Translate Error String |
| Snowman | https://tools.toolbox.disney.com/snowman | Bulk Incident Update |
