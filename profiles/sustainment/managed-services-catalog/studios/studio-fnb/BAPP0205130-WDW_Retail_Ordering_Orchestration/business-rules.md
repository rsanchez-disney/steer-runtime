# Business Rules — WDW Retail Ordering Orchestration

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Splunk / Grafana |
| Response time (p95) | < 2s | AppDynamics |
| Error rate | < 1% | Splunk ROO dashboards |

## Peak Periods

- WDW: Holiday seasons, park hours, special merchandise releases
- Highest volume during park evenings (guests shopping after attractions)

## Business Logic

- Orchestrates mobile merchandise checkout flow at WDW retail locations
- Integrates with VenueNext for order submission to POS
- Abandoned authorizations are refunded by RO Batch Service (BAPP0207693)
- Redis cache for session data; Kinesis for order events
- Orders published to Kinesis stream for downstream processing

## Dependencies

- VenueNext/Shift4 (POS integration)
- Barcode Generator Service (BAPP0216099)
- RO Batch Service (BAPP0207693)
- Payment systems (DSP/POS team)
- DynamoDB, Redis, Kinesis

## Impact Classification

- **Full outage:** Guests cannot complete mobile merchandise checkout at WDW. Must use physical registers.
- **Degraded:** Slow checkout, intermittent failures. Some locations may be affected while others work.
