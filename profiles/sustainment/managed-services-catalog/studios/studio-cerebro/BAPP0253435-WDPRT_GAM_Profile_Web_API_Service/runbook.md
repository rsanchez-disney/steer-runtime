# Runbook — WDPRT GAM Profile Web API Service

## Restart Procedures

1. Access ECS cluster in AWS Console (wdpr-gam-prod account)
2. Navigate to cluster: wdw-gam2-B0082601-use1-profile-wam-ha-wam-prd (East) or dlr-gam-B0082601-usw2-profile-wam-ha-wam-prd (West)
3. Force new deployment on service profile-wam-ha-prod

**Validation:** Hit health check: origin.profile-wam.wdprapps.disney.com/profile-api/healthcheck (East) and origin.usw2.profile-wam.wdprapps.disney.com/profile-api/healthcheck (West)

---

## Scaling

- **Scale up:** Increase desired task count in ECS service. Alert threshold: CPU > 30% | Memory > 50%
- **Scale down:** Reduce desired task count after confirming error rates are within endpoint thresholds

## Failover

- Active-active across US-EAST-1 and US-WEST-2. Route 53 geo-routing handles automatic failover.
- DynamoDB global table ensures session data is available in both regions.

## Rollback

- Use Harness pipeline (disney.harness.io) to deploy previous version
- Nimbus: nimbus_deploy/profile-wam-ha
- Vault paths (Prod): secret/gam2/profile/wam-ha/us-east-1/prod (East) | secret/gam/profile/wam-ha/us-west-2/prod (West)

## Contacts for External Dependencies

| System | Contact | Email | When to Engage |
|--------|---------|-------|----------------|
| WAM Architecture | Andrew Southwick | andrew.southwick@disney.com | Architecture, routing decisions |
| GAM | Enterprise Technology | — | GAM routing failures (500 errors) |
| DynamoDB | AWS Support | — | Session throttling, table issues |
| OneID | IDY Team (Jira) | — | Authentication failures |
| Profile B2C (BAPP0245892) | Andrew Southwick | andrew.southwick@disney.com | Backend API failures |
| VAS (BAPP0242566) | Martin Uribe | martin.x.uribe.-nd@disney.com | Data aggregation failures |
| D-Scribe | External team | — | Content retrieval failures |
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
| Splunk PROD | https://splunk.wdprapps.disney.com | index: wdpr-gam (ids.app=wdw-webapi) |
| AppDynamics | https://disney-prod.saas.appdynamics.com | prod-gam-profile-svc-aws |
| Grafana | https://grafana.wdprapps.disney.com | Profile-Prod-Active-Active-Dashboard |
| AWS CloudWatch | https://aws.wdprapps.disney.com | ECS, DynamoDB metrics |
| Harness | https://disney.harness.io | CI/CD Deployments |
| Snowman | https://tools.toolbox.disney.com/snowman | Bulk Incident Update |
