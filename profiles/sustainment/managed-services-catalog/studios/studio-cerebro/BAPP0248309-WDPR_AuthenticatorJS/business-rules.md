# Business Rules — WDPR AuthenticatorJS

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.99% (CRITICAL - all login depends on this) | Not documented in Confluence Cloud |
| Response time (p95) | N/A (static JS bundle served via CDN) | N/A |
| Error rate | 0% tolerance (any failure = all logins broken) | Not documented in Confluence Cloud |

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

## Akamai Gateway (S3+CDN delivery)

Bundle delivered via Akamai CDN from S3 bucket. No origin server — static JS file.

## Internal Consumers (Who Loads AuthenticatorJS)

| Consumer | Impact if AuthenticatorJS Fails |
|----------|----------------------------------|
| Profile SPA (BAPP0180489) | Login/registration completely broken |
| MB+C SPA (BAPP0180565) | Cannot authenticate for band management |
| FnF SPA (BAPP0247007) | Cannot authenticate for friend management |
| NAV UI (Navigation) | Login widget does not render on ANY page |
| Commerce / Ticketing apps | Cannot authenticate for purchases |
| DCL apps | Cannot authenticate |
| PhotoPass | Cannot authenticate |
| disneyworld.disney.go.com | ALL login broken |
| disneyland.disney.go.com | ALL login broken |
| disneycruise.disney.go.com | ALL login broken |
| hongkongdisneyland.com | ALL login broken |

## Reassignment Groups (Routing)

| Pattern | Assignment Group |
|---------|-----------------|
| OneID / Login / OTP | Jira IDY-* (NOT ServiceNow) |
| Akamai / Edge / DNS / 502s | ops-global-parks-se-guestexp |
| Disney CAST L4 escalation | app-global-cerebro |
| AWS Infrastructure | ops-global-parks-se-guestexp |

## Impact Classification

- **Full outage:** ALL login and registration flows break across ALL brands (WDW, DLR, DCL). Guests cannot log in on any Disney web property. OneID Lightbox events not handled. PEPCOM session cookies not managed. Impact is SILENT until multiple guests report (no healthcheck on static bundle).
- **Degraded:** Trust State transitions fail → login loops. Aggressive retry policy causes cascading failures during OneID degradation.
