# Runbook — WDPRD Preference Admin

## Restart Procedures

1. Force new ECS deployment via Harness (https://disney.harness.io) or AWS Console.
2. Check ECS cluster health in AWS Console.

**Validation:** Access admin tool and verify preference data loads successfully.

---

## Scaling

- **Scale up:** Increase ECS desired task count.
- **Scale down:** Reduce task count (low-traffic internal tool).

## Failover

- Active-active across US-EAST-1 and US-WEST-2 via Route53 geo routing.
- If one region fails, traffic routes to the other automatically.

## Rollback

- Use Harness pipeline to deploy previous version.

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
| Preference Admin Architecture | Gino Caverzan | gino.x.caverzan.-nd@disney.com | Architecture decisions |
| Preference Service (BAPP0170520) | Andrew Southwick | andrew.southwick@disney.com | Backend preference data issues |
| OneID | IDY Jira | — | Cast Member authentication failures |
| Glenn Raposo | Disney Manager | glenn.raposo@disney.com | Web/Services ownership |
| Krista Betts | Tech Director | krista.l.betts@disney.com | Executive escalation |

## Useful Tools

| Tool | URL | Purpose |
|------|-----|---------|
| ServiceNow | https://disney.service-now.com | INCs, CTASKs, PRBs |
| Splunk PROD | https://splunk.wdprapps.disney.com | Logs |
| AWS CloudWatch | https://aws.wdprapps.disney.com | ECS Clusters and Alarms |
| Harness | https://disney.harness.io | CI/CD Deployments |
| Akamai | https://control.akamai.com/apps/edge-diagnostics | Translate Error String |
