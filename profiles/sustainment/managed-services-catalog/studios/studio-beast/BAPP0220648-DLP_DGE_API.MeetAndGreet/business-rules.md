# Business Rules — DLP DGE API.MeetAndGreet

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Healthcheck monitoring |
| Response time (p95) | < 2s | Splunk latency SPL |
| Error rate | < 1% | Splunk error rate |

## Peak Periods

- Hotel check-in hours (morning/afternoon) when guests book character experiences
- School holidays and peak park season

## Business Logic

- Service provides JWT tokens for Lineberty API authentication
- Mobile app uses JWT to connect directly to Lineberty for:
  - Experience queue information (timeslot availability)
  - Registering a booking for a chosen experience
  - Retrieving registered bookings
- Meet & Greet experiences are limited to character encounters inside resort hotels

## Dependencies

### Internal (Beast Scope)
- **Guest Extended Profile** (BAPP0177719) — guest profile data
- **Keyring** (BAPP0177699) — guest identity and portfolio

### External
- **Lineberty** — third-party booking/queue management API (critical dependency)
- **Airship** — push notifications
- **Content API** — experience content/metadata

## Impact Classification

- **Full outage:** Guests cannot book Meet & Greet experiences in the mobile app. Only guest impact — no cast or other app features affected.
- **Degraded:** Partial Lineberty endpoint failures may affect specific booking operations while others remain functional.
