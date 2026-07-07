# Business Rules — WDPRD Preference Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in Confluence Cloud | |
| Response time (p95) | Not documented in Confluence Cloud | |
| Error rate | Not documented in Confluence Cloud | |

## Peak Periods

- Not documented in Confluence Cloud. Expected high traffic during park hours and marketing campaign opt-in periods.

## Business Logic

- Stores guest preferences as SWID-based data (no PII, no PCI)
- Serves as System of Record (SOR) for DynamoDB tables previously used by ProfileService (BAPP0054836)
- Handles communication preference management (marketing opt-ins/outs)
- Supports implicit preference generation
- Internal accessibility only — consumed by other Profile services

## Dependencies

- DynamoDB — primary data store for guest preferences
- Profile B2C (BAPP0245892) — upstream consumer
- Profile WebAPI WAM (BAPP0253435) — upstream consumer

## Impact Classification

- **Full outage:** Guest preferences not saved or retrieved. Communication preference changes lost. Implicit preference generation fails. Marketing opt-ins/outs may not persist.
- **Degraded:** Partial preference data may be stale or unavailable. Guest experience degraded but not fully blocked.
