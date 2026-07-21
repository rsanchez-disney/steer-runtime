# Business Rules — WDPR Retail Tech Cloud Config Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | CloudWatch |
| Response time (p95) | < 500ms | CloudWatch |

## Peak Periods

- During service deployments and configuration refreshes
- Not traffic-dependent — configs are cached by consumers

## Business Logic

- Spring Cloud Config server providing centralized configuration for retail tech applications
- Consumers cache configuration locally — brief outages are tolerable
- Configuration changes require service restart or refresh to take effect

## Dependencies

- Git repository (config source)
- ECS infrastructure

## Impact Classification

- **Full outage:** Services cannot fetch new configurations. Existing cached configs continue to work. No immediate guest impact.
- **Degraded:** Slow config fetches. Services use cached values.
