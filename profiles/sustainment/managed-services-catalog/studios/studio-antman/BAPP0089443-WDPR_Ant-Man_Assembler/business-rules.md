# Business Rules — WDPR Ant-Man Assembler

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly availability |
| Content publish latency | < 5 min | Time from CMS publish to S3 availability |
| Error rate | < 1% | Failed assemblies / total attempts |

## Peak Periods

- Content publishing campaigns (park events, seasonal updates)
- Bulk content migrations or republishes
- New park/resort launches requiring mass content updates
- Holiday and festival content pushes

## Business Logic

- Assembler handles three core operations: **query**, **transform**, and **publish** for D-Scribe content
- Content originates from CMS (Tridion) via TCM IDs (e.g., tcm:753-992386-1024)
- Assembled content is published to S3 buckets and notified to downstream consumers (ARTU/Couchbase, Media Service)
- DAM assets are sourced from AEM (author-p28055-e88807.adobeaemcloud.com) and published via Vision DAM Lambda
- UrlFriendly IDs must be unique per page — shared IDs cause overwrite/delete conflicts
- When orphaned content is removed in production, Content Producers must immediately validate and republish to prevent page downtime

## API Patterns

- Query: `/assembler/query/{preview}/{contentType}/{tcmId}`
- Transform: `/assembler/transform/{preview}/{contentType}/{tcmId}`
- Publish: `/assembler/publish/{preview}/{contentType}/{tcmId}`

## Dependencies

- **Upstream:** CMS/Tridion (content source), AEM (DAM assets), D-Scribe Content Service
- **Downstream:** Transformer (BAPP0089458), Watcher (BAPP0142680), ARTU Realtime Publisher, Media Service (MediaServiceNotifier), Mobile Apps, Couchbase
- **Data stores:** S3 buckets (d-scribe-content-live), Couchbase
- **Infrastructure:** AWS ECS Fargate (us-west-2), DAM Lambda, S3

## Impact Classification

- **Full outage:** Content cannot be assembled or published; parks content becomes stale on mobile/web
- **Degraded:** Publish delays cause temporary content staleness; existing published content remains accessible
