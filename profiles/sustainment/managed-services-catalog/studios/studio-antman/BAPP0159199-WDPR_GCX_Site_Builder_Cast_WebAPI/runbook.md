# Runbook — GCX Site Builder Cast WebAPI

## Restart Procedures

1. Identify unhealthy ECS tasks via AWS Console (account: 211570175858, cluster: wdpr-content-B0159179-usw2-prod-gcx-cast-portals)
2. Stop affected task(s) — ECS auto-replaces with new instances
3. Monitor new tasks reaching RUNNING state and passing health checks

**Validation:**
- Health check returns 200: `https://cast-portals.wdprapps.disney.com/cast-api/information`
- Splunk error rate returns to baseline: `index=wdpr_d-scribe source="*cast-webapi-prod*" level=ERROR earliest=-15m | timechart count`
- Check AppDynamics: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1587&dashboardMode=force

---

## Scaling

- **Scale up:** Increase ECS desired count during peak Cast Portal usage.
- **Scale down:** Safe during off-hours. Minimum 2 tasks in production.

## Failover

- Multi-AZ ECS Fargate deployment — automatic task replacement on failure
- CloudWatch dashboard: wdpr-content-ant-man-services-fargate-prod

## Rollback

- Use Harness pipeline to redeploy previous stable version: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Content_Management_System/projects/WDPR_GCX_Site_Builder_Cast_WebAPI/pipelines
- Verify API responses work correctly post-rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Cast Portals SPA | Ant-Man Sustainment | Frontend issues related to API |
| D-Scribe Content Pipeline | Ant-Man Sustainment | Content not available in S3 |
| Cloud Platform | Platform Engineering | ECS/infrastructure issues |
