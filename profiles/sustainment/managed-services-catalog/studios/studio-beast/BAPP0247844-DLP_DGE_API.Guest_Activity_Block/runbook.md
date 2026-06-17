# Runbook — DLP DGE API.Guest Activity Block

## Restart Procedures

### ECS Service (Provider)

1. Navigate to AWS ECS Console → eu-west-1 → Cluster `dlp-apps-S0001481-euw1-prd`
2. Select service `activity-block-provider-prod-live` → Update → Force new deployment
3. Monitor new tasks reaching RUNNING state

**Validation:**
- Verify health check and deep health check return 200
- Check Splunk dashboard "wdpr-dlp-is-guest-activity-block-provider" for new logs
- Verify RabbitMQ consumer is reconnected (check queue `GPE.GUESTEVENT.DIS.GAB`)

---

## Scaling

- **Scale up:** Update desired count in ECS service definition. Service is stateless (DocumentDB for persistence) and can scale horizontally.
- **Scale down:** Reduce desired count. Ensure at least 2 tasks remain for availability.
- **DocumentDB:** Scaling requires instance type change or adding read replicas.

## Failover

- ECS service runs across multiple AZs in eu-west-1 — automatic failover on task failure
- DocumentDB: Global cluster (`guest-activity-block-docdb-prod-global`) — automatic failover
- RabbitMQ: Messages persist in queue during consumer downtime; processing resumes on recovery

## Rollback

- **Harness:** Use Harness pipeline rollback to redeploy previous artifact
- **ECS:** Update task definition to previous revision, force new deployment
- **Rundeck:** Alternative deployment/operational tasks

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| DocumentDB | ops-global-Flex SRE | Database connectivity, performance, failover issues |
| RabbitMQ | ops-frdlp-CloudOps / DLP.DL-IS.CLOUD.OPS@disney.com | Queue issues, consumer disconnection |
| Nicolas Miel | Dev SME | Application logic, blocking rules, client library issues |
