# Business Rules — WDPR Dinetime Reservation Sync

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Splunk / CloudWatch |
| Message processing lag | < 5 min | Splunk dashboard |

## Peak Periods

- When dining reservations are being made/modified (typically day-before and morning-of)
- Higher volume during reservation booking windows opening

## Business Logic

- Synchronizes dining reservations from DREAMS into DineTime vendor (QSR Automation)
- Consumes RabbitMQ messages from DINE.EVENTDINING.FNBSUB queue
- DLQ (Dead Letter Queue) captures failed messages for reprocessing
- Event-driven: processes reservation create/modify/cancel events

## Dependencies

- RabbitMQ (BAPP0246881) for message consumption
- DREAMS (upstream reservation source)
- DineTime/QSR Automation (downstream target)

## Impact Classification

- **Full outage:** Dining reservations not synced to DineTime. Restaurant hosts may not see updated reservation lists.
- **Degraded:** Sync lag — reservations arrive late to DineTime. Minor operational impact if within minutes.
