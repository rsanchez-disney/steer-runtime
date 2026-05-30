# Business Rules — WDPR Ant-Man Lambda SDM Content

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invocation success rate | > 99% | Grafana Lambda errors panel |
| Execution duration | < 60s | Grafana Lambda duration panel |
| Throttle rate | 0 | Grafana Lambda throttles panel |

## Peak Periods

- Bulk SDM content publishes
- Schedule update campaigns

## Business Logic

- SDM Content Lambda processes SDM content operations (ScheduleUpdate, PublishNotification)
- Triggered by Filter Lambda
- Can be manually triggered via GCx Tools API Gateway for ScheduleUpdate and PublishNotification
- Writes content to S3 buckets (d-scribe-content-*)

## Dependencies

- **Trigger:** Filter Lambda (upstream)
- **Manual trigger:** GCx Tools API Gateway (ScheduleUpdate, PublishNotification)
- **Data stores:** S3 buckets (d-scribe-content-live, d-scribe-content-prod-*)
- **Infrastructure:** AWS Lambda (us-west-2), multiple accounts per environment

## Impact Classification

- **Full outage:** SDM content not processed; schedule updates and publish notifications fail
- **Degraded:** Processing delays; some content operations may fail
