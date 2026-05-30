# Runbook — List Service

## Service Details

| Field | Value |
|-------|-------|
| BAPP | BAPP0012686 |
| Runtime | Java WAR (lists-service.war) on Apache Tomcat |
| Infra | ECS Fargate (cluster: wdpr-content-prod, us-west-2) |
| ECS Service | wdpr-content-B0012686-usw2-prod-list-service |
| CI/CD | harness: https://gam.cicd.wdprapps.disney.com/job/list-service/view/Deploy](https://disney.harness.io/ng/account/1-wFe3qRQv2mUh1s9244Eg/all/orgs/Content_Management_System/projects/List_Service/pipelines)
| Rundeck | https://rundeck.wdprapps.disney.com/project/list-service_aws/jobs |
| Repo | https://github.disney.com/wdprd-development/list-service |

---

## Health Check URLs

| Environment | Status (204) | Health Report |
|-------------|-------------|---------------|
| prod | http://listservice.wdprapps.disney.com/lists-service/admin/status | https://listservice.wdprapps.disney.com/lists-service/admin/health-report |
| stage | http://stage.listservice.wdprapps.disney.com/lists-service/admin/status | http://stage.listservice.wdprapps.disney.com/lists-service/admin/health-report |
| load | http://load.listservice.wdprapps.disney.com/lists-service/admin/status | http://load.listservice.wdprapps.disney.com/lists-service/admin/health-report |
| latest | http://latest.listservice.wdprapps.disney.com/lists-service/admin/status | http://latest.listservice.wdprapps.disney.com/lists-service/admin/health-report |

---

## Sample Validation Endpoints (prod)

```
https://listservice.wdprapps.disney.com/lists-service/configurations/MODEL_DCL_VPP_SELECTION_STRINGS
https://listservice.wdprapps.disney.com/lists-service/configurations/MODEL_DCL_SAILING_CONFIGURATION
https://listservice.wdprapps.disney.com/lists-service/configurations/MODEL_PAAP_PRT_CACHE_CONFIGURATION/RESORT_CACHE?java=true
https://listservice.wdprapps.disney.com/lists-service/configurations/EEC_CONFIG/DLR
https://listservice.wdprapps.disney.com/lists-service/name-parts
https://listservice.wdprapps.disney.com/lists-service/configurations/MODEL_INTEGRATOR_MASTER_CONFIG2
https://listservice.wdprapps.disney.com/lists-service/configurations/storeInstance/wdw_mobile
```

---

## Infrastructure

| Component | Endpoint/Details |
|-----------|-----------------|
| Redis | prod.lists-svc-redis.wdprapps.disney.com (ElastiCache: listservice-prod) |
| MariaDB | prod.vendomatic-mariadb.wdprapps.disney.com |
| Couchbase | Content data storage |
| RabbitMQ | https://mdx-svc-rmq-rh9.wdprapps.disney.com/#/ |
| Internal DNS | listservice.wdprapps.disney.com |
| External DNS | api.wdprapps.disney.com/list-service |
| CDN | Akamai (external traffic) |

---
## Bearer Token Endpoints

| Environment | URL |
|-------------|-----|
| Prod | https://disneyworld.disney.go.com/authentication/get-client-token/ |
| Stage | https://stage.disneyworld.disney.go.com/authentication/get-client-token/ |
| Load | https://lt01.disneyworld.disney.go.com/authentication/get-client-token/ |
| Latest | https://latest.disneyworld.disney.go.com/authentication/get-client-token/ |
---

## Networking

| Component | Value |
|-----------|-------|
| Internal ALB | internal-B20250801034605923100000001-1256715936.us-west-2.elb.amazonaws.com |
| External ALB | B20250808034359526900000001-510164173.us-west-2.elb.amazonaws.com |
| ⚠️ WARNING | Do NOT run Terraform on internal ALB (manual HTTP listener bandaid) |

---

## Restart Procedures

1. Identify unhealthy ECS tasks in cluster `wdpr-content-prod`
2. Stop affected task(s) — Fargate auto-replaces
3. **CRITICAL:** Verify RabbitMQ is available BEFORE expecting tasks to start
4. Validate: status endpoint returns 204, health-report shows all green

---

## Deploy / Rollback

- **Deploy:** Jenkins pipeline at list-service/view/Deploy/
- **Rollback:** Redeploy previous version via Jenkins
- **Verify:** Check status endpoint + Splunk error rate

---

## Terraform Configs

| Resource | Workspace |
|----------|-----------|
| Fargate | wdpr-content-B0012686-usw2-prd-list-service.tfvars |
| RabbitMQ | wdpr-content-B0012686-usw2-prd-listsvc.tfvars |
| Redis | wdpr-content-B0012686-usw2-prd-list-service.tfvars |
| ALB Internal | wdpr-content-B0012686-usw2-prd-list-service.tfvars |
| ALB External | wdpr-content-B0012686-usw2-prd-list-service-ext.tfvars |

---

## Contacts

| Role | Name | Contact |
|------|------|---------|
| On-Call | Rotation | +1 5707 347 639 Option 1 |
| Tech Lead | Rodrigo Duarte | Rodrigo.A.Duarte.-ND@disney.com |
| Manager | Frank Kenes | 708-712-8443 |
| Teams Channel | GCx Help Ant-Man Help | @gcx_antman |
