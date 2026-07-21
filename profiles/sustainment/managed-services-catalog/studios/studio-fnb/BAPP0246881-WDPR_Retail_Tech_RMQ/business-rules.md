# Business Rules — WDPR Retail Tech RMQ

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | RabbitMQ management UI |
| Message delivery | No message loss | DLQ monitoring |

## Peak Periods

- During dining reservation activity (morning booking windows, day-before)

## Business Logic

- RabbitMQ message broker infrastructure for FNB event-driven services
- Primary consumer: Dinetime Reservation Sync (BAPP0244886)
- Queues: DINE.EVENTDINING.FNBSUB with DLQ for failed messages
- Prod/Stage/Load environments available

## Dependencies

- EC2 infrastructure hosting RabbitMQ
- Network connectivity between producers and consumers

## Impact Classification

- **Full outage:** Event-driven services (Dinetime Sync) cannot receive messages. Reservation sync stops.
- **Degraded:** Message delays, queue buildup. Processing lag but eventual consistency.
