# Business Rules — WDW Dine Self Check-In Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | CloudWatch / Grafana |
| Response time (p95) | < 2s | AppDynamics |
| Error rate | < 1% | Splunk DiSCO dashboards |

## Peak Periods

- Lunch (11am-2pm) and Dinner (5pm-9pm) are highest check-in volume
- Holidays: Thanksgiving, Christmas, Spring Break
- Special dining events increase walk-up list usage

## Business Logic

- Guests check-in to dining reservations via WDW MDX app
- Walk-up list allows guests without reservations to join a waitlist
- Wait times are calculated and displayed to guests
- Check-in notifications sent via Automic job (JOBS.WDPR_DINING.NOTIFY_WDW)
- DynamoDB stores reservation state; Redis for session caching
- Integrates with DREAMS reservation system for validation

## Dependencies

- DREAMS (dining reservation system)
- Automic (notification scheduler)
- AJO/Shuri (push notifications)
- DynamoDB, Redis (state management)
- VenueNext (kitchen display integration)

## Impact Classification

- **Full outage:** Guests cannot check-in to dining reservations via app. Cast members must handle check-ins manually at podium.
- **Degraded:** Slow check-in, inaccurate wait times, or delayed notifications. Guests may arrive without confirmed check-in status.
