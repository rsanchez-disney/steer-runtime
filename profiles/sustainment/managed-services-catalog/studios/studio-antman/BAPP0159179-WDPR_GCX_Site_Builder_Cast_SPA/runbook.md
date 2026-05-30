# Runbook — GCX Site Builder Cast SPA

## Restart Procedures

1. Identify unhealthy ECS tasks via AWS Console (account: 211570175858, service: gcx-cast-spa-prod-live)
2. Stop affected task(s) — ECS auto-replaces with new instances
3. Monitor new tasks reaching RUNNING state and passing health checks

**Validation:**
- Health check returns 200: `https://cast-portals.wdprapps.disney.com/information`
- Splunk error rate returns to baseline: `index=wdpr_d-scribe source="*cast-spa-prod*" level=ERROR earliest=-15m | timechart count`
- Application loads in browser without errors

---

## Scaling

- **Scale up:** Increase ECS desired count during peak Cast Member portal usage.
- **Scale down:** Safe during off-hours. Minimum 2 tasks in production.

## Failover

- Multi-AZ ECS Fargate deployment — automatic task replacement on failure
- CloudWatch dashboard: wdpr-content-ant-man-services-fargate-prod

## Rollback

- Use Harness pipeline to redeploy previous stable version
- Verify application loads correctly in browser (incognito) post-rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Cast Portals WebAPI | Ant-Man Sustainment | Backend data issues |
| D-Scribe Content Pipeline | Ant-Man Sustainment | Content not updating |
| Cloud Platform | Platform Engineering | ECS/infrastructure issues |
