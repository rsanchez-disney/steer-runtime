# Business Rules — WDPR FNB Stats Publisher Services

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.5% | CloudWatch |
| Publishing lag | < 10 min | Internal metrics |

## Peak Periods

- During park operating hours when FNB services are active

## Business Logic

- Publishes operational statistics for FNB services
- Provides metrics used for operational dashboards and reporting
- Non-guest-facing service

## Dependencies

- FNB services (data sources)
- ECS infrastructure

## Impact Classification

- **Full outage:** Operational statistics not published. No guest impact. Reporting gaps.
- **Degraded:** Delayed stats. Minor operational visibility gap.
