# WDPR Notification Service — Runbook

Sources:
- [DLR Notification Service Runbook](https://confluence.disney.com/spaces/WDPROS/pages/555646814/DLR+Notification+Service+Runbook)
- [WDW Notification Service Runbook](https://confluence.disney.com/spaces/WDPROS/pages/691602917/WDW+Notification+Service+Runbook)

## Owner Team

- Studio Mars — web-global-salescart
- Slack: #dpeptd-studio-mars
- Repo: https://github.disney.com/wdpro-peplite/sales2-01323-notifysvc
- Pipeline: https://ecommerce.cicd.wdprapps.disney.com/job/sales2-01323-notifysvc/
- SonarQube: https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpr.service%3Awdpr-notification-service
- Splunk Dashboard: https://wdpr-splunk-prod.wdprapps.disney.com/en-US/app/launcher/notification_service

## API Documentation (Swagger)

- DLR: https://dlrns.wdprapps.disney.com/api/api-docs/?url=/api/openapi.yaml
- WDW: https://wdwns.wdprapps.disney.com/api/api-docs/?url=/api/openapi.yaml

## Campaign Management

- DLR: https://dlrns.wdprapps.disney.com/management/campaigns
- WDW: https://wdwns.wdprapps.disney.com/management/campaigns

---

## DLR Component (us-west-2)

### Health Checks

| Env | Info | HealthCheck |
|-----|------|-------------|
| Latest | https://latest.dlrns.wdprapps.disney.com/notifysvc/info | https://latest.dlrns.wdprapps.disney.com/notifysvc/rides/v1/healthcheck |
| Stage | https://stage.dlrns.wdprapps.disney.com/notifysvc/info | https://stage.dlrns.wdprapps.disney.com/notifysvc/rides/v1/healthcheck |
| Load | https://load.dlrns.wdprapps.disney.com/notifysvc/info | https://load.dlrns.wdprapps.disney.com/notifysvc/rides/v1/healthcheck |
| Prod | https://dlrns.wdprapps.disney.com/notifysvc/info | https://dlrns.wdprapps.disney.com/notifysvc/rides/v1/healthcheck |

### ECS Clusters

| Env | Cluster |
|-----|---------|
| Latest | dlr-commerce2-01323-latest |
| Stage | dlr-commerce2-01323-stage |
| Load | dlr-commerce2-01323-load |
| Prod | dlr-commerce2-01323-prod |

### Databases (MariaDB)

| Env | Host |
|-----|------|
| Latest | dlrns-mariadb-latest.czadbdnytwxi.us-west-2.rds.amazonaws.com:4001/dlrns |
| Stage | dlrns-mariadb-stage.czadbdnytwxi.us-west-2.rds.amazonaws.com:4001/dlrns |
| Load | dlr-ns-load-master.wdatdbs.disney.com:4001/dlrns |
| Prod | dlr-ns-prod-master.wdatdbs.disney.com:4001/dlrns |

### RabbitMQ

| Env | Host |
|-----|------|
| Latest | latest.dlrns-rmq.wdprapps.disney.com:5672 |
| Stage | stage.dlrns-rmq.wdprapps.disney.com:5672 |
| Load | load.dlrns-rmq.wdprapps.disney.com:5672 |
| Prod | dlrns-rmq.wdprapps.disney.com:5672 |

### Redis (ElastiCache)

| Env | Endpoint |
|-----|----------|
| Latest | clustercfg.commerce-cfg-mgr-latest.7ozysg.usw2.cache.amazonaws.com |
| Stage | clustercfg.commerce-cfg-mgr-stage.b5f2xn.usw2.cache.amazonaws.com |
| Load | clustercfg.commerce-cfg-mgr-load.b5f2xn.usw2.cache.amazonaws.com |
| Prod | clustercfg.commerce-cfg-mgr-prod.cvhlhl.usw2.cache.amazonaws.com |

### AppDynamics (DLR)

| Env | App ID | Tier Component |
|-----|--------|----------------|
| Latest | 2190 | 1282920 |
| Stage | 2515 | — |
| Load | 2340 | 4864933 |
| Prod | 447 | 3194 |

---

## WDW Component (us-east-1)

### Health Checks

| Env | Info | HealthCheck |
|-----|------|-------------|
| Latest | https://latest.wdwns.wdprapps.disney.com/notifysvc/info | https://latest.wdwns.wdprapps.disney.com/notifysvc/rides/v1/healthcheck |
| Stage | https://stage.wdwns.wdprapps.disney.com/notifysvc/info | https://stage.wdwns.wdprapps.disney.com/notifysvc/rides/v1/healthcheck |
| Load | https://load.wdwns.wdprapps.disney.com/notifysvc/info | https://load.wdwns.wdprapps.disney.com/notifysvc/rides/v1/healthcheck |
| Prod | https://wdwns.wdprapps.disney.com/notifysvc/info | https://wdwns.wdprapps.disney.com/notifysvc/rides/v1/healthcheck |

### ECS Clusters

| Env | Cluster |
|-----|---------|
| Latest | wdw-sales2-01323-latest |
| Stage | wdw-sales2-01323-stage |
| Load | wdw-sales2-01323-load |
| Prod | wdw-sales2-01323-prod |

### Databases (MariaDB)

| Env | Host |
|-----|------|
| Latest | wdwns-mariadb-latest.cch2jmarqtv7.us-east-1.rds.amazonaws.com:4001/wdwns |
| Stage | wdwns-mariadb-stage.cch2jmarqtv7.us-east-1.rds.amazonaws.com:4001/wdwns |
| Load | wdw-ns-load-master.wdatdbs.disney.com:4001/wdwns |
| Prod | wdw-ns-prod-master.wdatdbs.disney.com:4001/wdwns |

### RabbitMQ

| Env | Host |
|-----|------|
| Latest | latest.wdwns-rmq.wdprapps.disney.com:5672 |
| Stage | stage.wdwns-rmq.wdprapps.disney.com:5672 |
| Load | load.wdwns-rmq.wdprapps.disney.com:5672 |
| Prod | wdwns-rmq.wdprapps.disney.com:5672 |

### Redis (ElastiCache)

| Env | Endpoint |
|-----|----------|
| Latest | clustercfg.commerce-cfg-mgr-latest.rvhfcl.use1.cache.amazonaws.com |
| Stage | clustercfg.commerce-cfg-mgr-stage.fwkg1l.use1.cache.amazonaws.com |
| Load | clustercfg.commerce-cfg-mgr-load.fwkg1l.use1.cache.amazonaws.com |
| Prod | clustercfg.commerce-cfg-mgr-prod.xuqkma.use1.cache.amazonaws.com |

### AppDynamics (WDW)

| Env | App ID | Tier Component |
|-----|--------|----------------|
| Latest | 2190 | 1287035 |
| Stage | 2515 | 2693383 |
| Load | 2340 | 4864995 |
| Prod | 447 | 307070 |
