# Business Rules — GCX Site Builder Cast WebAPI

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly availability |
| Response time (p95) | < 2000ms | Splunk latency_spl |
| Error rate | < 0.5% | Errors / total requests |

## Peak Periods

- High-traffic periods on Cast Member portals
- Content publishing campaigns (park events, seasonal updates)
- New Cast Member onboarding periods
- Park opening seasons

## Business Logic

- Cast Portals WebAPI is the backend REST API for the Cast Portals SPA frontend
- Serves content data from D-Scribe/ECM platform to the SPA
- Part of the Ant-Man content ecosystem
- Reads content from S3 buckets (d-scribe-content-*)
- Health endpoint at `/cast-api/information`

## Dependencies

- **Upstream:** D-Scribe content pipeline (Assembler, Transformer) — content in S3
- **Downstream:** Cast Portals SPA (BAPP0159179) — frontend consumer
- **Data stores:** S3 buckets (d-scribe-content-live, d-scribe-content-prod-*)
- **Infrastructure:** AWS ECS Fargate (us-west-2)

## Impact Classification

- **Full outage:** Cast Portals SPA cannot retrieve data; frontend shows errors
- **Degraded:** Slow API responses cause sluggish SPA experience
