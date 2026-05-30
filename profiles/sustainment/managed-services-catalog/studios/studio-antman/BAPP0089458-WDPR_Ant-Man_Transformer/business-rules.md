# Business Rules — WDPR Ant-Man Transformer

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly availability |
| Transformation throughput | No backlog > 10min | Processing lag |
| Error rate | < 1% | Failed transformations / total |

## Peak Periods

- Content publishing campaigns (park events, seasonal updates)
- Bulk content migrations or republishes
- New park/resort launches requiring mass content transformation
- Holiday and festival content pushes

## Business Logic

- Transformer converts assembled D-Scribe content into consumable formats for downstream delivery
- Reads content from S3 buckets (d-scribe-content-*) and transforms into target schemas
- Part of the Ant-Man content pipeline: Assembler → Transformer → Watcher/Consumers
- Handles format conversion, field enrichment, and content normalization for mobile/web consumption

## Dependencies

- **Upstream:** Ant-Man Assembler (BAPP0089443) — provides assembled content
- **Downstream:** Ant-Man Watcher (BAPP0142680), mobile apps, web consumers
- **Data stores:** S3 buckets (d-scribe-content-live, d-scribe-content-prod-*)
- **Infrastructure:** AWS ECS Fargate (us-west-2)

## Impact Classification

- **Full outage:** Content cannot be transformed; downstream consumers receive stale/untransformed content
- **Degraded:** Slow transformations cause content freshness issues; existing transformed content remains accessible
