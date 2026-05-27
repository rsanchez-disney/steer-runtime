# Runbook — WDPR Profile B2B

## Restart Procedures

1. Use Rundeck: profile-b2b-ha_aws → Job: 03. Deploy Live - HA
2. Or force new deployment via ECS console on cluster wdw-gam-S0246132-use1-profile-b2b-ha-svc-prd (East) / dlr-gam-S0246132-usw2-profile-b2b-svc-prd (West)

**Validation:** Check health at https://use1.profile-b2b-ha.gam-prod.wdprapps.disney.com/profile-b2b/v1/bb8/status/summary

---

## Scaling

- **Scale up:** Adjust ECS desired count in both us-east-1 and us-west-2 clusters.
- **Scale down:** Reduce ECS desired count. Monitor downstream consumer error rates.

## Failover

- Active-active across US-EAST-1 and US-WEST-2 via Route53 geo routing.
- If one region fails, traffic automatically routes to the other region.
- Verify both health endpoints: use1.profile-b2b-ha.gam-prod and usw2.profile-b2b-ha.gam-prod

## Rollback

- Use Jenkins pipeline: 2. Stability-Stream [profile-b2b-HA]
- Nimbus: nimbus_deploy/profile-b2b-ha

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Profile B2C | Andrew Southwick | If B2C data source is failing |
| OneID | OneID Team | Service token authentication failures |
| GAM | GAM Team | Guest account management issues |
| Downstream consumers | Varies | If they report B2B endpoint failures |
