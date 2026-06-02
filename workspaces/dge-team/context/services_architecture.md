# DGE Services Architecture

## Service Map

| Alias | Service | Domain | Package | Key Dependencies |
|-------|---------|--------|---------|-----------------|
| DPAO | pea-attraction-provider | Operations | com.disney.dlpis.operations | Redis, Spring Boot |
| DPAU | dpa-all-access-show-provider | Operations | com.disney.dlpis.operations | Redis, Spring Boot |
| VQ | virtual-queue-provider | Operations | com.disney.dlpis.operations | Redis, Spring Boot |
| TMS | tms-ticket-management-service-provider | Guest | com.disney.wdpro.platform | Redis, RabbitMQ |
| — | wallet-server-proxy-provider | Guest | com.disney.dlpis.guest.wallet | Redis, RabbitMQ |
| — | tms-tickets-linking-provider | Guest | com.disney.dlpis.guest | Redis (Redisson) |

## Domain Groups

### Operations Domain (`com.disney.dlpis.operations`)
Services handling park operations: attractions, shows, virtual queues.
- **DPAO** — Premier Entry Access for attractions. DPA events, booking, availability.
- **DPAU** — All Access + Show products. API prefixes: `/v1/dpa` (All Access/Show), `/v1/sys` (Show only). Handles discovery, availability, pre-booking, payment, pass retrieval.
- **VQ** — Virtual Queue. Bookings, notifications, circuit breaker patterns.

### Guest Domain (`com.disney.dlpis.guest` / `com.disney.wdpro.platform`)
Services handling guest-facing ticket and wallet operations.
- **TMS** — Ticket Management Service. Core ticketing operations. Uses `java8-parent-pom`.
- **Wallet Proxy** — Apple Wallet (v1) + Airship Wallet (v2) pass generation and delivery.
- **Tickets Linking** — Links tickets across systems (v1 + v2 APIs).

## Shared Infrastructure

- **Redis** — All 6 services use Redis (spring-data-redis). Caching + session state.
- **RabbitMQ** — TMS and Wallet use RabbitMQ for async messaging.
- **Spring Boot** — All services are Spring Boot applications.
- **DLP Foundation** — Newer services (Wallet, Linking) use `dx-dlp-foundation-parent`.
- **OneId** — Guest authentication via SWID.

## CI/CD

- **Legacy:** Jenkins at `dlp.cicd.wdprapps.disney.com` (versioning, prebuild, package, docker, deploy)
- **New:** Harness at `disney.harness.io` (Disneyland_Paris / DLP_DGE_API_ORION_services)
- **Docker:** All services publish Docker images
- **AWS Deploy:** ECS/Fargate deployment

## API Patterns

- REST APIs with versioned paths (`/v1/`, `/v2/`)
- SWID path parameter for guest identity
- Circuit breaker patterns (VQ)
- Async notifications via RabbitMQ
