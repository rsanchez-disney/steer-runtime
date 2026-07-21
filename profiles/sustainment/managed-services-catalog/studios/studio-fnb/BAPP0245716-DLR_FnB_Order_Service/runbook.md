# Runbook — DLR FnB Order Service

## Restart Procedures

1. AWS Console → ECS → Cluster: dlr-revmgmt-S0001533-usw2-prd
2. Service: fnb-order-svc-prod-live
3. "Update service" → "Force new deployment"
4. Rundeck: https://rundeck.wdprapps.disney.com/project/fnb-order-service_aws/jobs

**Validation:**
- Monitor Splunk index=wdpr_fnb_order_service for errors
- AppDynamics: application 1425

---

## Scaling

- **Scale up:** Increase ECS desired count.
- **Scale down:** Min 2 tasks.

## Failover

- DynamoDB cross-region replica (us-east-1)
- Redis auto-failover within AZ

## Rollback

- Rundeck: deploy previous task definition revision

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| MOO | prd-global-fnb | Order flow issues |
