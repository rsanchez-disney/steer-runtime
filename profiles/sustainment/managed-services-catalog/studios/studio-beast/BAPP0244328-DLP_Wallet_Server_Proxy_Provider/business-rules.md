# Business Rules — DLP Wallet Server Proxy Provider

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Proxy Provider ECS service healthy |
| Response time (p95) | < 2s | Pass generation/install API endpoints |
| Error rate | < 1% | HTTP 5xx responses |
| Purge execution | Daily 6:00 AM | Batch completes successfully |

## Peak Periods

- Park opening hours (08:00–23:00 CET) — highest pass generation/update traffic
- Ticket purchase events — spike when guests add passes to digital wallets
- Morning 06:00 AM — Purge Processor batch execution window

## Business Logic

- Guest should be able to see their bookings in the wallet
- Guest Profile Wallet displays: Tickets, Magic Pass, DPAU, DPAO, Annual Pass, Meet & Greet
- Digital Device Wallet (Apple/Google) displays: Tickets, Magic Pass, Annual Pass
- Native passes must stay synchronized with the DLP data source at all times
- Purge Processor removes Airship data for passes that are: deleted by guest, expired, or cancelled by DLP
- Purge runs daily at 6:00 AM — passes purged should no longer appear in guest digital wallets

## Dependencies

- **Airship** — Native pass delivery and management platform
- **DLP Data Source** — Source of truth for pass/ticket data
- **Apple Wallet / Google Pay** — Target platforms for native pass installation
- **DLP Mobile App** — Frontend consumer of wallet APIs

## Impact Classification

- **Full outage (Proxy Provider):** Guests unable to access booking information, tickets not synced with their digital wallet. New pass generation/installation fails.
- **Full outage (Purge Processor):** Guests could see Tickets, Magic Passes or Annual Passes that are cancelled or expired.
- **Degraded:** Slow pass generation, delayed synchronization between DLP data source and native wallet passes.
