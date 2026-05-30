# Business Rules — WDPR Ant-Man Watcher

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly availability |
| Content read latency | < 2000ms | Splunk latency_spl |
| Error rate | < 1% | Failed reads / total requests |

## Peak Periods

- Content publishing campaigns (park events, seasonal updates)
- High-traffic periods on Disney mobile apps and web
- Bulk content publishes triggering combine operations
- Holiday and festival content consumption spikes

## Business Logic

- Watcher monitors published D-Scribe content in S3 buckets and serves content reads
- Integrates with Goliath for combine data operations
- Uses gcx-tools-api for process combine operations
- Part of the D-Scribe content pipeline: Assembler → Transformer → Watcher (content serving)
- Handles combine data — when Goliath returns null, check for duplicates in S3 bucket

## Dependencies

- **Upstream:** Ant-Man Assembler (BAPP0089443), Transformer (BAPP0089458) — publish content to S3
- **Downstream:** Goliath (combine data consumer), mobile apps, web consumers
- **Data stores:** S3 buckets (d-scribe-content-live, d-scribe-content-prod-*)
- **Integration:** gcx-tools-api (process combine)
- **Infrastructure:** AWS ECS Fargate (us-west-2)

## Impact Classification

- **Full outage:** Content cannot be read from S3; mobile apps and web show errors
- **Degraded:** Slow content reads; combine data operations may return null temporarily
