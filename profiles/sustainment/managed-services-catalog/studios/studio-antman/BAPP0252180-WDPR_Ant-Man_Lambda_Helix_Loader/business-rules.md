# Business Rules — WDPR Ant-Man Lambda Helix Loader

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Invocation success rate | > 99% | Grafana Lambda errors panel |
| Execution duration | < 60s | Grafana Lambda duration panel |
| Throttle rate | 0 | Grafana Lambda throttles panel |

## Business Logic

- Helix Loader Lambda loads D-Scribe content into Helix
- Triggered by Filter Lambda
- Manual populate available via GCx Tools API: `GET /helixloader/populate`
- Parameters: HelixLoaderLambda, HelixLambda, ContentType, EnterpriseId

## Manual Populate Endpoints (GCx Tools API)

| Environment | URL |
|-------------|-----|
| Prod | https://gcx-tools-api.wdprapps.disney.com/helixloader/populate |
| Stage | https://stage.gcx-tools-api.wdprapps.disney.com/helixloader/populate |
| Latest | https://latest.gcx-tools-api.wdprapps.disney.com/helixloader/populate |

## Dependencies

- **Trigger:** Filter Lambda (upstream)
- **Manual trigger:** GCx Tools API Gateway (`/helixloader/populate`)
- **Data stores:** S3 buckets (d-scribe-content-*), Helix (downstream)
- **Infrastructure:** AWS Lambda (us-west-2), multiple accounts

## Impact Classification

- **Full outage:** Content not loaded into Helix; downstream Helix consumers receive stale data
- **Degraded:** Loading delays; some content types may fail
