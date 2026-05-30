# Business Rules — WDPR Ant-Man Hydra Pipeline

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invocation success rate | > 99% | Grafana Lambda errors panel |
| Execution duration | < 30s | Grafana Lambda duration panel |
| Throttle rate | 0 | Grafana Lambda throttles panel |

## Peak Periods

- Content pipeline processing spikes
- Bulk content operations

## Business Logic

- Hydra Pipeline Lambda is triggered by Hydra API Gateway
- Part of the D-Scribe/ECM content pipeline
- One-time deployment — no CI/CD pipeline exists
- Reads/writes content to S3 buckets (d-scribe-content-*)

## Dependencies

- **Trigger:** Hydra API Gateway
- **Data stores:** S3 buckets (d-scribe-content-live, d-scribe-content-prod-*)
- **Infrastructure:** AWS Lambda (us-west-2), multiple accounts per environment

## Impact Classification

- **Full outage:** Hydra pipeline content processing unavailable
- **Degraded:** Processing delays; some content operations may fail
