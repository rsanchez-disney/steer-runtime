# Runbook — WDPR Mobile Device Notification Optin Service

## Restart Procedures

1. Use Rundeck: https://rundeck.wdprapps.disney.com/project/mobile-notification-svc-ha_aws/jobs
2. Or redeploy via Harness pipeline: mobile-notification-svc
3. Or use Nimbus: https://c3po.wdprapps.disney.com/ui/ (nimbus_deploy/mobile-notification-svc-ha)

**Validation:** Hit healthcheck endpoint: https://use1.mobile-notification-ha.gam-prod.wdprapps.disney.com/mobile-notification-svc/healthcheck (and usw2 equivalent)

---

## Scaling

- **Scale up:** ECS Fargate auto-scaling. Manual scaling via AWS Console or Nimbus if needed.
- **Scale down:** ECS Fargate auto-scaling handles scale-down.

## Failover

- Active-active across US-EAST-1 and US-WEST-2. Route 53 handles failover between regions.
- If one region is unhealthy, traffic routes to the other region automatically.

## Rollback

- Redeploy previous version via Harness pipeline: mobile-notification-svc
- Rundeck: mobile-notification-svc-ha_aws
- Nimbus: nimbus_deploy/mobile-notification-svc-ha

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Mobile Apps (WDW/DLR) | Mark Lewis | When mobile app integration issues arise |
| DynamoDB | AWS Support | When DynamoDB throttling or availability issues |
| Vault Secrets | DevOps | When secret rotation or access issues |
