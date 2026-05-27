# Business Rules — WDW Mobile Application (Family and Friends)

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in MyWiki | |
| Response time (p95) | Not documented in MyWiki | |
| Error rate | Not documented in MyWiki | |

## Peak Periods

- Not documented in MyWiki

## Business Logic

- Allows guests to view and manage their Family and Friends list
- Send and accept connection invites between guests
- Share plans with connected guests
- Android (Kotlin) module within the WDW mobile app
- Disney POC: Mark Lewis

## Dependencies

- Backend APIs for FnF data (Profile B2C / VAS)
- OneID for authentication
- WDW Android app shell

## Impact Classification

- **Full outage:** Guests cannot view or manage Family and Friends list. Cannot send or accept connection invites. Plan sharing unavailable.
- **Degraded:** Partial list loading, invite delays, or intermittent failures in plan sharing.
