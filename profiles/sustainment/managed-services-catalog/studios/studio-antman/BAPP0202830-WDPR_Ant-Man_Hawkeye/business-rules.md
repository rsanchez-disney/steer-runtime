# Business Rules — WDPR Ant-Man Hawkeye

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly availability |
| Response time (p95) | < 2000ms | Splunk latency_spl |
| Error rate | < 1% | Errors / total requests |

## Peak Periods

- Content publishing campaigns (park events, seasonal updates)
- Experience content creation/updates
- Bulk content operations

## Business Logic

- Hawkeye is the Experience Builder (XBS) service for the D-Scribe/ECM platform
- Builds and manages experience content that is consumed by downstream services
- Part of the Ant-Man/Shuri platform family
- Reads/writes content to S3 buckets (d-scribe-content-*)

## Dependencies

- **Upstream:** D-Scribe content pipeline, CMS/Tridion
- **Downstream:** Content consumers, mobile apps, web
- **Data stores:** S3 buckets (d-scribe-content-live, d-scribe-content-prod-*)
- **Infrastructure:** AWS ECS Fargate (us-west-2)

## Impact Classification

- **Full outage:** Experience content cannot be built or managed; downstream consumers receive stale content
- **Degraded:** Slow experience building; content updates delayed
