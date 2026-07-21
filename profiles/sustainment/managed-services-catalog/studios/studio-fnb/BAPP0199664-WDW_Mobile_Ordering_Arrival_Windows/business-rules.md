# Business Rules — WDW Mobile Ordering Arrival Windows

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | AppDynamics / Grafana |
| Response time (p95) | < 1s | AppDynamics |
| Error rate | < 1% | Splunk alerts |

## Peak Periods

- Lunch (11am-2pm) and Dinner (5pm-8pm) at WDW
- Holidays (Thanksgiving, Christmas, Spring Break), special events

## Business Logic

- Calculates and manages available pickup time windows for WDW mobile ordering
- Uses attendance configuration and historical patterns to size windows
- Service, Batch, API, and Flutter UI components
- RDS MariaDB stores window configurations and reservations
- Cross-region replica in us-west-2 for DR

## Dependencies

- MOO (consumer of arrival window slots)
- RDS MariaDB (window state) with cross-region replica
- Attendance configuration data

## Impact Classification

- **Full outage:** Mobile ordering at WDW shows no available pickup times. Guests cannot complete orders.
- **Degraded:** Incorrect window sizes, overbooking, or stale availability data.
