# Runbook — WDPRD Profile JWT service

## Restart Procedures

1. Access ECS cluster in AWS Console (wdpr-gam-prod account)
2. Navigate to cluster: wdw-gam-B0082610-use1-profile-jwt-ha-jwt-prd (East) or dlr-gam-B0082610-usw2-profile-jwt-ha-jwt-prd (West)
3. Force new deployment on service jwt-ha-prod

**Validation:** Hit health check URL: use1.profile-jwt-ha.gam-prod.wdprapps.disney.com/jwt-service/api/v1/healthcheck

---

## Scaling

- **Scale up:** Increase desired task count in ECS service configuration
- **Scale down:** Reduce desired task count (monitor error rates before scaling down)

## Failover

- Active-active across US-EAST-1 and US-WEST-2. Route 53 handles geo-routing. If one region fails, traffic routes to the other.

## Rollback

- Use Rundeck job: jwt-service-gam-ha_aws → Job: 03. Deploy Live - HA (deploy previous version)
- Nimbus: nimbus_deploy/jwt-service-gam-ha

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| DynamoDB | AWS Support | Throttling or table issues |
| OneID | IDY Team | Authentication failures upstream |
| AuthenticatorJS | Cesar Munoz | If JWT calls are failing from AuthenticatorJS side |
