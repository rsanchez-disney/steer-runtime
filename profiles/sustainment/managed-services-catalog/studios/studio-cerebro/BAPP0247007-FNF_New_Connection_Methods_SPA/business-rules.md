# Business Rules — FNF New Connection Methods SPA

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in Confluence Cloud | Not documented in Confluence Cloud |
| Response time (p95) | Not documented in Confluence Cloud | Not documented in Confluence Cloud |
| Error rate | < 3% (alert threshold) | Content endpoint: 0.02% |

## Peak Periods

- Park opening hours when guests manage their Family & Friends lists
- Holiday seasons with high park attendance
- New reservation release events (hotel reservation import feature)

## Business Logic

- Account consolidation — merging duplicate guest accounts
- Friend list management — view, add, remove connections
- Add guest/managed guest — add children or managed profiles
- GUID-based friend list retrieval
- Hotel reservation import — import reservations to share with friends
- Connection invites — send and accept friend requests
- Plan sharing and group features
- Replaces previous FnF SPA (BAPP0180541)

## Dependencies

- Profile WebAPI WAM (BAPP0253435) — Cannot reach backend services if down
- Profile VAS (BAPP0242566) — Connected guests data unavailable if down
- AuthenticatorJS (BAPP0248309) — Login/auth fails if down
- Akamai CDN — 502 errors, no traffic reaches origin if down
- GAM — Friend list data source
- Internal Libraries: Vault, Nimbus, RA Components, RA Logger, Analytics, CloudWatch, NavUI, Profile-shared

## Impact Classification

- **Full outage:** Guests cannot view or manage Family and Friends list. Cannot send or accept connection invites. Account consolidation unavailable. Hotel reservation import fails. Plan sharing and group features affected.
- **Degraded:** Partial friend list loading, slow responses, intermittent connection invite failures.
