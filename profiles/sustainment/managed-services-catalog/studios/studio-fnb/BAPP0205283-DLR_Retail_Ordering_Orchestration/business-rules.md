# Business Rules — DLR Retail Ordering Orchestration

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Splunk / Grafana |
| Response time (p95) | < 2s | AppDynamics |
| Error rate | < 1% | Splunk ROO dashboards |

## Peak Periods

- DLR: Weekends, holidays, special merchandise releases, Oogie Boogie Bash
- Highest volume during park evenings

## Business Logic

- Same codebase as WDW ROO deployed to DLR region (us-west-2)
- Orchestrates mobile merchandise checkout flow at DLR retail locations
- Integrates with VenueNext for order submission to POS
- Abandoned authorizations are refunded by RO Batch Service (BAPP0207717)

## Dependencies

- VenueNext/Shift4 (POS integration)
- Barcode Generator Service (BAPP0216099)
- RO Batch Service (BAPP0207717)
- Payment systems (DSP/POS team)
- DynamoDB, Redis, Kinesis

## Impact Classification

- **Full outage:** Guests cannot complete mobile merchandise checkout at DLR. Must use physical registers.
- **Degraded:** Slow checkout, intermittent failures.
