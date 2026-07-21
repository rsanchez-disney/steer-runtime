# Business Rules — WDW Dine Admin Tool

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.5% | Internal tool — lower SLA than guest-facing |
| Response time (p95) | < 3s | Splunk |

## Peak Periods

- Operations teams configure restaurants before park opening hours
- Changes typically made in early morning or during operational adjustments

## Business Logic

- Cast-facing admin tool for managing Dine Self Check-In configurations
- Three components: Config Service (backend), Admin API, Admin UI
- Used to configure: restaurant settings, wait time rules, check-in parameters, walk-up list capacity
- Changes propagate to DiSCO service (BAPP0170052)
- RDS MariaDB stores configuration data

## Dependencies

- DiSCO service (consumer of configurations)
- RDS MariaDB

## Impact Classification

- **Full outage:** Operations cannot update restaurant configurations. Existing configs continue to work. No immediate guest impact.
- **Degraded:** Slow UI, config changes delayed. Minor operational inconvenience.
