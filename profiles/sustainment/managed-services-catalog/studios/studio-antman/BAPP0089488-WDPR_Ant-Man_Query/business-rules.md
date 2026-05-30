# Business Rules — WDPR Ant-Man Query

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly availability |
| Error rate | < 0.5% | Errors / total requests |

## Peak Periods

- Content publishing campaigns (park events, seasonal updates)
- High-traffic periods on Disney mobile apps and web
- Bulk content queries during page rendering
- Holiday and festival content consumption spikes

## Business Logic

- Query is a read-optimized content service — serves D-Scribe content from D-scribe CMS (BrokerDB) to Assembler, Transformer, DDA(Disney Dreamer Academy)
- Supports content lookups by entity type, TCM ID, and content path
- High-throughput, low-latency design optimized
- Does not modify content — all writes go through Assembler/Transformer pipeline
- Part of the D-Scribe content pipeline: Assembler → Transformer → Query (read layer)

## Dependencies

- **Upstream:** Ant-Man Assembler (BAPP0089443), Transformer (BAPP0089458) — provide content to S3
- **Downstream:** Mobile apps, web consumers, Cast Portals
- **Data stores:** S3 buckets (d-scribe-content-live, d-scribe-content-prod-*)
- **Infrastructure:** AWS ECS EC2 (us-west-2), ALB

## Impact Classification

- **Full outage:** Content cannot be served; mobile apps and web show errors or stale content
- **Degraded:** Slow content lookups; apps usable but sluggish
