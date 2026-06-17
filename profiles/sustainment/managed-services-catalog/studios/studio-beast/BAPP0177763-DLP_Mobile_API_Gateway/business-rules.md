# Business Rules — DLP Mobile API Gateway

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | High availability (critical infrastructure) | AWS API Gateway metrics |
| Response time (p95) | Monitored via CloudWatch | API Gateway dashboards |
| Error rate | < 1% (4xx/5xx) | CloudWatch metrics |

## Peak Periods

- Park operating hours — highest API traffic
- App launch spikes (morning park opening)

## Business Logic

- Centralized entry point for all DLP mobile microservices
- Request routing to downstream services
- Authentication and authorization enforcement
- Rate limiting and throttling
- Response caching
- Protocol translation
- Load balancing across backend services

## Dependencies

- **All downstream microservices** — gateway routes to all Beast-managed services
- **AWS infrastructure** — managed by Cloud OPS

## Impact Classification

- **Full outage:** ALL mobile app services unavailable — guests cannot access any functionality
- **Degraded:** Specific routes failing — partial service disruption
- **Critical:** This is the single point of entry — any issue has cascading impact on all services

## Important Notes

- **Dev/support does NOT touch infrastructure** — all changes via Cloud OPS (ops-frdlp-cloudops)
