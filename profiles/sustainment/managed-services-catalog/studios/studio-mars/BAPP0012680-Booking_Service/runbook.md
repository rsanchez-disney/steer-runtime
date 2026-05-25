# Booking Service — Runbook

Source: [Operational Readiness Review - Booking ECS](https://confluence.disney.com/spaces/WDPROS/pages/633354892/Operational+Readiness+Review+-+Booking+ECS)

## Owner Team

- Studio Mars — web-global-salescart
- Slack: #dpeptd-studio-mars
- DL: WDAT.DL-sustainmentstudios@disney.com

## Code & Pipeline

- Repo: https://github.disney.com/commerce/wdpr-ecommerce-booking-svc
- Pipeline: https://ecommerce.cicd.wdprapps.disney.com/job/wdpr-ecommerce-booking-svc

## Health Check Endpoints

- https://bookingsvc-nap7.wdpro.starwave.com/booking-service/admin/health-report
- https://booking-service.wdprapps.disney.com/booking-service/admin/health-report
- https://booking-svc-int.wdprapps.disney.com/booking-service/healthcheck

## Infrastructure (AWS pci-apps-prod 517471039377 us-west-2)

| Resource | Details |
|----------|---------|
| ECS Cluster | wdpr-pci-S0001663-usw2-prd / booking-svc-prod-live |
| CloudWatch Log Group | wdpr-pci-S0001663-usw2-booking-svc-prd |
| Kinesis Stream | wdpr-pci-S0001663-usw2-booking-prd |
| RDS Master | bookingservice-mariadb-prod-u |
| RDS Replica | bookingservice-mariadb-prod-u-replica-1 |
| Redis | bookingsvc-prod |
| RabbitMQ | bookingsvc.wdprapps.disney.com |

## Environment URLs

### Health Checks (Internal ALB)

| Env | URL |
|-----|-----|
| Latest | https://latest.booking-svc-int.wdprapps.disney.com/booking-service/healthcheck |
| Stage | https://stage.booking-svc-int.wdprapps.disney.com/booking-service/healthcheck |
| Load | https://load.booking-svc-int.wdprapps.disney.com/booking-service/healthcheck |
| Prod | https://booking-svc-int.wdprapps.disney.com/booking-service/healthcheck |

### Health Checks (External ALB)

| Env | URL |
|-----|-----|
| Latest | https://latest.booking-service.wdprapps.disney.com/booking-service/healthcheck |
| Stage | https://stage.booking-service.wdprapps.disney.com/booking-service/healthcheck |
| Load | https://load.booking-service.wdprapps.disney.com/booking-service/healthcheck |
| Prod | https://booking-service.wdprapps.disney.com/booking-service/healthcheck |

### F5 Legacy

| Env | URL |
|-----|-----|
| Latest | https://bookingsvc-latest.wdpro.starwave.com/booking-service/admin/health-report |
| Stage | https://bookingsvc-stage.wdpro.starwave.com/booking-service/admin/health-report |
| Load | https://bookingsvc-lt1.wdpro.starwave.com/booking-service/admin/health-report |
| Prod | https://bookingsvc-nap7.wdpro.starwave.com/booking-service/admin/health-report |

### Akamai (Internet-Facing)

| Env | URL |
|-----|-----|
| Latest | https://latest.api.wdprapps.disney.com |
| Stage | https://stage.api.wdprapps.disney.com |
| Load | https://load.api.wdprapps.disney.com |
| Prod | https://api.wdprapps.disney.com / https://api.wdpro.disney.go.com |

### ECS Clusters

| Env | Cluster | Service |
|-----|---------|---------|
| Latest | wdpr-pci-S0001663-usw2-lst | booking-svc-latest-live |
| Stage | wdpr-pci-S0001663-usw2-stg | booking-svc-stage-live |
| Load | wdpr-pci-S0001663-usw2-lod | booking-svc-load-live |
| Prod | wdpr-pci-S0001663-usw2-prd | booking-svc-prod-live |

### Databases (MariaDB)

| Env | Host |
|-----|------|
| Latest | booking-svc-mariadb-latest.wdprapps.disney.com:4001/pepcom_booking_latest |
| Stage | booking-svc-mariadb-stage.wdprapps.disney.com:4001/pepcom_booking_stage |
| Load | dlr-bookingservice-load-master.wdatdbs.disney.com:4001/pepcom_booking_load1 |
| Prod | booking-svc-mariadb-prod.wdprapps.disney.com:4001/pepcom_booking |

### Redis (ElastiCache)

| Env | Endpoint |
|-----|----------|
| Latest | master.bookingsvc-latest.i8pkwr.usw2.cache.amazonaws.com |
| Stage | master.bookingsvc-stage.i8pkwr.usw2.cache.amazonaws.com |
| Load | master.bookingsvc-load.i8pkwr.usw2.cache.amazonaws.com |
| Prod | master.bookingsvc-prod.rspxz4.usw2.cache.amazonaws.com |

### RabbitMQ

| Env | Host |
|-----|------|
| Latest | latest.booking-svc.wdprapps.disney.com |
| Stage | stage.booking-svc.wdprapps.disney.com |
| Load | load.booking-svc.wdprapps.disney.com |
| Prod | bookingsvc.wdprapps.disney.com |

### AppDynamics

| Env | App ID | URL |
|-----|--------|-----|
| Latest | 4663 | https://disney-preprod.saas.appdynamics.com/controller/#/application=4663 |
| Stage | 4712 | https://disney-preprod.saas.appdynamics.com/controller/#/application=4712 |
| Load | 4695 | https://disney-preprod.saas.appdynamics.com/controller/#/application=4695 |
| Prod | 945 | https://disney-prod.saas.appdynamics.com/controller/#/application=945 |

## Monitoring

- AppD: wdpr_bap0012680_booking-service (app_id=945)
- Splunk index: wdpr_booking_service
- Splunk dashboard: cart_booking_service_aws_docker
- CloudWatch Dashboard: PACE-DLR-wdpr-pci-S0001663-usw2-prd-Ver5

## Batch Processes

- DB Purge Job: runs daily at 1:00 AM PST

## Application Validation

1. Validate health check endpoints respond
2. Validate traffic reaching through AppD
3. Test a Dine or Package purchase on disneyland.disney.go.com or disneyworld.disney.go.com — getting to express checkout page confirms service is working

## Rolling Restarts

ECS-based: kill a couple of tasks at a time, let AWS spin up new ones, repeat until all old tasks are replaced.

## Known Errors

- CC Declined / Payment not approved — expected behavior, not a service issue
- Package Order Service errors — contact Core-Api teams (Studio Defenders/Eternals)

## Flows Using This Service

- Mobile: Memory Maker, PhotoPass, Dine
- Desktop: LACD, Dine, PhotoPass, Trade Ticket/RO/Package, BOLT, Consumer RO/Package
