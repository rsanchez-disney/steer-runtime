# Runbook — WDPR Ant-Man Collector

## Restart Procedures

1. Identify unhealthy ECS tasks via AWS Console (account: 876496569223, cluster: d-scribe-prod, service: collector-d-scribe-prod-live)
2. Stop affected task(s) — ECS auto-replaces with new instances
3. Monitor message consumption resumption

**Validation:**
- Health check returns 200: `https://d-scribe-collector.wdprapps.disney.com/information`
- Check AppDynamics: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=653&dashboardMode=force

---

## Scaling

- **Scale up:** Increase ECS desired count when message backlog is growing.
- **Scale down:** Only when queue is empty. Minimum 1 task in production.

## Failover

- Multi-AZ ECS Fargate deployment — automatic task replacement
- Messages persist in queue until consumed — no data loss on restart
- CloudWatch dashboard: PACE-DLR-d-scribe-prod-Ver5

## Rollback

- Use Harness pipeline to redeploy previous version: https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Content_Management_System/projects/WDPR_AntMan_Collector/pipelines
- Verify message consumption resumes and S3 writes succeed

## Key Service Endpoints

| Service | URL |
|---------|-----|
| Collector (prod) | https://d-scribe-collector.wdprapps.disney.com |
| Collector (prod-load) | https://prod-load.d-scribe-collector.wdprapps.disney.com |
| Collector Internal | https://prod-stage.d-scribe-collector-internal.wdprapps.disney.com |
| Schedule Update (manual) | https://{env}.d-scribe-collector-internal.wdprapps.disney.com/sdm/ScheduleUpdate?EnterpriseId={EID}&ContentType={CT}&force=true |

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| SDM Courier / MMA | SE (Site Engineering) | Courier or MMA queue issues |
| D-Scribe Schedule Service | Ant-Man Sustainment | Schedule data enrichment failures |
| Pricing View / Dream | Manojkumar Dash | Schedule display issues |
| Content (ticket/atscode) | Melissa Hunt / AG: app-flwdw-TBXLoad | Content republish needed |
| Facilities Publishing | Jyl Deshler, Cindy Lovejoy | Facilities not published |
| Cloud Platform | Platform Engineering | ECS/infrastructure issues |
