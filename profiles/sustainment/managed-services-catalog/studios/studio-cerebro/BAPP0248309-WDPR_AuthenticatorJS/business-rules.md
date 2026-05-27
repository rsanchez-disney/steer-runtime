# Business Rules — WDPR AuthenticatorJS

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.99% (CRITICAL - all login depends on this) | Not documented in MyWiki |
| Response time (p95) | N/A (static JS bundle served via CDN) | N/A |
| Error rate | 0% tolerance (any failure = all logins broken) | Not documented in MyWiki |

## Peak Periods

- Park opening hours (7am-11pm ET for WDW, 7am-12am PT for DLR)
- Holiday seasons (Thanksgiving, Christmas, Spring Break)
- New ticket/reservation release events

## Business Logic

- On non-Profile pages: instantiates the OneID client
- Handles OneID Lightbox events related to session management
- Calls Profile JWT Service for token after login
- Manages PEPCOM session cookies (pep_jwt_token, pep_oauth_token)
- Handles OneID V5 migration and Trust States (isMediumTrust, isLowTrust, isHighTrust)
- Universal Interface: Abstraction layer that works with both V4 and V5
- V4: Legacy implementation, being migrated
- V5: New implementation with Trust States

## Dependencies

- OneID (V4/V5) — Downstream: Lightbox events, authentication
- Profile JWT Service (BAPP0082610) — Downstream: Token generation after login
- Profile SPA (BAPP0180489) — Upstream: SPA loads AuthenticatorJS
- NavUI — Upstream: Navigation triggers auth init
- Akamai CDN — Hosting: Serves the JS bundle
- AWS S3 — Storage: Bundle artifact storage
- Consumers: Profile SPA, MB+C SPA, FnF SPA, NavUI, Commerce apps, DCL apps, PhotoPass

## Impact Classification

- **Full outage:** ALL login and registration flows break across ALL brands (WDW, DLR, DCL). Guests cannot log in on any Disney web property. OneID Lightbox events not handled. PEPCOM session cookies not managed. Impact is SILENT until multiple guests report (no healthcheck on static bundle).
- **Degraded:** Trust State transitions fail → login loops. Aggressive retry policy causes cascading failures during OneID degradation.
