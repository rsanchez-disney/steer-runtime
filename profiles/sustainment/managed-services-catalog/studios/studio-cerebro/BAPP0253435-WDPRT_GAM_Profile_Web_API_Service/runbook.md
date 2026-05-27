# Runbook — WDPRT GAM Profile Web API Service

## Restart Procedures

1. Access ECS cluster in AWS Console (wdpr-gam-prod account)
2. Navigate to cluster: wdw-gam2-B0082601-use1-profile-wam-ha-wam-prd (East) or dlr-gam-B0082601-usw2-profile-wam-ha-wam-prd (West)
3. Force new deployment on service profile-wam-ha-prod

**Validation:** Hit health check: origin.profile-wam.wdprapps.disney.com/profile-api/healthcheck (East) and origin.usw2.profile-wam.wdprapps.disney.com/profile-api/healthcheck (West)

---

## Scaling

- **Scale up:** Increase desired task count in ECS service. Alert threshold: CPU > 30% | Memory > 50%
- **Scale down:** Reduce desired task count after confirming error rates are within endpoint thresholds

## Failover

- Active-active across US-EAST-1 and US-WEST-2. Route 53 geo-routing handles automatic failover.
- DynamoDB global table ensures session data is available in both regions.

## Rollback

- Use Harness pipeline (disney.harness.io) to deploy previous version
- Nimbus: nimbus_deploy/profile-wam-ha
- Vault paths (Prod): secret/gam2/profile/wam-ha/us-east-1/prod (East) | secret/gam/profile/wam-ha/us-west-2/prod (West)

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| GAM | Enterprise Technology | GAM routing failures (500 errors) |
| DynamoDB | AWS Support | Session throttling, table issues |
| OneID | IDY Team | Authentication failures |
| Profile B2C | Andrew Southwick | Backend API failures |
| VAS | Martin Uribe | Data aggregation failures |
| D-Scribe | External team | Content retrieval failures |
