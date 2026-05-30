# Runbook — WDPR Ant-Man Services (Longshot)

## Service Details

| Field | Value |
|-------|-------|
| BAPP | BAPP0089428 |
| Runtime | Java 17.0.15, Spring Boot |
| Infra | ECS (AWS account 876496569223, wdpr-apps) |
| Harness | Pipeline: WDPR_Ant_Man_Services / Identifier: dscribelongshot |
| ECR | wdpr-ecm/d-scribe-services |
| Repo | https://github.disney.com/WDPR-ECM/EcmServices (path: d-scribe-longshot) |
| Rundeck | ab2d1a65-64c5-49be-8c8e-6ef4117383f1 |

---

## Health Check URLs

| Environment | URL |
|-------------|-----|
| prod | https://d-scribe-services.wdprapps.disney.com/information |
| prod-stage | https://prod-stage.d-scribe-services.wdprapps.disney.com/information |
| prod-load | https://prod-load.d-scribe-services.wdprapps.disney.com/information |
| prod-latest | https://prod-latest.d-scribe-services.wdprapps.disney.com/information |
| stage | https://stage.d-scribe-services.wdprapps.disney.com/information |
| latest | https://latest.d-scribe-services.wdprapps.disney.com/information |

---

## ECS Clusters

| Environment | Cluster |
|-------------|---------|
| prod | svc-d-scribe-prod-live |
| prod-stage | svc-d-scribe-prod-stage-live |
| prod-load | svc-d-scribe-prod-load-live |
| prod-latest | svc-d-scribe-prod-latest-live |
| stage | svc-d-scribe-stage-live |
| latest | svc-d-scribe-latest-live |

---

## Restart Procedures

1. Identify unhealthy ECS tasks in the target cluster
2. Stop the affected task(s) — ECS auto-replaces with new instances
3. Monitor new tasks reaching RUNNING state
4. Validate via health check URL returning 200

**Post-restart validation:**
```
index="wdpr_d-scribe" source="*services-prod/*" ERROR earliest=-15m | timechart count
```

---

## Deploy / Rollback

- **Deploy:** Use Harness pipeline `WDPR_Ant_Man_Services` (identifier: `dscribelongshot`)
- **Rollback:** Redeploy previous stable version via same Harness pipeline
- **Verify:** Check health endpoint + Splunk error rate comparison pre/post deploy

---

## Scaling

- Scale up: Increase ECS desired count in target cluster via AWS Console or Harness
- Scale down: Only during confirmed low-traffic periods

---

## S3 Buckets

| Environment | Bucket |
|-------------|--------|
| prod | d-scribe-content-live |
| prod-stage | d-scribe-content-prod-load |
| prod-load | d-scribe-content-prod-stage |
| prod-latest | d-scribe-content-prod-latest |

---

## Monitoring

- **Splunk:** `index="wdpr_d-scribe" source="*services-prod/*"`
- **Grafana:** ddsycmiacwwe8d (gcx-platform-status-dashboard)
- **CloudWatch Dashboard:** svc-prod-live
- **AppDynamics:** Longshot AppD Prod

---

## Contacts

| Role | Name | Contact |
|------|------|---------|
| On-Call | Rotation | +1 5707 347 639 Option 1 |
| Tech Lead | Rodrigo Duarte | Rodrigo.A.Duarte.-ND@disney.com |
| Manager | Frank Kenes | 708-712-8443 |
| Teams Channel | GCx Help Ant-Man Help | @gcx_antman |
