# Runbook — WDPR Park Activity Calendar Service (PACS)

## Restart Procedures

1. scale down to 3 tasks
2. deploy in Rundeck (ADS)
3. scale up to 10 tasks

**Validation:** E2E - DLR Ticket Calendar and Reservations (CME consumes PACS, but data is cached)
Look in Splunk `index=wdpr-ecommerce ecs_cluster="dlr-commerce2-01323-*" ecs_task_definition="pacs-svc*"` for incoming calls, successful HTTP 200 codes, no exceptions.

**Reference:** https://confluence.disney.com/display/WDPROS/PACS+DLR+-+Runbook

---

## Scaling

- **AWS Account:** 876496569223 (wdpr-apps)
- **Cluster:** dlr-commerce2-01323-prod
- **Service:** pacs-svc-prod-live
- **Launch type:** EC2
- **Current desired:** 10
- **Auto-scaling:** Min 3 / Max 20
- **Policy:** Step scaling (ChangeInCapacity)
  - Scale up: +1 task (cooldown 60s)
  - Scale down: -1 task (cooldown 60s)
- **Deployment:** Rolling (max 200%, min healthy 100%)

### Service Names per Environment

| Environment | Cluster | Service |
|-------------|---------|---------|
| Production  | dlr-commerce2-01323-prod   | pacs-svc-prod-live   |
| Stage       | dlr-commerce2-01323-stage  | pacs-svc-stage-live  |
| Load        | dlr-commerce2-01323-load   | pacs-svc-load-live   |
| Latest      | dlr-commerce2-01323-latest | pacs-svc-latest-live |

**Scale up manually:**

```bash
aws ecs update-service --cluster dlr-commerce2-01323-prod --service pacs-svc-prod-live --desired-count <N> --region us-west-2
```

**Scale down manually:**

```bash
aws ecs update-service --cluster dlr-commerce2-01323-prod --service pacs-svc-prod-live --desired-count <N> --region us-west-2
```

**Note:** Min capacity is 3, max is 20. Do not set below 3 without updating the auto-scaling target.

## Failover

- N/A —There isn't any redundant service

## Rollback

- Revert configurations and changes that were promoted previously
- Scale down to 3 tasks
- Deploy previous artifact version
- Scale up to 10 tasks
- Validate

## Health Check

| Environment | URL |
|-------------|-----|
| Production  | `https://pacs.wdprapps.disney.com/park-activity-calendar-service/application/health` |
| Stage       | `https://stage.pacs.wdprapps.disney.com/park-activity-calendar-service/application/health` |
| Load        | `https://load.pacs.wdprapps.disney.com/park-activity-calendar-service/application/health` |
| Latest      | `https://latest.pacs.wdprapps.disney.com/park-activity-calendar-service/application/health` |

**Path:** `/park-activity-calendar-service/application/health`
**Expected:** HTTP 200

## Monitoring

### Splunk

- **Index:** wdpr-ecommerce
- **Dashboard:** TBD — no documentation found in Confluence
- **Example query:** `index=wdpr-ecommerce ecs_cluster="dlr-commerce2-01323-*" ecs_task_definition="pacs-svc*"`
- **Legacy index:** wdpr_tixsale_dlr source=pacs

### AppDynamics

- **prod**: https://disney-prod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=447&component=3176&dashboardMode=force"
- **load**: https://disney-preprod.saas.appdynamics.com/controller/#/location=APP_COMPONENT_MANAGER&timeRange=last_1_hour.BEFORE_NOW.-1.-1.60&application=2340&component=3481083&dashboardMode=force

## Deployment

- **Pipeline:** Harness
- **Pipeline URL:** https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/module/ci/orgs/Commerce/projects/WDPR_Park_Activity_Calendar_Service/pipelines
- **Repository:** https://github.disney.com/wdpro-peplite/dlr-commerce2-01323-pacs-svc
- **Brand:** WDW (also DLR variant via TTC LexVAS pipeline)
- **Region:** us-west-2
- **ECS Cluster:** dlr-commerce2-01323-*
- **Task Definition:** pacs-svc*

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
| Lexicon Service | Studio Kaos | TBD |
