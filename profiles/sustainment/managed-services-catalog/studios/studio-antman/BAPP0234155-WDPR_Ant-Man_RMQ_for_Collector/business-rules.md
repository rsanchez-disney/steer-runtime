# Business Rules — WDPR Ant-Man RMQ for Collector

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly availability |
| Message delivery | < 5 min | Time from publish to consumer delivery |
| Queue depth | No sustained growth | Messages consumed at rate >= production rate |

## Peak Periods

- Bulk content publishes from D-Scribe
- Schedule update campaigns
- Seasonal content changes
- Mass republish operations

## Business Logic

- RabbitMQ broker routes messages from SDM Courier to the D-Scribe Collector (BAPP0159223)
- Messages contain content XML that Collector enriches with schedule data and persists to S3
- Routing diagram: https://confluence.disney.com/spaces/ECM/pages/845852050/Diagram+Collector+RMQ+Routing+to+Downstream
- Messages persist in queue until consumed — no data loss on Collector restart
- TLS certificates must be monitored for expiry (Grafana dashboard available)

## Dependencies

- **Upstream:** SDM Courier (publishes messages to RMQ)
- **Downstream:** D-Scribe Collector (BAPP0159223) — consumes messages from RMQ
- **Infrastructure:** AWS Amazon MQ (RabbitMQ), us-west-2

## Impact Classification

- **Full outage:** Messages cannot be routed; Collector stops receiving content; pipeline stalls
- **Degraded:** Message delivery delays; queue depth grows; content updates delayed
