# Business Rules — DLP Ticket Management Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | High availability (guest-facing) | Healthcheck deep endpoint |
| Response time (p95) | Monitored via AppDynamics | TMS Provider dashboard |
| Error rate | Monitored via Splunk | DLP - Tickets Management Service Provider |

## Peak Periods

- 6:00 AM daily — Ticket Preloader batch execution
- Park opening hours — highest ticket query/linking traffic
- Ticket purchase periods — linking operations spike

## Business Logic

### TMS Service Provider
- Manages the Entitlements portfolio
- Acts as a Galaxy cache (proxy to eGalaxy database)
- Pre-loads the day's tickets
- Links or unlinks tickets to guest accounts
- Operations: Link Entitlements, Get Guest Tickets, Get Tickets, Unlike Entitlements

### Entitlement Product Service (EPS)
- Sends PLU information
- Single endpoint: product finder (retrieves PLU/Product info using SKU parameter)

### Ticket Preloader Batch
- Runs daily at 6:00 AM (on-prem, NOT AWS)
- Invokes stored procedure `DLRP_ListeTickets` from eGalaxy database
- For each ticket: sends POST to TMS `/ticket-management-service/v2/entitlements/{visualId}/notification`
- Creates notifications regarding entitlement changes

## Dependencies

- **eGalaxy Database** — primary ticket data source (on-prem, dedicated servers for TMS)
  - SQL51 (Primary, write rights)
  - SQL53 (Secondary, READ only, failover)
- **MariaDB (dlp-tms-mariadb-prod)** — RDS database for TMS data
- **AWS Kinesis** — event streaming

## Impact Classification

- **TMS Provider down:** Ticket display failure, inability to link/unlink tickets
- **EPS down:** Guests lose access to product information, disrupting product-ticket association
- **Preloader failure:** No entitlement notifications for the day, guest confusion on arrival
- **Galaxy Database slow/down:** TMS degraded (>30s responses) or unavailable
