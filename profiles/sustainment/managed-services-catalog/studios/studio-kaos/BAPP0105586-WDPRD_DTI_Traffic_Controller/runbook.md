# Runbook — WDPRD DTI Traffic Controller (DTC)

## Restart Procedures

1. TBD — no documentation found in Confluence
2. TBD — no documentation found in Confluence

**Validation:** Ticket Mods

---

## Scaling

### DLR DTC

- **AWS Account:** 876496569223 (wdpr-apps)
- **Cluster:** dlr-dtc-prod
- **Service:** dtc-prod-live
- **Launch type:** EC2
- **Current desired:** 2
- **Auto-scaling:** Min 2 / Max 2 (fixed — no auto-scaling)
- **Deployment:** Rolling (max 200%, min healthy 100%)

### WDW DTC

- **AWS Account:** 876496569223 (wdpr-apps)
- **Cluster:** wdpr-dtc-prod
- **Service:** dtc-prod-live
- **Launch type:** EC2
- **Current desired:** 2
- **Auto-scaling:** Min 2 / Max 2 (fixed — no auto-scaling)
- **Deployment:** Rolling (max 200%, min healthy 100%)

### Service Names per Environment (DLR)

| Environment | Cluster | Service |
|-------------|---------|---------|
| Production  | dlr-dtc-prod   | dtc-prod-live   |
| Stage       | dlr-dtc-stage  | dtc-stage-live  |
| Load        | dlr-dtc-load   | dtc-load-live   |
| Latest      | dlr-dtc-latest | dtc-latest-live |

**Scale manually (DLR):**

```bash
aws ecs update-service --cluster dlr-dtc-prod --service dtc-prod-live --desired-count <N> --region us-west-2
```

**Scale manually (WDW):**

```bash
aws ecs update-service --cluster wdpr-dtc-prod --service dtc-prod-live --desired-count <N> --region us-west-2
```

**Note:** DTC has fixed scaling (min=max=2). To enable auto-scaling, update the scalable target first.

## Failover

- TBD — no documentation found in Confluence

## Rollback

- TBD — no documentation found in Confluence

## Health Check

| Environment | URL |
|-------------|-----|
| Production  | `https://dti-controller.dlr.wdprapps.disney.com/dti-traffic-controller/api/health/shallow` |
| Stage       | `https://dti-controller.dlr.wdprapps.disney.com/dti-traffic-controller/api/health/shallow` |
| Load        | `https://dti-controller.dlr.wdprapps.disney.com/dti-traffic-controller/api/health/shallow` |
| Latest      | `https://dti-controller.dlr.wdprapps.disney.comm/dti-traffic-controller/api/health/shallow` |

**Path:** `/dti-traffic-controller/api/health/shallow`
**Expected:** HTTP 200

## Monitoring

### Splunk

- **Index:** wdpr-apps (also dlr_dtc, wdw_dtc)
- **Dashboard:** TBD — no documentation found in Confluence
- **Example query:** `index=wdpr-apps ecs_cluster=*dtc* ecs_task_definition=*dtc*`
- **Prod query:** `index=dlt_dtc`
- **ECS filter:** ecs_cluster=*dtc* ecs_task_definition=*dtc*

### AppDynamics

- **Load:** [AppDynamics Pre-Prod (App 1344)](https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=1344&component=7024&dashboardMode=force)
- **Production:** [AppDynamics Prod (App 299)](https://disney-prod.saas.appdynamics.com/controller/#/location=APP_DASHBOARD&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=299&dashboardMode=force)

## Deployment

- **Pipeline:** Harness
- **Pipeline URL:** https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/module/ci/orgs/Commerce/projects/WDPRD_DTI_Traffic_Controller/pipelines
- **Repository:** https://github.disney.com/wdpro-peplite/dti-traffic-controller
- **Brand:** WDW + DLR (same pipeline for both)
- **Region:** us-west-2

### Release Process

1. All tickets validated and signed off in Latest environment
2. Promote to Stage & Load (requires QA + Reporter approval)
3. GQE Certification (Mobile + Online/WEB)
4. PE Certification (via L2 team)
5. Create Release Request (Mandalorian team coordinates)
6. Config Manager changes (if applicable)
7. Production deployment

**Rule:** No Approval = No Stage. Changes stay in Latest until QA and Reporter approve.

## Configuration

- **Config Manager:** TBD — no documentation found in Confluence
- **Toggles:** TBD — no documentation found in Confluence

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| DTI | TBD | TBD |
