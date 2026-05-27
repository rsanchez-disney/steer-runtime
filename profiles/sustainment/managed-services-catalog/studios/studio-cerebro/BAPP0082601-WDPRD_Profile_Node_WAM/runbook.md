# Runbook — WDPRD Profile Node WAM

## Restart Procedures

1. This service is DEPRECATED — migrated to Java WAM (BAPP0253435).
2. If still running, restart via ECS service update (force new deployment) in the appropriate cluster.

**Validation:** Check health endpoint at origin.profile-wam.wdprapps.disney.com

---

## Scaling

- **Scale up:** Not applicable — service is deprecated.
- **Scale down:** Not applicable — service is deprecated.

## Failover

- Active-active across US-EAST-1 (WDW) and US-WEST-2 (DLR) via Route53 geo routing.
- All traffic should now be handled by Java WAM (BAPP0253435).

## Rollback

- Use Rundeck job or Jenkins pipeline to redeploy previous version if needed.
- Nimbus: nimbus_deploy/profile-wam-ha

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Java WAM (BAPP0253435) | Andrew Southwick | If traffic is still hitting Node WAM instead of Java WAM |
| OneID | OneID Team | Authentication failures |
| DynamoDB | AWS Support | Session store issues |
