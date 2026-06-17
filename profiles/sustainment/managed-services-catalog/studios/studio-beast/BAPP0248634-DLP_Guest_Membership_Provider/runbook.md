# Runbook — DLP Guest Membership Provider

## Restart Procedures

### ECS Service

1. Navigate to AWS ECS Console → eu-west-1 → Cluster `dlp-apps-S0001481-euw1-prd`
2. Select service `membership-provider-prod-live` → Update → Force new deployment
3. Monitor new tasks reaching RUNNING state

**Validation:**
- Verify health check and deep health check return 200
- Check Splunk dashboard "wdpr-dlp-is-guest-membership-provider" for new logs
- Verify Redis cache connectivity is restored

---

## Scaling

- **Scale up:** Update desired count in ECS service definition. Service is stateless (Redis as cache, MariaDB as persistent store) and can scale horizontally.
- **Scale down:** Reduce desired count. Ensure at least 2 tasks remain for availability.
- **RDS (MariaDB):** Scaling requires instance type change in RDS console.

## Failover

- ECS service runs across multiple AZs in eu-west-1 — automatic failover on task failure
- API Gateway (9xz5ja3qtf) routes traffic to healthy ECS tasks
- MariaDB RDS: managed by AWS, automatic failover if Multi-AZ configured
- Redis: if cache is unavailable, service falls back to calling Disney+ API directly (slower but functional)

## Rollback

- **Jenkins:** Redeploy previous artifact version via Jenkins pipeline
- **ECS:** Update task definition to previous revision, force new deployment

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Disney+ Streaming API | DEE.Technology.Activation-3pp@disney.com | API failures, auth issues, subscription verification errors |
| Disney+ Support (24/7) | Slack: dee2supportcenter / Phone: 860-766-3633 | Urgent Disney+ outage |
| Disney+ Focal Point | max.lesser@disneystreaming.com | Disney Streaming platform down |
| DLP Cloud Ops | DLP.DL-IS.CLOUD.OPS@disney.com (ops-frdlp-CloudOps) | ECS/RDS infrastructure issues |
| DGE Mobile APP | DLP.DL-DGE.MOBILE.SUPPORT@disney.com (app-frdlp-mobile-apps) | Frontend integration issues |
| Miel, Nicolas | Dev SME | Application logic, membership validation issues |
