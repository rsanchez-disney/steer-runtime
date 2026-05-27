# Runbook — WDPR Child Authorization Service

## Restart Procedures

1. Use Rundeck: child-auth-svc-ha_aws
2. Or force new deployment via ECS console on cluster wdw-gam2-B0225663-use1-child-auth-svc-ha-svc-prd (East) / dlr-gam-B0225663-usw2-child-auth-svc-ha-svc-prd (West)

**Validation:** Check health at https://use1.child-auth-svc-ha.gam-prod.wdprapps.disney.com/child-auth-svc/healthcheck

---

## Scaling

- **Scale up:** Adjust ECS desired count in both us-east-1 and us-west-2 clusters.
- **Scale down:** Reduce ECS desired count. Low traffic service — minimal scaling needed.

## Failover

- Active-active across US-EAST-1 and US-WEST-2 via Route53 geo routing.
- If one region fails, traffic automatically routes to the other region.
- Verify both health endpoints: use1.child-auth-svc-ha.gam-prod and usw2.child-auth-svc-ha.gam-prod

## Rollback

- Use Jenkins pipeline: Build [child-auth-svc-ha]
- Nimbus: nimbus_deploy/child-auth-svc-ha

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| PRIVO | PRIVO Support (external vendor) | Consent verification failures, API errors |
| Profile WebAPI WAM | Andrew Southwick | If WAM child auth flow is broken |
| Profile SPA | Gino Caverzan | If SPA child auth UI is broken |
