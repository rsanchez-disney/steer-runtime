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
