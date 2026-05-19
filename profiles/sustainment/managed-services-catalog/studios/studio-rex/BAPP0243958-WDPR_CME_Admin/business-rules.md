# Business Rules — WDPR CME Admin

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | | |
| Response time (p95) | | |
| Error rate | | |

## Peak Periods

- N/A (internal tool)

## Business Logic

- Internal tool for park reservation configuration management
- Separate components for DLR (us-west-2) and WDW (us-east-1)
- Changes here affect park reservation availability and rules

## Dependencies

- CME DLR backend
- CME WDW backend
- MariaDB (configuration store)

## Impact Classification

- **Full outage:** Operations team cannot manage park reservation configuration
- **Degraded:** Partial configuration management unavailable for one resort
