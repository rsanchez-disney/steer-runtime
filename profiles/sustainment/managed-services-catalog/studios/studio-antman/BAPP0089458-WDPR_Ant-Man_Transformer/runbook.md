# Runbook — WDPR Ant-Man Transformer

## Restart Procedures

1. Identify unhealthy ECS tasks via AWS Console (account: 211570175858, cluster: wdpr-content-B0089458-usw2-prod-ant-man-trans)
2. Stop affected task(s) — ECS auto-replaces with new instances
3. Monitor new tasks reaching RUNNING state and passing health checks

**Validation:**
- Health check returns 200: `https://ant-man-transformer.wdprapps.disney.com/information`
- Splunk error rate returns to baseline: `index=wdpr_d-scribe source="*transformer-prod/*" ERROR earliest=-15m | timechart count`
- Check AppDynamics: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1590&dashboardMode=force

---

## Scaling

- **Scale up:** Increase ECS desired count during bulk content transformation periods.
- **Scale down:** Safe during off-hours. Minimum 2 tasks in production.

## Failover

- Multi-AZ ECS Fargate deployment — automatic task replacement on failure
- CloudWatch dashboard: wdpr-content-ant-man-services-fargate-prod

## Rollback

- Use Harness pipeline to redeploy previous stable version: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Content_Management_System/projects/WDPR_AntMan_Transformer/pipelines
- Verify content transformation operations work correctly post-rollback

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Ant-Man Assembler | Ant-Man Sustainment | Source content issues |
| Ant-Man Watcher | Ant-Man Sustainment | Downstream consumption issues |
| S3 / Cloud Platform | Platform Engineering | S3 access or ECS issues |
