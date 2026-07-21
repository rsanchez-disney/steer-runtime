# Business Rules — DLR Dine Admin Tool

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.5% | Internal tool |
| Response time (p95) | < 3s | Splunk |

## Peak Periods

- Operations teams configure restaurants before park opening hours

## Business Logic

- Same architecture as WDW Dine Admin Tool deployed to DLR (us-west-2)
- Used to configure DLR restaurant settings for Dine Self Check-In
- Changes propagate to DLR DiSCO service (BAPP0215442)

## Dependencies

- DLR DiSCO service (consumer)
- RDS MariaDB

## Impact Classification

- **Full outage:** Operations cannot update DLR restaurant configurations. Existing configs continue to work.
- **Degraded:** Slow UI, config changes delayed.
