# Business Rules — WDPR Shuri Incognito SNS Messenger

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invocation success rate | > 99% | Grafana Lambda errors panel |
| Execution duration | < 30s | Grafana Lambda duration panel |
| Throttle rate | 0 | Grafana Lambda throttles panel |

## Peak Periods

- Incognito integration activity spikes
- Content notification campaigns

## Business Logic

- Shuri Incognito SNS Messenger is triggered by API Gateway (Incognito integration)
- Publishes messages to AWS SNS topics for downstream consumption
- Downstream subscribers (SQS/Lambda) process the SNS messages
- Part of the Shuri/ECM platform for Incognito content integration

## Dependencies

- **Trigger:** API Gateway (ID: jbrwuadrpj) — Incognito integration
- **Downstream:** AWS SNS topics, SQS/Lambda subscriptions
- **Data stores:** S3 buckets (d-scribe-content-*)
- **Infrastructure:** AWS Lambda (us-west-2), multiple accounts per environment

## Impact Classification

- **Full outage:** Incognito SNS messages not published; downstream subscribers receive no notifications
- **Degraded:** Message delivery delays; some messages may fail
