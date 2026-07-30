# Runbook — WDPRD Profile Node WAM

> ⛔ **DEPRECATED** — Migrated to Java WAM (BAPP0253435). Node.js 14 is EOL.

## Restart Procedures

1. This service is DEPRECATED — migrated to Java WAM (BAPP0253435).
2. If still running, restart via ECS service update (force new deployment) in the appropriate cluster.

**Validation:** Check health endpoint at origin.profile-wam.wdprapps.disney.com

---

## Scaling

- **Scale up:** Not applicable — service is deprecated.
- **Scale down:** Not applicable — service is deprecated.

## Failover

- Active-active across US-EAST-1 (WDW) and US-WEST-2 (DLR) via Route53 geo routing.
- All traffic should now be handled by Java WAM (BAPP0253435).

## Rollback

- Use Rundeck job or Jenkins pipeline to redeploy previous version if needed.
- Nimbus: nimbus_deploy/profile-wam-ha

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
| Java WAM (BAPP0253435) | Andrew Southwick | andrew.southwick@disney.com | If traffic is still hitting Node WAM |
| OneID | IDY Jira | — | Authentication failures |
| DynamoDB | AWS Support | — | Session store issues |
| Glenn Raposo | Disney Manager | glenn.raposo@disney.com | Web/Services ownership |
| Krista Betts | Tech Director | krista.l.betts@disney.com | Executive escalation |

## Useful Tools

| Tool | URL | Purpose |
|------|-----|---------|
| ServiceNow | https://disney.service-now.com | INCs, CTASKs, PRBs |
| Splunk PROD | https://splunk.wdprapps.disney.com | index: wdpr-gam |
| AWS CloudWatch | https://aws.wdprapps.disney.com | ECS Clusters and Alarms |
| Harness | https://disney.harness.io | CI/CD Deployments |
