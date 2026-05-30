# Business Rules — WDPR Ant-Man Lambda Schedules Korvac

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invocation success rate | > 99% | Grafana Lambda errors panel |
| Execution duration | < 30s | Grafana Lambda duration panel |
| Throttle rate | 0 | Grafana Lambda throttles panel |

## Peak Periods

- Weekly schedule processing (MealPeriod currentWeek)
- Cron-triggered — runs on EventBridge schedule

## Business Logic

- Korvac is a cron-triggered Lambda that processes scheduled content
- Triggered by EventBridge rules (e.g., `korvac-scheduler-mpg-currentWeek`)
- Reads/writes content from S3 buckets (d-scribe-content-live for prod, d-scribe-content-stage for lower)
- Processes MealPeriod and other schedule-related content types
- Makes HTTP calls to downstream services for content delivery

## Dependencies

- **Trigger:** AWS CloudWatch Events / EventBridge (cron-based scheduled rules)
- **Data stores:** S3 buckets (d-scribe-content-live, d-scribe-content-stage)
- **Downstream:** HTTP calls to content services
- **Infrastructure:** AWS Lambda (us-west-2), account 876496569223 (wdpr-apps)

## Impact Classification

- **Full outage:** Scheduled content not processed; schedules become stale
- **Degraded:** Processing delays; some schedule types may fail while others succeed
