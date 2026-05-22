# Cart Service — Runbook

Source: [Cart Service Runbook](https://confluence.disney.com/spaces/WDPROS/pages/681705297/Cart+Service+Runbook)

## Owner Team

- Studio Mars — web-global-salescart
- Slack: #dpeptd-studio-mars

## Important Note

**CART SERVICE has a 24-hour cache.** If it cannot reach package service for updates, it will continue to use cache for 24 hours. This can impact the application for certain changes like SiteShield.

## Code & Pipeline

- Repo: https://github.disney.com/wdprd-development/cart-service-java8
- Pipeline: https://ecommerce.cicd.wdprapps.disney.com/job/cart-service-java8/
- SonarQube: https://sonar.cicd.wdprapps.disney.com/dashboard?id=com.disney.wdpro.service%3Acart-service-java8
- Performance Scripts: https://github.disney.com/PE/PE_Scripts/tree/master/DevStudios/OnlineCartService

## Health Check Endpoints

| Env | URL |
|-----|-----|
| Latest | https://latest.cart-service.wdprapps.disney.com/cart-service/admin/health-report |
| Stage | https://stage.cart-service.wdprapps.disney.com/cart-service/admin/health-report |
| Load | https://load.cart-service.wdprapps.disney.com/cart-service/admin/health-report |
| Prod | https://cart-service.wdprapps.disney.com/cart-service/admin/health-report |

## Infrastructure (AWS wdpr-apps us-west-2)

### ECS Clusters

| Env | Cluster | Service |
|-----|---------|---------|
| Latest | cart-latest | cart-latest-live |
| Stage | cart-stage | cart-stage-live |
| Load | cart-load | cart-load-live |
| Prod | cart-prod | cart-prod-live |

### Databases (MariaDB)

| Env | Host |
|-----|------|
| Latest | cart-service-mariadb-latest.czadbdnytwxi.us-west-2.rds.amazonaws.com:4001 |
| Stage | cart-service-mariadb-stage.czadbdnytwxi.us-west-2.rds.amazonaws.com:4001 |
| Load | dlr-cart-service-load-master.wdatdbs.disney.com:4001 |
| Prod | dlr-cart-service-prod-master.wdatdbs.disney.com:4001 |

### RabbitMQ

| Env | URL |
|-----|-----|
| Latest | https://latest.cart-svc-rmq.wdprapps.disney.com/ |
| Stage | https://stage.cart-svc-rmq.wdprapps.disney.com/ |
| Load | https://load.cart-svc-rmq.wdprapps.disney.com/ |
| Prod | https://cart-svc-rmq.wdprapps.disney.com/ |

### AppDynamics

| Env | App ID | URL |
|-----|--------|-----|
| Latest | 1051 | https://disney-preprod.saas.appdynamics.com/controller/#/application=1051 |
| Stage | 1338 | https://disney-preprod.saas.appdynamics.com/controller/#/application=1338 |
| Load | 1371 | https://disney-preprod.saas.appdynamics.com/controller/#/application=1371 |
| Prod | 278 | https://disney-prod.saas.appdynamics.com/controller/#/application=278 |

## Monitoring

- Splunk index: wdpr_commerce_cart
- Splunk dashboards:
  - https://splunk.wdprapps.disney.com/en-US/app/launcher/cart_service_endpoints_usage
  - https://splunk.wdprapps.disney.com/en-US/app/launcher/cart__cart_service_dlr_reopening
  - https://splunk.wdprapps.disney.com/en-US/app/launcher/cart__omni_channel
- Keyblade: https://keyblade.wdpro.disney.com/keys/nap7/application/cart-service-java8/

## Purge Scripts (Batch)

- Execution Time: 1:30 AM PST (daily)
- Script: https://github.disney.com/wdprd-development/cart-service-java8/blob/de42f6167b4f56ad2a06105a056b061bc12c3520/sql/omnichannel/Pre-Steps_OminiChannel_CartDB/STEP-3_PRO-253420_pep_cart_mysql_cleanup.sql

### Purge Actions

- Deletes expired anonymous carts (older than 30 days)
- Deletes expired guest carts (older than 1 year)
- Deletes expired anonymous BOOKED/REJECTED carts and items (older than 30 days)
