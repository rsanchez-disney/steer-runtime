# Runbook — WDPR Ant-Man Assembler

## Restart Procedures

1. Identify unhealthy ECS tasks via AWS Console (account: 211570175858, cluster: wdpr-content-B0089443-usw2-prod-ant-man-assembler)
2. Stop affected task(s) — ECS auto-replaces with new instances
3. Monitor new tasks reaching RUNNING state and passing health checks

**Validation:**
- Health check returns 200: `https://ant-man-assembler.wdprapps.disney.com/information`
- Splunk error rate returns to baseline: `index=wdpr_d-scribe source="*assembler-prod/*" ERROR earliest=-15m | timechart count`
- Check AppDynamics: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1613&dashboardMode=force

---

## Scaling

- **Scale up:** Increase ECS desired count during bulk publish operations or content campaigns.
- **Scale down:** Safe during off-hours. Minimum 2 tasks in production.

## Failover

- Multi-AZ ECS Fargate deployment — automatic task replacement on failure
- CloudWatch dashboard: wdpr-content-ant-man-services-fargate-prod

## Rollback

- Use Harness pipeline to redeploy previous stable version: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Content_Management_System/projects/WDPR_AntMan_Assembler/pipelines
- Verify content publish operations work correctly post-rollback

## Publish Service Endpoints

| Environment | URL |
|-------------|-----|
| Prod | https://d-scribe-assembler.wdprapps.disney.com/d-scribe/assemblies/publish |
| Stage | https://stage.d-scribe-assembler.wdprapps.disney.com/d-scribe/assemblies/publish |
| Load | https://load.d-scribe-assembler.wdprapps.disney.com/d-scribe/assemblies/publish |
| Latest | https://latest.d-scribe-assembler.wdprapps.disney.com/d-scribe/assemblies/publish |

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| CMS/Tridion | Content Platform team | Source content data issues |
| DAM/AEM | Park's SE (create INC) | CDN Vision DAM access denied |
| ARTU (Realtime Publisher) | Ant-Man Sustainment | Failed delete notifications to Couchbase |
| Media Service | Ant-Man Sustainment | MediaServiceNotifier failures |
| Cloud Platform | Platform Engineering | ECS/infrastructure issues |

## Slack Channels

- d-scribe-publish-dev (publish notifications - dev)
- d-scribe-publish-latest (publish notifications - latest)
- d-scribe-publish-stage (publish notifications - stage)
