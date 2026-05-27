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
- If one region fails, traffic automatically routes to the other region.

## Rollback

- Use Harness pipeline to redeploy previous version.
- Nimbus: nimbus_deploy/preference-service-ha (https://c3po.wdprapps.disney.com/ui/)
- Rundeck: Job 03. Deploy Live - HA

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| DynamoDB | AWS Support | Throttling or table issues |
| Profile B2C | Andrew Southwick | If B2C is failing due to preference data |
| Profile WebAPI WAM | Andrew Southwick | If WAM is failing due to preference data |
