# Business Rules — DLR FnB Order Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | AppDynamics |
| Response time (p95) | < 1s | AppDynamics |
| Error rate | < 1% | Splunk |

## Peak Periods

- Meal times at DLR, weekends, holidays

## Business Logic

- Processes DLR food and beverage orders
- Publishes order events to Kinesis stream
- Stores placed orders in DynamoDB with Redis caching
- Same codebase as WDW, deployed to us-west-2

## Dependencies

- Kinesis (event streaming)
- DynamoDB (order storage)
- Redis/Elasticache (caching)
- MOO (upstream caller)

## Impact Classification

- **Full outage:** DLR FnB orders cannot be processed. Mobile ordering disrupted.
- **Degraded:** Slow order processing, event publishing delays.
