# Runbook — WDPR Ant-Man Watcher

## Restart Procedures

1. Identify unhealthy ECS tasks via AWS Console (account: 211570175858, service: ant-man-watcher-prod-live)
2. Stop affected task(s) — ECS auto-replaces with new instances
3. Monitor new tasks reaching RUNNING state and passing health checks

**Validation:**
- Health check returns 200: `https://ant-man-watcher.wdprapps.disney.com/information`
- Splunk error rate returns to baseline: `index=wdpr_d-scribe source="*watcher-prod/*" ERROR | rex "\"statusCode\":\"(?<errorCode>\d\d\d)\"" | rex "\"message\":\"(?<message>[^\"]+)\"" | stats count by errorCode, message | sort -count`
- Splunk dashboard: https://splunk.wdprapps.disney.com/en-GB/app/launcher/watcher_prod

---

## Scaling

- **Scale up:** Increase ECS desired count during high-traffic content consumption periods.
- **Scale down:** Safe during off-hours. Minimum 2 tasks in production.

## Failover

- Multi-AZ ECS Fargate deployment — automatic task replacement on failure
- CloudWatch dashboard: wdpr-content-ant-man-services-fargate-prod

## Rollback

- Use Harness pipeline to redeploy previous stable version
- Verify content read operations and combine data work correctly post-rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Goliath | Ant-Man Sustainment | Combine data returning null |
| gcx-tools-api | Ant-Man Sustainment | Process combine failures |
| S3 / Cloud Platform | Platform Engineering | S3 access or ECS issues |
| Assembler/Transformer | Ant-Man Sustainment | Content not being published to S3 |
