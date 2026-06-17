# Business Rules — DLP Mobile BFF CORE

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | ECS service healthy + API Gateway responding |
| Response time (p95) | < 2s | GraphQL /graphql endpoint |
| Error rate | < 1% | HTTP 5xx responses |

## Peak Periods

- Park opening hours (08:00–23:00 CET) — highest wallet/package query traffic
- Morning rush (08:00–10:00 CET) — guests checking tickets and passes before park entry
- Seasonal events and ticket launches — spike on wallet and package queries

## Business Logic

- BFF aggregates data from 12+ downstream VAS microservices into unified GraphQL responses
- Currently serves wallet and package requests; other services still called directly by mobile app
- Single GraphQL endpoint: `/graphql`
- Uses Redis as cache layer to reduce downstream call volume
- API Gateway (resource ID: z0luy5a6wc) fronts the BFF service
- Configuration managed via Vault (non-secret and secret paths)

## Dependencies

- **ARS** — Arrival reservation system registration
- **Book Dine** — Dining booking VAS microservice
- **Digital Key** — Digital key VAS microservice
- **DPA All Access Show** — Disney Premier Access All Access VAS microservice
- **Itinerary** — Itinerary VAS microservice
- **Magic Mobile** — Magic mobile pass service
- **Meet And Greet** — Meet & Greet VAS microservice
- **Package Retrieve** — Package provider
- **PEA Attraction** — Disney Premier Access One VAS microservice
- **Registration Form (OLCI)** — Resort Online Checkin VAS microservice
- **Tickets Linking** — Tickets linking VAS microservice
- **Virtual Queue** — Virtual queue VAS microservice
- **Content API (Tridion)** — Content provider (external)
- **Lineberty** — Lineberty provider (external)
- **Vault** — DLP Vault for secrets/configuration

## Impact Classification

- **Full outage:** Guests unable to access their tickets through the wallet service nor their packages data in the DLP mobile app.
- **Degraded:** Slow responses on wallet/package queries, partial data returned if individual downstream VAS services are unavailable.
