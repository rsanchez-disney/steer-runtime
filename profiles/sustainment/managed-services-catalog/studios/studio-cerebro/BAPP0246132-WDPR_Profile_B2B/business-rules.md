# Business Rules — WDPR Profile B2B

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in Confluence Cloud | |
| Response time (p95) | Not documented in Confluence Cloud | |
| Error rate | Not documented in Confluence Cloud | |

## Peak Periods

- Not documented in Confluence Cloud. Traffic driven by internal service-to-service calls from downstream consumers.

## Business Logic

- B2B (service-to-service) endpoints only — no guest-facing traffic
- Primary endpoint: aggregated-profile
- Replacement for legacy BAPP0054836
- Internal-only access via ALB and API Gateway
- Downstream consumers use this for retrieving aggregated profile data programmatically

## Dependencies

- Profile B2C (BAPP0245892) — profile data source
- OneID — authentication/authorization for service tokens
- GAM — guest account management

## Impact Classification

- **Full outage:** Aggregated profile endpoint unavailable to internal consumers. Services depending on B2B profile data will fail. No direct guest-facing impact unless downstream services cascade.
- **Degraded:** Increased latency or partial failures on aggregated-profile endpoint. Downstream services may experience timeouts or incomplete data.
