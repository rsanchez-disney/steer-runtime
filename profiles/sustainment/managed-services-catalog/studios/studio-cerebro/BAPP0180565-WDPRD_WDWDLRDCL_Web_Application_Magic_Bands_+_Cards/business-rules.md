# Business Rules — WDPRD WDWDLRDCL Web Application Magic Bands + Cards

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in Confluence Cloud | |
| Response time (p95) | ART East < 5s, West < 6s | AppDynamics |
| Error rate | < 3% (East/West) | Splunk / CloudWatch |
| CPU | < 30% | CloudWatch |
| Memory | < 50% | CloudWatch |

## Peak Periods

- Not documented in Confluence Cloud

## Business Logic

- Allows guests to manage MagicBand and DisneyBand reservations
- Link/unlink bands to guest accounts
- List MB/DB orders and view reservation data
- Band customization features
- MB+ booking flow (revenue-impacting)
- MagicBand (MB): Order created at booking. Guest cannot complete starting 5 days before arrival.
- DisneyBand (DB): Order created at booking. Guest cannot complete starting 10 days before arrival (45-11 days window).
- Highly dependent on VAS for data aggregation — if VAS has Duplicate Key issue, MB+C also fails
- Active-active deployment across US-EAST-1 (WDW) and US-WEST-2 (DLR)

## Dependencies

- Profile VAS (BAPP0242566) — CRITICAL: All band data comes from VAS
- Profile WebAPI WAM (BAPP0253435) — Cannot reach backend
- AuthenticatorJS (BAPP0248309) — Login/auth fails
- Akamai CDN — 502 errors, no traffic reaches origin
- xBMS (Fulfillment) — Band orders/entitlements unavailable
- DCL Reservation Service — DCL page data unavailable
- Internal Libraries: Vault, Nimbus, RA Components, RA Logger, Analytics, CloudWatch, NavUI, Profile-shared

## Impact Classification

- **Full outage:** Guests cannot manage MagicBand/DisneyBand reservations. Cannot link or unlink bands. MB+ booking flow breaks (revenue impact). Band status and customization unavailable.
- **Degraded:** Partial data loading (VAS Duplicate Key cascading), specific order types failing, DCL data unavailable.
