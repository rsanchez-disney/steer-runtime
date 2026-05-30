# Runbook — WDPR Ant-Man Ragnarok

## Restart Procedures

1. Identify unhealthy ECS tasks via AWS Console (account: 211570175858, service: antman-ragnarok-prod-live)
2. Stop affected task(s) — ECS auto-replaces with new instances
3. Monitor new tasks reaching RUNNING state and passing health checks

**Validation:**
- Health check returns 200: `https://antman-ragnarok.wdprapps.disney.com/information`
- Splunk error rate returns to baseline: `index=wdpr_d-scribe source="*ragnarok-prod/*" level=ERROR earliest=-15m | timechart count`

---

## Scaling

- **Scale up:** Increase ECS desired count during peak content operations.
- **Scale down:** Safe during off-hours. Minimum 2 tasks in production.

## Failover

- Multi-AZ ECS Fargate deployment — automatic task replacement on failure
- CloudWatch dashboard: PACE-DLR-wdpr-content-S0001431-usw2-prd-5Ver

## Rollback

- Use Harness pipeline to redeploy previous stable version
- Verify content operations and .ini validation work correctly post-rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| D-Scribe Content Pipeline | Ant-Man Sustainment | Content not flowing |
| S3 / Cloud Platform | Platform Engineering | S3 access or ECS issues |
