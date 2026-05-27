# Runbook — DLP Keyring

## Restart Procedures

### ECS Services (Keyring Main, CNS PRC Listener, Ticket Provider, Package Digital Provider)

1. Navigate to AWS ECS Console → eu-west-1 → Cluster (e.g., `oid01a-prod`)
2. Select the service → Update → Force new deployment
3. Monitor new tasks reaching RUNNING state

**Validation:**
- Light health check: `curl -s https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/<service-name>/healthcheck`
- Deep health check: `curl -s https://dlpis-digital.wdprapps.disney.com/WDPR-DLP-IS/<service-name>/healthcheck/deep`
- Verify in Splunk that new logs appear with updated `Identifiers.Version`

### Lambda Functions (BMACS Reconciliation, Ticket Provider)

1. Lambda functions are triggered by CloudWatch Events schedules — no manual restart needed
2. To force execution: AWS Lambda Console → Test with scheduled event payload:
   ```json
   {"id":"manual-trigger","detail-type":"Scheduled Event","source":"aws.events","account":"","time":"","region":"eu-west-1","resources":[],"detail":{}}
   ```

**Validation:**
- Check CloudWatch Logs for successful execution
- Verify Keyring Main received reconciliation/linking requests in Splunk

---

## Scaling

- **Scale up (ECS):** Update desired count in ECS service definition. All services are stateless and can scale horizontally.
- **Scale down (ECS):** Reduce desired count. Ensure at least 2 tasks remain for availability.
- **Lambda:** Concurrency is managed by AWS. Adjust reserved concurrency if throttling occurs.

## Failover

- ECS services run across multiple AZs in eu-west-1 — automatic failover on task failure
- MariaDB: RDS Multi-AZ (automatic failover, ~60s downtime)
- RabbitMQ: Messages persist in queue during consumer downtime; processing resumes on recovery
- GCP Pub/Sub: Messages retained per subscription retention policy; CNS PRC Listener resumes from last ack

## Rollback

- **Harness:** Use Harness pipeline rollback feature to redeploy previous artifact version
- **ECS:** Update task definition to previous revision, force new deployment
- **Lambda:** Update function code to previous S3 artifact version via Jenkins `aws-lambda-live-auto` job or Harness pipeline

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| OneID / Identity | OneID team | GCP Pub/Sub subscription issues, profile retrieval failures |
| BMacs (Booking) | BMacs team | Booking data inconsistencies, reconciliation failures |
| DLP Infrastructure | DLP Infra team | RabbitMQ broker issues, network connectivity |
| AWS Platform | Cloud Platform team | ECS cluster issues, RDS failover, Lambda throttling |
| TMS (Ticket Management) | TMS team | Ticket linking service failures |
