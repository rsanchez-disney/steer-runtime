# Business Rules — DLP Ticket Linking Services

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | High availability (guest-facing) | Healthcheck Manager |
| Response time (p95) | Monitored via AppDynamics | Per-component dashboards |

## Business Logic

### Tickets Linking Provider (AWS ECS)
- REST API to retrieve ticket data
- Links/unlinks tickets to guest accounts
- Interacts with TMS (BAPP0201208)
- Uses OneID for guest identity and RabbitMQ for messaging

### Park Entry BookingID Provider (On-Prem)
- Retrieves order IDs from Galaxy database for specified package IDs
- Invokes stored procedure `DLRP_ListeResa`
- Single endpoint to access Galaxy database

## Dependencies

- **TMS (BAPP0201208)** — ticket management operations
- **eGalaxy Database** — order/package data (via DLRP_ListeResa)
- **OneID** — guest identity
- **RabbitMQ** — messaging

## Impact Classification

- **Ticket Linking down:** Guests cannot access ticket info or link/unlink tickets
- **Park Entry BookingID down:** Guests unable to verify packages or retrieve package information
- **Galaxy not visible:** Reservation not yet visible in Galaxy causes booking-ooc-reservation-publisher issues
