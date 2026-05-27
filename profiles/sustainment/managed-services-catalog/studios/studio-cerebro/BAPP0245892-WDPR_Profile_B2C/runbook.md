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

| System | Contact | When to Engage |
|--------|---------|----------------|
| OneID | OneID Team | Authentication/GuestController failures |
| Preference Service | Andrew Southwick | Preference data issues |
| Akamai | CDN/WAF Team | External routing issues |
| GAM | GAM Team | Guest account management failures |
