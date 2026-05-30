# Business Rules — WDPR Shuri Lambda DLR Guest Entry

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invocation success rate | > 99% | Grafana Lambda errors panel |
| Execution duration | < 30s | Grafana Lambda duration panel |
| Throttle rate | 0 | Grafana Lambda throttles panel |

## Peak Periods

- DLR park opening hours (guest entry spikes)
- Holiday and event periods (high guest volume)
- Special events and seasonal peaks

## Business Logic

- DLR Guest Entry Lambda handles Disneyland Resort guest entry operations
- Triggered by API Gateway (ID: basyohxxv4)
- Reads/writes content from S3 buckets (d-scribe-content-*)
- Part of the Shuri/ECM platform

## Dependencies

- **Trigger:** API Gateway (basyohxxv4) — DLR Guest Entry API
- **Data stores:** S3 buckets (d-scribe-content-live, d-scribe-content-prod-*)
- **Infrastructure:** AWS Lambda (us-west-2), multiple accounts per environment

## Impact Classification

- **Full outage:** DLR guest entry operations unavailable via API
- **Degraded:** Slow responses; some requests may timeout
