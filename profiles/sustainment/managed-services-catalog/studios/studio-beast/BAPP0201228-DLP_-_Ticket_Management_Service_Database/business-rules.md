# Business Rules — DLP Ticket Management Service Database

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | High availability (supports guest-facing TMS) | RDS metrics / AppDynamics |
| Response time | Monitored via AppDynamics | Per-environment dashboards |

## Business Logic

- Stores and manages all ticket-related data for TMS (BAPP0201208)
- Supports operations: Link Entitlements, Get Guest Tickets, Get Tickets, Unlike Entitlements
- Used by TMS Provider, EPS, and Ticket Preloader components

## Dependencies

- **TMS Provider (BAPP0201208)** — primary consumer
- **AWS RDS** — managed infrastructure

## Impact Classification

- **Full outage:** TMS cannot retrieve or update ticket data — guests unable to view/link tickets
- **Degraded:** Slow queries impacting TMS response times
- **Critical:** Single database backing all TMS operations
