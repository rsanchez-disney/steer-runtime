# Runbook — WDPR Ant-Man Hawkeye

## Restart Procedures

1. Identify unhealthy ECS tasks via AWS Console (account: 211570175858, cluster: wdpr-content-B0202830-usw2-prod-shuri-hawkeye)
2. Stop affected task(s) — ECS auto-replaces with new instances
3. Monitor new tasks reaching RUNNING state and passing health checks

**Validation:**
- Health check returns 200: `https://shuri-hawkeye.wdprapps.disney.com/information`
- Splunk error rate returns to baseline: `index="wdpr_d-scribe" source="*hawkeye-prod/*" level=ERROR earliest=-15m | timechart count`
- Check AppDynamics: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1675&dashboardMode=force

---

## Scaling

- **Scale up:** Increase ECS desired count during peak content operations.
- **Scale down:** Safe during off-hours. Minimum 2 tasks in production.

## Failover

- Multi-AZ ECS Fargate deployment — automatic task replacement on failure
- CloudWatch dashboard: wdpr-content-ant-man-services-fargate-prod

## Rollback

- Use Harness pipeline to redeploy previous stable version: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Content_Management_System/projects/WDPR_XP_Hawkeye/pipelines
- Verify experience content operations work correctly post-rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| D-Scribe Content Pipeline | Ant-Man Sustainment | Content not flowing |
| S3 / Cloud Platform | Platform Engineering | S3 access or ECS issues |
