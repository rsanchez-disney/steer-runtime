# Business Rules — WDPR Ant-Man Ragnarok

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly availability |
| Response time (p95) | < 2000ms | Splunk latency_spl |
| Error rate | < 1% | Errors / total requests |

## Peak Periods

- Content publishing campaigns (park events, seasonal updates)
- .ini configuration changes and validations
- Bulk content operations

## Business Logic

- Ragnarok handles content processing and .ini configuration validation for the D-Scribe/ECM platform
- Part of the Ant-Man content ecosystem
- Reads/writes content to S3 buckets (d-scribe-content-*)
- Validates .ini configuration files for content pipeline

## Dependencies

- **Upstream:** D-Scribe content pipeline, configuration sources
- **Downstream:** Content consumers, other Ant-Man services
- **Data stores:** S3 buckets (d-scribe-content-live, d-scribe-content-prod-*)
- **Infrastructure:** AWS ECS Fargate (us-west-2)

## Impact Classification

- **Full outage:** Content processing and .ini validation unavailable; pipeline may stall
- **Degraded:** Slow processing; configuration validation delayed
