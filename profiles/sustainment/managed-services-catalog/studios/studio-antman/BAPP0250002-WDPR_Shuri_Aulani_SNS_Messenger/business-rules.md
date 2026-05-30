# Business Rules — WDPR Shuri Aulani SNS Messenger

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invocation success rate | > 99% | Grafana Lambda errors panel |
| Execution duration | < 30s | Grafana Lambda duration panel |
| Throttle rate | 0 | Grafana Lambda throttles panel |

## Peak Periods

- Aulani resort content update campaigns
- Seasonal content changes for Aulani

## Business Logic

- Shuri Aulani SNS Messenger is triggered by Hulkling API Gateway
- Publishes messages to AWS SNS topics for Aulani resort content
- Downstream subscribers (SQS/Lambda) process the SNS messages
- Part of the Shuri/ECM platform for Aulani content integration
- Shares GitHub repo (shuri-sns-messenger) and Harness project with Incognito variant (BAPP0250000)

## Dependencies

- **Trigger:** Hulkling API Gateway
- **Downstream:** AWS SNS topics, SQS/Lambda subscriptions
- **Data stores:** S3 buckets (d-scribe-content-*)
- **Infrastructure:** AWS Lambda (us-west-2), multiple accounts per environment

## Impact Classification

- **Full outage:** Aulani SNS messages not published; downstream subscribers receive no notifications
- **Degraded:** Message delivery delays; some messages may fail
