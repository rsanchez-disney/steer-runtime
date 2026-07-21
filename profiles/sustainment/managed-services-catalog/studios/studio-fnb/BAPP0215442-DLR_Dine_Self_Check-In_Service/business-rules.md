# Business Rules — DLR Dine Self Check-In Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | CloudWatch / Grafana |
| Response time (p95) | < 2s | AppDynamics |
| Error rate | < 1% | Splunk DiSCO dashboards |

## Peak Periods

- Lunch (11am-2pm) and Dinner (5pm-9pm) are highest check-in volume
- Weekends, Oogie Boogie Bash, holidays, Grad Nite
- DLR has smaller dining capacity than WDW — walk-up lists fill quickly

## Business Logic

- Same service as WDW DiSCO deployed to DLR region (us-west-2)
- Guests check-in to dining reservations via Disneyland app
- Walk-up list allows guests without reservations to join a waitlist
- Check-in notifications sent via Automic job (JOBS.WDPR_DINING.NOTIFY_DLR)
- DynamoDB stores reservation state; Redis for session caching

## Dependencies

- DREAMS (dining reservation system)
- Automic (notification scheduler)
- AJO/Shuri (push notifications)
- DynamoDB, Redis (state management)
- VenueNext (kitchen display integration)

## Impact Classification

- **Full outage:** Guests cannot check-in to dining reservations via app at DLR. Cast members must handle check-ins manually.
- **Degraded:** Slow check-in, inaccurate wait times, or delayed notifications.
