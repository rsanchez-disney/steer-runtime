# Runbook — WDPR Ant-Man Schedules (Kronos)

## Service Details

| Field | Value |
|-------|-------|
| BAPP | BAPP0135882 |
| Runtime | Java 17.0.14, Spring Boot |
| Infra | ECS (AWS account 876496569223, wdpr-apps) |
| Harness | Pipeline: WDPR_AntMan_Schedules / Identifier: dtourkronos |
| ECR | WDPR-ECM/d-tour-kronos |
| Repo | https://github.disney.com/WDPR-ECM/EcmServices (path: d-tour-kronos) |
| Rundeck | ed22f8d8-b21e-4401-91ec-43e481cd436d |

---

## Health Check URLs

| Environment | URL |
|-------------|-----|
| prod | https://d-scribe-schedules.wdprapps.disney.com/information |
| prod-stage | https://prod-stage.d-scribe-schedules.wdprapps.disney.com/information |
| prod-load | https://prod-load.d-scribe-schedules.wdprapps.disney.com/information |
| prod-latest | https://prod-latest.d-scribe-schedules.wdprapps.disney.com/information |
| stage | https://stage.d-scribe-schedules.wdprapps.disney.com/information |
| latest | https://latest.d-scribe-schedules.wdprapps.disney.com/information |

---

## ECS Clusters

| Environment | Cluster |
|-------------|---------|
| prod | d-scribe-prod |
| prod-stage | d-scribe-prod-stage |
| prod-load | d-scribe-prod-load|
| prod-latest | d-scribe-prod-latest |
| stage | d-scribe-stage |
| latest | d-scribe-latest |

---

## Restart Procedures

1. Identify unhealthy ECS tasks in the target cluster
2. Stop the affected task(s) — ECS auto-replaces with new instances
3. Monitor new tasks reaching RUNNING state
4. Validate via health check URL returning 200

**Post-restart validation:**
```
index=wdpr_d-scribe source="*schedules-prod/*" ERROR earliest=-15m | timechart count
```

---

## Deploy / Rollback

- **Deploy:** Use Harness pipeline `WDPR_AntMan_Schedules` (identifier: `dtourkronos`)
- **Rollback:** Redeploy previous stable version via same Harness pipeline
- **Verify:** Check health endpoint + Splunk error rate comparison pre/post deploy

---

## Scaling

- Scale up: Increase ECS desired count in target cluster via AWS Console or Harness
- Scale down: Only during confirmed low-activity periods

---

## S3 Buckets

| Environment | Bucket |
|-------------|--------|
| prod | d-tour-kronos-prod, d-scribe-content-live |
| prod-stage | d-scribe-content-stage, d-scribe-content-prod-load |
| prod-load | d-scribe-content-stage, d-scribe-content-prod-stage |
| prod-latest | d-scribe-content-stage, d-scribe-content-prod-latest |

---

## Monitoring

- **Splunk:** `index=wdpr_d-scribe source="*schedules-prod/*"`
- **Grafana:** [ddsycmiacwwe8d ](https://grafana.wdprapps.disney.com/d/ddsycmiacwwe8d/gcx-platform-status-dashboard?orgId=1&from=now-1h&to=now&timezone=browser&refresh=5m)(gcx-platform-status-dashboard)
- **CloudWatch Dashboard:** [sched-prod-live](https://us-west-2.console.aws.amazon.com/cloudwatch/home?region=us-west-2#dashboards/dashboard/PACE-DLR-d-scribe-prod-Ver5)
- **AppDynamics:** [Schedules(Kronos) AppD Prod](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=593)

---

## Contacts

| Role | Name | Contact |
|------|------|---------|
| On-Call | Rotation | +1 5707 347 639 Option 1 |
| Tech Lead | Rodrigo Duarte | Rodrigo.A.Duarte.-ND@disney.com |
| Manager | Frank Kenes | 708-712-8443 |
| Teams Channel | GCx Help Ant-Man Help | @gcx_antman |
