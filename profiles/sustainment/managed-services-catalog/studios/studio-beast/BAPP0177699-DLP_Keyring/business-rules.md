# Business Rules — DLP Keyring

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | All ECS services healthy |
| Response time (p95) | < 2s | Keyring Main API endpoints |
| Error rate | < 1% | HTTP 5xx responses |

## Peak Periods

- Park opening hours (08:00–23:00 CET) — highest traffic on profile and portfolio APIs
- Ticket sales events (seasonal pass launches, special events) — spike on ticket-provider and package-digital-provider
- Morning rush (08:00–10:00 CET) — CNS PRC Listener processes overnight OneID account changes

## Business Logic

- Portfolio types managed: PACKAGE, WEBTICKET, TICKET, DPAU (Disney Premier Access Ultimate), DPAO (Disney Premier Access One), ROOMONLY, SYS, FOOD_ORDER
- Ticket linking eligibility: only PACKAGE, WEBTICKET, TICKET types are eligible for auto-linking
- Force-linking minimum age: 10 (configurable via `app.portfolio.linking.force-linking-min-age`)
- Force-linking max page size: 100 portfolios per batch
- Reconciliation max page size: 100 portfolios per batch
- Portfolio page size max: 100 items per API response
- Default language: fr-fr (French)
- Guest profile events are published to RabbitMQ with routing keys for all events, GEP events, reconciliation events, and to-be-linked events

## Dependencies

- **OneID Admin Controller** — Guest profile retrieval (`/v1/profile/{swid}`, `/v1/profile/retrieveAlternates-admin/{swid}`)
- **GCP Pub/Sub** — OneID account change events (CREATE, UPDATE, DELETE_REQUESTED, DELETE)
- **BMacs** — Booking management system for package/ticket reconciliation
- **Package Reservation Service (Core API)** — Ticket and booking data source
- **TMS Ticket Linking Service** — Ticket-guest association operations
- **MariaDB** — Persistent storage for Keyring Main (guest profiles, portfolios)
- **RabbitMQ** — Event messaging between Keyring components
- **Vault (HashiCorp)** — Secret management (DB credentials, OAuth client secrets, GCP keys)
- **Consul** — Application configuration (non-secret properties)
- **AuthZ Service** — OAuth2 token validation and client credentials

## Impact Classification

- **Full outage:** Guests cannot view their tickets, packages, or profile in the DLP mobile app. No new ticket purchases can be linked to guest accounts. OneID account changes are queued but not processed.
- **Degraded:** Slow portfolio retrieval, delayed ticket linking (tickets appear after Lambda reconciliation runs), stale profile data if CNS PRC Listener is behind.
