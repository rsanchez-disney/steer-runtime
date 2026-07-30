# Runbook — WDPRD Preference Service

## Restart Procedures

1. Use Rundeck: preference-service-ha_aws (https://rundeck.wdprapps.disney.com/project/preference-service-ha_aws/jobs)
2. Or force new deployment via ECS console on cluster wdw-gam2-B0170520-use1-prd (East) / dlr-gam-B0170520-usw2-prd (West)

**Validation:** Check health at https://use1.preference-svc-ha.gam-prod.wdprapps.disney.com/preference-service/v1/bb8/status/summary

---

## Scaling

- **Scale up:** Adjust ECS desired count in both us-east-1 and us-west-2 clusters.
- **Scale down:** Reduce ECS desired count. Monitor DynamoDB throttling metrics.

## Failover

- Active-active across US-EAST-1 and US-WEST-2 via Route53 geo routing.
- DynamoDB Global Tables provide cross-region replication.
- ElastiCache Redis in each region (independent, not replicated).
- If one region fails, traffic automatically routes to the other region.

## Rollback

- Use Harness pipeline to redeploy previous version.
- Nimbus: nimbus_deploy/preference-service-ha (https://c3po.wdprapps.disney.com/ui/)
- Rundeck: Job 03. Deploy Live - HA

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
| Preference Architecture | Andrew Southwick | andrew.southwick@disney.com | Architecture decisions, data model changes |
| DynamoDB | AWS Support | — | Throttling or table issues |
| Profile B2C (BAPP0245892) | Andrew Southwick | andrew.southwick@disney.com | If B2C failing due to preference data |
| Profile WebAPI WAM (BAPP0253435) | Andrew Southwick | andrew.southwick@disney.com | If WAM failing due to preference data |
| MNO (BAPP0229223) | Andrew Southwick | andrew.southwick@disney.com | Push notification preference issues |
| Preference Admin (BAPP0192854) | Gino Caverzan | gino.x.caverzan.-nd@disney.com | Admin UI issues |
| Glenn Raposo | Disney Manager | glenn.raposo@disney.com | Web/Services ownership |
| Krista Betts | Tech Director | krista.l.betts@disney.com | Executive escalation |

## Useful Tools

| Tool | URL | Purpose |
|------|-----|---------|
| ServiceNow | https://disney.service-now.com | INCs, CTASKs, PRBs |
| Splunk PROD | https://splunk.wdprapps.disney.com | index: wdpr-gam |
| AppDynamics | https://disney-prod.saas.appdynamics.com | prod-gam-profile-svc-aws |
| Grafana | https://grafana.wdprapps.disney.com | Profile-Prod-Active-Active-Dashboard |
| AWS CloudWatch | https://aws.wdprapps.disney.com | ECS, DynamoDB, ElastiCache |
| Harness | https://disney.harness.io | CI/CD Deployments |
| Rundeck | https://rundeck.wdprapps.disney.com/project/preference-service-ha_aws/jobs | Deploy/Restart |
| Snowman | https://tools.toolbox.disney.com/snowman | Bulk Incident Update |
