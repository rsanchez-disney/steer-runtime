# Business Rules — WDPR Ant-Man Lambda Combine

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invocation success rate | > 99% | Grafana Lambda errors panel |
| Execution duration | < 60s | Grafana Lambda duration panel |
| Throttle rate | 0 | Grafana Lambda throttles panel |

## Peak Periods

- Bulk content publishes triggering combine operations
- Seasonal content changes

## Business Logic

- Combine Lambda merges content fragments into combined JSON files in S3
- Triggered by S3 events (content changes) or manually via GCx Tools API Gateway
- Part of the Filter Lambda architecture in the D-Scribe/ECM pipeline
- Writes combined content to S3 paths like `legacy/preview/en-US/legacy/LgcyServices/{id}.json`

## Manual Trigger (GCx Tools API Gateway)

| Environment | Endpoint |
|-------------|----------|
| Prod | POST https://gcx-tools-api.wdprapps.disney.com/process/combine |
| Stage | POST https://prod-stage.gcx-tools-api.wdprapps.disney.com/process/combine |
| Latest | POST https://prod-latest.gcx-tools-api.wdprapps.disney.com/process/combine |

## Dependencies

- **Trigger:** S3 events (content changes), GCx Tools API Gateway (manual)
- **Data stores:** S3 buckets (d-scribe-content-live, d-scribe-content-prod-*)
- **Related:** Filter Lambda architecture
- **Infrastructure:** AWS Lambda (us-west-2), multiple accounts per environment

## Impact Classification

- **Full outage:** Content not being combined; downstream consumers receive fragmented/stale content
- **Degraded:** Combine delays; some content types may fail
