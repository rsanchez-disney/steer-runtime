# Runbook — WDPR Ant-Man Composite SDM

## Restart Procedures

1. Identify unhealthy ECS tasks via AWS Console (account: 211570175858, cluster: wdpr-content-S0001431-usw2-prd, service: composite-sdm-prod-live)
2. Stop affected task(s) — ECS auto-replaces with new instances
3. Monitor new tasks reaching RUNNING state and passing health checks

**Validation:**
- Health check returns 200: `https://composite-sdm.wdprapps.disney.com/information`
- Splunk error rate returns to baseline: `index="wdpr_d-scribe" source="*composite-sdm-prod/*" level=ERROR earliest=-15m | timechart count`
- Check AppDynamics: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1432&dashboardMode=force

---

## Scaling

- **Scale up:** Increase ECS desired count during bulk notification processing.
- **Scale down:** Safe during off-hours. Minimum 2 tasks in production.

## Failover

- Multi-AZ ECS Fargate deployment — automatic task replacement on failure
- CloudWatch dashboard: PACE-DLR-wdpr-content-S0001431-usw2-prd-Ver5

## Rollback

- Use Harness pipeline to redeploy previous stable version: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Content_Management_System/projects/WDPR_AntMan_Composite_SDM/pipelines
- Verify SDM notifications processing correctly post-rollback

## Manual Republish (GCX Tools API Gateway)

```
GET https://gcx-tools-api.wdprapps.disney.com/sdm/publishnotification?EnterpriseId={EID}&ContentType={CT}&Status=Stored&TargetType=Live&Language=en-US
```

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| RabbitMQ (BAPP0234155) | Ant-Man Sustainment | RMQ connectivity issues |
| SE (Systems Engineering) | SE team | Dependency/infrastructure issues |
| GCX Tools API | Ant-Man Sustainment | Manual republish gateway issues |
| Cloud Platform | Platform Engineering | ECS/S3 issues |
