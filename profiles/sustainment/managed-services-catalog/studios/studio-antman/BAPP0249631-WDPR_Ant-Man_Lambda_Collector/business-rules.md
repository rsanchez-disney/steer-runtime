# Business Rules — WDPR Ant-Man Lambda Collector

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invocation success rate | > 99% | Grafana Lambda errors panel |
| Execution duration | < 60s | Grafana Lambda duration panel |
| Throttle rate | 0 | Grafana Lambda throttles panel |

## Peak Periods

- Bulk content publishes triggering Filter Lambda
- Seasonal content changes

## Business Logic

- Collector Lambda is triggered by the Filter Lambda (not directly by events)
- Processes collector operations — writes content to S3 buckets
- Can be manually triggered via GCx Tools API Gateway POST to `/process/collector`
- Writes combine/preview content to S3 (e.g., `combine/preview2/en-US/legacy/FoodBeverageFacility/{id}.json`)

## Manual Trigger (GCx Tools API Gateway)

| Environment | Endpoint |
|-------------|----------|
| Prod | POST https://gcx-tools-api.wdprapps.disney.com/process/collector |
| Stage | POST https://prod-stage.gcx-tools-api.wdprapps.disney.com/process/collector |
| Latest | POST https://prod-latest.gcx-tools-api.wdprapps.disney.com/process/collector |

## Dependencies

- **Trigger:** Filter Lambda (upstream — invokes this Lambda)
- **Downstream:** S3 buckets (d-scribe-content-live, d-scribe-content-prod-*)
- **Manual trigger:** GCx Tools API Gateway
- **Infrastructure:** AWS Lambda (us-west-2), multiple accounts per environment

## Impact Classification

- **Full outage:** Collector content not processed; S3 content becomes stale
- **Degraded:** Processing delays; some content types may fail
