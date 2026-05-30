# Business Rules — WDPR Shuri Lambda Quicksilver Aulani

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invocation success rate | > 99% | Grafana Lambda errors panel |
| Execution duration | < 30s | Grafana Lambda duration panel |
| Throttle rate | 0 | Grafana Lambda throttles panel |

## Business Logic

- Quicksilver Aulani Lambda is triggered by QuickSilver API Gateway
- Handles Aulani resort content operations
- Part of the Shuri/ECM platform

## Dependencies

- **Trigger:** QuickSilver API Gateway
- **Data stores:** S3 buckets (d-scribe-content-*)
- **Infrastructure:** AWS Lambda (us-west-2), multiple accounts

## Impact Classification

- **Full outage:** Aulani content operations unavailable via QuickSilver API
- **Degraded:** Slow responses; some requests may timeout
