# Business Rules — WDPR Ant-Man Lambda Bundle

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invocation success rate | > 99% | Grafana Lambda errors panel |
| Execution duration | < 60s | Grafana Lambda duration panel |
| Throttle rate | 0 | Grafana Lambda throttles panel |

## Peak Periods

- Bulk content publishes triggering bundle operations
- Seasonal content changes
- Mass republish operations via GCx Tools API

## Business Logic

- Bundle Lambda creates content bundles from individual content items in S3
- Part of the Filter Lambda architecture (alongside Combine Lambda)
- Can be manually triggered via GCx Tools API Gateway
- Reads/writes content to S3 buckets (d-scribe-content-*)

## Dependencies

- **Trigger:** S3 events / Filter Lambda architecture
- **Manual trigger:** GCx Tools API Gateway (bundle endpoint)
- **Related:** Combine Lambda (BAPP0249949) — architecturally related
- **Data stores:** S3 buckets (d-scribe-content-live, d-scribe-content-prod-*)
- **Infrastructure:** AWS Lambda (us-west-2), multiple accounts per environment

## Impact Classification

- **Full outage:** Content bundles not created; downstream consumers receive unbundled/stale content
- **Degraded:** Bundle creation delays; some content types may fail
