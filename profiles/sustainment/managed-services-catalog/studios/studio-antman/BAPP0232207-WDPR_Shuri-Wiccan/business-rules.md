# Business Rules — WDPR Shuri-Wiccan

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly availability |
| Response time (p95) | < 2000ms | Splunk latency_spl |
| Error rate | < 1% | Errors / total requests |

## Peak Periods

- Content publishing campaigns (park events, seasonal updates)
- Bulk content operations
- Holiday and festival content pushes

## Business Logic

- Wiccan is a content processing service in the Shuri platform family
- Part of the D-Scribe/ECM content ecosystem
- Reads/writes content to S3 buckets (d-scribe-content-*)
- Uses shared ECS cluster (wdpr-content-S0001431-usw2-prd) with other Shuri services

## Dependencies

- **Upstream:** D-Scribe content pipeline
- **Downstream:** Content consumers
- **Data stores:** S3 buckets (d-scribe-content-live, d-scribe-content-prod-*)
- **Infrastructure:** AWS ECS Fargate (us-west-2)

## Impact Classification

- **Full outage:** Content processing unavailable; downstream consumers may receive stale content
- **Degraded:** Slow processing; content updates delayed
