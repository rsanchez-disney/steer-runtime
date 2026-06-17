# Runbook — DLP DGE API.Magic Mobile Ticket Meal Plan

## Restart Procedures

### ECS Service

1. Navigate to AWS ECS Console → eu-west-1 → Cluster `dlp-apps-S0001481-euw1-prd`
2. Select service `bma-magic-mobile-provider-prod-live` → Update → Force new deployment
3. Monitor new tasks reaching RUNNING state

**Validation:**
- Verify health check and deep health check return 200
- Check Splunk dashboard "wdpr-dlp-is-lodging-bma-magic-mobile-provider" for new logs
- Verify AppDynamics "lodging-bma-magic-mobile-provider" shows healthy metrics

---

## Scaling

- **Scale up:** Update desired count in ECS service definition. Service is stateless and can scale horizontally.
- **Scale down:** Reduce desired count. Ensure at least 2 tasks remain for availability.

## Failover

- ECS service runs across multiple AZs in eu-west-1 — automatic failover on task failure
- If Opera (hotel PMS) is down, MagicPass status cannot be updated but existing passes remain functional

## Rollback

- **ECS:** Update task definition to previous revision, force new deployment

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Opera (Hotel PMS) | Hotel systems team | MagicPass block/unblock issues, reservation data problems |
| BMACS | Booking team | Hotel reservation data inconsistencies |
| NRT Team | NRT | Hotel change scenarios, guest add/remove operations |
