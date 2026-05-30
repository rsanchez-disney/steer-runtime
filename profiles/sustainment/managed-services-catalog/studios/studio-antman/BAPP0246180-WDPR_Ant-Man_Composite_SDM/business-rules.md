# Business Rules — WDPR Ant-Man Composite SDM

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly availability |
| Notification delivery | < 5 min | Time from trigger to RabbitMQ publish |
| Error rate | < 1% | Failed notifications / total |

## Peak Periods

- Bulk content publishes (schedule updates, MealPeriod, MenuOffering)
- Seasonal content changes
- Mass republish operations via GCX Tools API

## Business Logic

- Composite SDM processes SDM notifications: ScheduleUpdate and PublishNotification
- Publishes processed content to RabbitMQ for downstream consumption
- Stores XML content to S3 (path: `sdm/Schedule/{ContentType}/{Location}/{EnterpriseId}.xml`)
- Content types: ActivityProduct, MealPeriod, MenuOffering, Schedule
- Manual republish available via GCX Tools API Gateway endpoints
- `sendDownstream()` controls whether notification is sent — if skipped, logs "SKIP"

## Manual Republish Endpoints (GCX Tools API Gateway)

| Environment | URL |
|-------------|-----|
| prod | https://gcx-tools-api.wdprapps.disney.com/sdm/publishnotification |
| prod-stage | https://prod-stage.gcx-tools-api.wdprapps.disney.com/sdm/publishnotification |
| prod-latest | https://prod-latest.gcx-tools-api.wdprapps.disney.com/sdm/publishnotification |
| latest | https://latest.gcx-tools-api.wdprapps.disney.com/sdm/publishnotification |

## Dependencies

- **Upstream:** GCX Tools API Gateway (manual republish), D-Scribe content sources
- **Downstream:** RabbitMQ (BAPP0234155), S3 (XML storage), Collector (BAPP0159223)
- **Data stores:** S3 buckets (d-scribe-content-live)
- **Infrastructure:** AWS ECS Fargate (us-west-2), shared cluster wdpr-content-S0001431-usw2-prd

## Impact Classification

- **Full outage:** SDM notifications not processed; schedule updates not published; downstream services receive stale data
- **Degraded:** Notification delays; some content types may fail while others succeed
