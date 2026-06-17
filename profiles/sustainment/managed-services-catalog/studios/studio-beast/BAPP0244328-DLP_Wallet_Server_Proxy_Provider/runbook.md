# Runbook — DLP Wallet Server Proxy Provider

## Restart Procedures

### Wallet Server Proxy Provider (ECS)

1. Navigate to AWS ECS Console → eu-west-1 → Cluster `dlp-apps-S0001481-euw1-prd`
2. Select service `wallet-server-proxy-provider-prod-live` → Update → Force new deployment
3. Monitor new tasks reaching RUNNING state

**Validation:**
- Health check: verify `/healthcheck` endpoint returns 200
- Deep health check: verify `/healthcheck/deep` endpoint returns 200
- Confirm in Splunk (Global Technical Dashboard) that new logs appear

### Wallet Pass Purge Processor (Batch)

1. This is a scheduled batch process that runs daily at 6:00 AM
2. No manual restart needed — it will execute on next scheduled run
3. To force execution: trigger the batch job manually via Jenkins

**Validation:**
- Check Splunk dashboard (DLP Guest Profile Batchs Executions) for successful completion
- Verify in AppDynamics that the batch completed without errors

---

## Scaling

- **Scale up (Proxy Provider):** Update desired count in ECS service definition. Service is stateless and can scale horizontally.
- **Scale down (Proxy Provider):** Reduce desired count. Ensure at least 2 tasks remain for availability.
- **Purge Processor:** Batch job — scaling not applicable. If processing time is too long, review batch size configuration.

## Failover

- ECS services run across multiple AZs in eu-west-1 — automatic failover on task failure
- Purge Processor: if batch fails, it will retry on next scheduled run (next day at 6:00 AM)

## Rollback

- **ECS (Proxy Provider):** Update task definition to previous revision, force new deployment
- **Purge Processor:** Redeploy previous artifact version via Jenkins pipeline

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Airship | Airship/Urban Airship team | Native pass push delivery issues, API failures |
| DLP Data Source | DLP backend team | Pass data synchronization failures |
| Apple Wallet / Google Pay | Platform teams | Pass generation/install failures on specific OS |
| AWS Platform | Cloud Platform team | ECS cluster issues, scheduling failures |
