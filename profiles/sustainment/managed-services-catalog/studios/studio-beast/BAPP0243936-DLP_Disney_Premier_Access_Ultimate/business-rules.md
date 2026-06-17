# Business Rules — DLP Disney Premier Access Ultimate

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Critical (revenue-generating, guest-facing) | Healthcheck Manager |
| Response time (p95) | Monitored via AppDynamics | PROD_DLP_PAAP_wdpr-dlp-is-operations-dpa-all-access-show-provider |
| Error rate | Monitored via Splunk | ALL-ACCESS Technical Errors Dashboard |

## Pre-conditions

- Guest must have a ticket or package linked to their account

## Business Rules

### DPA Ultimate (Attractions)
- Skip standard ticket line, take fast lane to ALL eligible attractions
- No allocated time slots — flexibility to join fast lane whenever
- One use per attraction
- Can be purchased in advance or on the day of visit
- Available via official app, website, Hotel+Tickets package, or selected partners

### Secure Your Seat (SYS) — Shows
- Paid service to book a seat for popular shows
- Shows: Lion King, Mickey and the Magician, Frozen, Pixar
- Guarantees access and a seat for chosen session
- Guest presents reservation to Cast Member at dedicated queue
- Guest must have a Park ticket

## Dependencies

### Internal (Beast/Orion)
- **PSP Payment Methods** — payment processing
- **Guest Itinerary Provider** — pass display in itinerary
- **Push Notification Publisher** — notifications

### External
- **Experience Access** (app-frdlp-experienceaccess) — redemption, recovery, GSS apps, DAP operation
- **Core API** (app-frdlp-coreapi) — order management
- **Product Gateway / Titus** (app-global-titus) — product gateway
- **TBX Ops** (app-global-l3tbxdlp) — TravelBox
- **Worldpay** — payment processing
- **Airship** — push notifications
- **Surqual** — product catalog

## Impact Classification

- **DPA All Access Show Provider down:** Guests cannot create any DPA passes — major revenue impact
- **SYS down:** Guests cannot book show seats
- **Payment failure:** Guests cannot complete purchase
- **Itinerary down:** Guests cannot view purchased passes
