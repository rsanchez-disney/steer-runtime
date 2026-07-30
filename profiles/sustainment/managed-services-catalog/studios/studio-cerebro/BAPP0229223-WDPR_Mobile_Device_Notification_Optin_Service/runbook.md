# Runbook — WDPR Mobile Device Notification Optin Service (MNO)

## Restart Procedures

1. Use Rundeck: https://rundeck.wdprapps.disney.com/project/mobile-notification-svc-ha_aws/jobs
2. Or redeploy via Harness pipeline: mobile-notification-svc
3. Or use Nimbus: https://c3po.wdprapps.disney.com/ui/ (nimbus_deploy/mobile-notification-svc-ha)

**Validation:** Hit healthcheck endpoints:
- East: https://use1.mobile-notification-ha.gam-prod.wdprapps.disney.com/mobile-notification-svc/healthcheck
- West: https://usw2.mobile-notification-ha.gam-prod.wdprapps.disney.com/mobile-notification-svc/healthcheck

---

## Scaling

- **Scale up:** ECS Fargate auto-scaling. Manual scaling via AWS Console or Nimbus if needed.
- **Scale down:** ECS Fargate auto-scaling handles scale-down.

## Failover

- Active-active across US-EAST-1 and US-WEST-2. Route 53 handles failover between regions.
- If one region is unhealthy, traffic routes to the other region automatically.

## Rollback

- Redeploy previous version via Harness pipeline: mobile-notification-svc
- Rundeck: mobile-notification-svc-ha_aws
- Nimbus: nimbus_deploy/mobile-notification-svc-ha

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
| MNO Architecture | Andrew Southwick | andrew.southwick@disney.com | Architecture decisions, RabbitMQ issues |
| Mobile Apps (WDW/DLR) | Mark Lewis | mark.s.lewis@disney.com | When mobile app integration issues |
| DynamoDB | AWS Support | — | Throttling or availability issues |
| RabbitMQ (SHURI) | DevOps | — | Queue health, consumer issues |
| Vault Secrets | DevOps | — | Secret rotation or access issues |
| Preference Service (BAPP0170520) | Andrew Southwick | andrew.southwick@disney.com | Preference data integration |
| Glenn Raposo | Disney Manager | glenn.raposo@disney.com | Web/Services ownership |
| Krista Betts | Tech Director | krista.l.betts@disney.com | Executive escalation |

## Useful Tools

| Tool | URL | Purpose |
|------|-----|---------|
| ServiceNow | https://disney.service-now.com | INCs, CTASKs, PRBs |
| Splunk PROD | https://splunk.wdprapps.disney.com | index: wdpr-gam |
| AppDynamics | https://disney-prod.saas.appdynamics.com | prod-gam-profile-svc-aws |
| Grafana | https://grafana.wdprapps.disney.com | Profile-Prod-Active-Active-Dashboard |
| AWS CloudWatch | https://aws.wdprapps.disney.com | ECS, DynamoDB, RabbitMQ |
| Harness | https://disney.harness.io | CI/CD Deployments |
| Rundeck | https://rundeck.wdprapps.disney.com/project/mobile-notification-svc-ha_aws/jobs | Deploy/Restart |
| Snowman | https://tools.toolbox.disney.com/snowman | Bulk Incident Update |
