# Runbook — WDPR Profile B2C

## Restart Procedures

1. Use Rundeck: profile-b2c-ha_aws → Job: 03. Deploy Live - HA
2. Or force new deployment via ECS console on cluster wdw-gam-B0245892-use1-profile-b2c-ha-svc-prd (East) / dlr-gam-B0245892-usw2-profile-b2c-ha-svc-prd (West)

**Validation:** Check health at https://use1.profile-b2c-ha.gam-prod.wdprapps.disney.com/profile-b2c/v1/bb8/status/summary

---

## Scaling

- **Scale up:** Adjust ECS desired count in both us-east-1 and us-west-2 clusters.
- **Scale down:** Reduce ECS desired count. Note: downscaling at night (2-4 AM ET) may cause brief 401/403 spikes — this is expected behavior (P3).

## Failover

- Active-active across US-EAST-1 and US-WEST-2 via Route53 geo routing.
- If one region fails, traffic automatically routes to the other region.
- Verify both health endpoints: use1.profile-b2c-ha.gam-prod and usw2.profile-b2c-ha.gam-prod

## Rollback

- Use Jenkins pipeline: 2. Stability-Stream [profile-b2c-ha]
- Nimbus: nimbus_deploy/profile-b2c-ha
- GitHub: se-wdpr-infrastructure/nimbus_deploy/blob/master/profile-b2c-ha

## Contacts for External Dependencies

| System | Contact | Email | When to Engage |
|--------|---------|-------|----------------|
| B2C Architecture | Andrew Southwick | andrew.southwick@disney.com | Architecture decisions, critical failures |
| OneID | OneID Team (IDY Jira) | — | Authentication/GuestController failures |
| Preference Service (BAPP0170520) | Andrew Southwick | andrew.southwick@disney.com | Preference data issues |
| Akamai | ops-global-parks-se-guestexp | — | External routing issues |
| GAM | GAM Team | — | Guest account management failures |
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
| Splunk PROD | https://splunk.wdprapps.disney.com | index: wdpr_profile_ui |
| AppDynamics | https://disney-prod.saas.appdynamics.com | prod-gam-profile-svc-aws |
| Grafana | https://grafana.wdprapps.disney.com | Profile-Prod-Active-Active-Dashboard |
| AWS CloudWatch | https://aws.wdprapps.disney.com | ECS Clusters and Alarms |
| Harness | https://disney.harness.io | CI/CD Deployments |
| Snowman | https://tools.toolbox.disney.com/snowman | Bulk Incident Update |
