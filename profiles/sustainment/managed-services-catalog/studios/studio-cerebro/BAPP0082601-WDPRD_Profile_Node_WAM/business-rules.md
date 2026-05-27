# Business Rules — WDPRD Profile Node WAM

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | N/A - DEPRECATED | Service migrated to Java WAM (BAPP0253435) |
| Response time (p95) | N/A | N/A |
| Error rate | N/A | N/A |

## Peak Periods

- N/A — Service is deprecated and migrated to Java WAM (BAPP0253435)

## Business Logic

- Orchestration/BFF layer for Profile SPAs
- DynamoDB session management
- Request routing to backend microservices
- All functionality migrated to BAPP0253435 (Java WAM)

## Dependencies

- DynamoDB (sessions)
- Redis (ElastiCache)
- Profile B2C (BAPP0245892)
- Profile VAS (BAPP0242566)
- OneID (authentication)

## Impact Classification

- **Full outage:** N/A — Service deprecated. If still receiving traffic, guests cannot access profile features via web/mobile.
- **Degraded:** N/A — All traffic should be routed to Java WAM (BAPP0253435).
