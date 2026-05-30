# Runbook — WDPR Ant-Man Query

## Restart Procedures

1. Identify unhealthy ECS tasks via AWS Console (account: 211570175858, cluster: wdpr-content-S0001431-usw2-prd)
2. Stop affected task(s) — ECS auto-replaces with new instances
3. Monitor new tasks reaching RUNNING state and passing health checks

**Validation:**
- Health check returns 200: `https://ant-man-query.wdprapps.disney.com/information`
- Latency returns to baseline: 
- Check AppDynamics: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1184&dashboardMode=force

---

## Scaling

- **Scale up:** Increase ECS desired count. Query is a high-traffic service — scale aggressively during peak content consumption.
- **Scale down:** Only during confirmed low-traffic windows. Minimum 2 tasks in production.

## Failover

- Multi-AZ ECS EC2 deployment with ALB health checks
- Unhealthy tasks are automatically deregistered and replaced
- CloudWatch dashboard: PACE-DLR-wdpr-content-S0001431-usw2-prd-Ver5

## Rollback

- Use Harness pipeline to redeploy previous version: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Content_Management_System/projects/WDPR_AntMan_Query/pipelines
- Verify response times and error rates post-rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Ant-Man Assembler/Transformer | Ant-Man Sustainment | Stale content issues (upstream) |
| S3 / Cloud Platform | Platform Engineering | S3 access or ECS issues |
| Consumer Teams | Varies | Consumer-side issues |
