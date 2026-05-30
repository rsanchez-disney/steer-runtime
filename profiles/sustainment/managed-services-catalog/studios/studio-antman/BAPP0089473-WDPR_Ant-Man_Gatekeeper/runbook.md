# Runbook — WDPR Ant-Man Gatekeeper

## Restart Procedures

1. Identify unhealthy ECS tasks via AWS Console (account: 211570175858, cluster: wdpr-content-B0089473-usw2-prod-ant-man-gate)
2. Stop affected task(s) — ECS auto-replaces with new instances
3. Monitor new tasks reaching RUNNING state and passing health checks

**Validation:**
- Health check returns 200: `https://ant-man-gatekeeper.wdprapps.disney.com/information`
- SDL Connect test: `https://prod-stage.d-scribe-gatekeeper.wdprapps.disney.com/sdl/connect/test`
- Splunk error rate returns to baseline: `index=wdpr_d-scribe source="*gatekeeper-prod/*" ERROR earliest=-15m | timechart count`
- Check AppDynamics: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1585&dashboardMode=force

---

## Scaling

- **Scale up:** Increase ECS desired count during bulk publication operations.
- **Scale down:** Safe during off-hours. Minimum 2 tasks in production.

## Failover

- Multi-AZ ECS Fargate deployment — automatic task replacement on failure
- CloudWatch dashboard: wdpr-content-ant-man-services-fargate-prod

## Rollback

- Use Harness pipeline to redeploy previous stable version: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Content_Management_System/projects/WDPR_AntMan_Gatekeeper/pipelines
- Verify publication operations work correctly post-rollback

## Publication Management Endpoints

| Action | URL Pattern |
|--------|-------------|
| Refresh publications | `https://{env}.d-scribe-gatekeeper.wdprapps.disney.com/gatekeeper/publications/refresh` |
| List publications | `https://{env}.d-scribe-gatekeeper.wdprapps.disney.com/gatekeeper/publications/list` |
| SDL Connect test | `https://{env}.d-scribe-gatekeeper.wdprapps.disney.com/sdl/connect/test` |

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| MongoDB | SE / DBA Team | Mongo DB connectivity issues |
| SDL Connect | Ant-Man Dev team | Translation/localization failures |
| Product Mapper | Ant-Man Sustainment | Product mapping issues |
| Cloud Platform | Platform Engineering | ECS/infrastructure issues |
