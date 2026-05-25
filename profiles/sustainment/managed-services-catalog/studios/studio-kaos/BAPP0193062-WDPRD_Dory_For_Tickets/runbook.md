# Runbook — WDPRD Dory For Tickets

## Health Checks

- Production: https://doryfortickets.wdprapps.disney.com/dory-for-tickets/healthcheck
- Stage: https://stage.doryfortickets.wdprapps.disney.com/dory-for-tickets/healthcheck
- Load: https://load.doryfortickets.wdprapps.disney.com/dory-for-tickets/healthcheck
- Latest: https://latest.doryfortickets.wdprapps.disney.com/dory-for-tickets/healthcheck

## Restart Procedures

1. Identify the ECS cluster: `wdpr-ecommerce-S0001323-usw2-prd` (West2 Region)
2. Force new deployment via ECS console or CLI:
   ```bash
   aws ecs update-service --cluster wdpr-ecommerce-S0001323-usw2-prd --service doryfortickets-api-prod-live --force-new-deployment
   ```
3. Monitor task drain — wait for old tasks to stop and new tasks to reach RUNNING state
4. Validate health check returns 200

**Validation:** Confirm healthcheck passes and Splunk shows no startup errors:
```spl
index=wdpr_dory_for_tickets "startup" OR "initialization" earliest=-15m
```

---

## Scaling

Dory For Tickets is a low-traffic internal service (privacy request orchestrator). Not listed in PACE Pre Scale Policies.

| Parameter | Value |
|-----------|-------|
| PACE Configured | No |
| Region | West2 (us-west-2) |
| Cluster | wdpr-ecommerce-S0001323-usw2-prd |
| Service | doryfortickets-api-prod-live |

- **Scale up:** Manually increase desired count in ECS if processing backlog builds up (e.g., regulatory deadline spike)
- **Scale down:** Return to baseline desired count after backlog clears

## Failover

- Single-region deployment (us-west-2). No cross-region failover configured.
- If service is unhealthy, restart via ECS force new deployment.
- Dory is stateless — no data loss on restart.

## Rollback

- Revert task definition to previous revision via ECS console
- Force new deployment with previous task definition
- Validate health check and Splunk logs for errors post-rollback
- Harness pipeline: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/ci/orgs/Commerce/projects/WDPRD_Dory_For_Tickets/deployments

## Monitoring

- **Splunk index:** `wdpr_dory_for_tickets`
- **AppDynamics:** https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_INFRASTRUCTURE&application=515&component=306832
- **Architecture:** https://docs.google.com/drawings/d/15jIC8mTphwjNqP6ggmcfUCiFirzo8Nhg79vxTocI4BM/edit

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Incognito Service | Incognito team | Integration issues, request routing failures |
| TMS | web-global-salestickets | Downstream timeout/errors on RTA/RTF |
| Booking Service | web-global-salestickets | Downstream timeout/errors on RTA/RTF |
| CME | app-global-cme | Downstream timeout/errors on RTA/RTF |
