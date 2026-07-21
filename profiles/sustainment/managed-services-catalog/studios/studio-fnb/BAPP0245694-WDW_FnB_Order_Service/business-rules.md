# Business Rules — WDW FnB Order Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | AppDynamics |
| Response time (p95) | < 1s | AppDynamics |
| Error rate | < 1% | Splunk |

## Peak Periods

- Meal times at WDW, holidays, special events

## Business Logic

- Processes WDW food and beverage orders
- Publishes order events to Kinesis stream for downstream consumers
- Stores placed orders in DynamoDB with Redis caching
- Cross-region DynamoDB replica for DR

## Dependencies

- Kinesis (event streaming)
- DynamoDB (order storage)
- Redis/Elasticache (caching)
- MOO (upstream caller)

## Impact Classification

- **Full outage:** WDW FnB orders cannot be processed/stored. Mobile ordering disrupted.
- **Degraded:** Slow order processing, event publishing delays.
