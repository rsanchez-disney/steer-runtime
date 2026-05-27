# Runbook — WDPR Profile View Assembly Service

## Restart Procedures

1. Use Rundeck: profile-view-assembly-service-ha_aws (https://rundeck.wdprapps.disney.com/project/profile-view-assembly-service-ha_aws/jobs)
2. Or force new deployment via ECS console on cluster wdw-gam-B0242566-use1-prd (East) / dlr-gam-B0242566-usw2-prd (West)

**Validation:** Check health at https://use1.profile-vas-ha.gam-prod.wdprapps.disney.com/profile-view-assembly-service/v1/bb8/status/summary

---

## Scaling

- **Scale up:** Adjust ECS desired count in both us-east-1 and us-west-2 clusters.
- **Scale down:** Reduce ECS desired count. Monitor for increased latency.

## Failover

- Active-active across US-EAST-1 and US-WEST-2 via Route53 geo routing.
- If one region fails, traffic automatically routes to the other region.
- Verify both health endpoints: use1.profile-vas-ha.gam-prod.wdprapps.disney.com and usw2.profile-vas-ha.gam-prod.wdprapps.disney.com

## Rollback

- Use Harness pipeline to redeploy previous version.
- Nimbus: nimbus_deploy/profile-view-assembly-service-ha (https://c3po.wdprapps.disney.com/ui/)
- Rundeck: Job 03. Deploy Live - HA

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| XBMS | XBMS Team | MagicBand/DisneyBand order data failures |
| DCL Reservation Service | DCL Team | DCL reservation data unavailable |
| Facility Service | Facility Team | Facility/location data failures |
| Avatar Service | Profile Team | Avatar loading failures |
| GAM (FnF) | Profile Team | Friends with plans data issues |
