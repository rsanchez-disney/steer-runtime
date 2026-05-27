# Business Rules — WDPRD WDWDLRDCL Web Application Profile

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in MyWiki | |
| Response time (p95) | Not documented in MyWiki | |
| Error rate | CPU > 30% or Memory > 50% triggers alert | CloudWatch / gac-profile-prod-alerts |

## Peak Periods

- Not documented in MyWiki

## Business Logic

- Primary guest-facing web application for profile management across WDW, DLR, and DCL brands
- Features: Profile view/edit, Affiliations, Terms & Conditions, MEP (Magic Express Pass), Login, Registration, Payment Methods, Florida Residency Validation
- Serves disneyworld.disney.go.com/profile/ and disneyland.disney.go.com/profile/
- Angular 18 SPA with Node.js 20 server-side rendering
- Active-active deployment across US-EAST-1 (WDW) and US-WEST-2 (DLR)
- Debug mode available: add /debug/dashboard to any environment URL, sign in with myId

## Dependencies

- AuthenticatorJS (BAPP0248309) — Login/Registration completely broken if down
- Profile B2C (BAPP0245892) — Cannot load guest data, affiliations, avatar if down
- Profile VAS (BAPP0242566) — Avatar loading fails (Duplicate Key issue) if down
- Profile WebAPI WAM (BAPP0253435) — Cannot reach backend services if down
- OneID (External) — All authentication fails if down
- Akamai CDN (External) — 502 errors, no traffic reaches origin if down
- GAM (External) — Guest keys, keyring unavailable if down
- Internal Libraries: Vault, Nimbus, RA Components, RA Logger, Analytics, CloudWatch, NavUI, Profile-shared

## Impact Classification

- **Full outage:** Guests cannot access profile page on web (all brands: WDW, DLR, DCL). Cannot view/edit personal information, preferences, family and friends. Cannot manage MagicBands, Disney Bands, and cards. Cannot access Florida Residency verification. Cannot renew Annual Passes. Login/Registration flows broken.
- **Degraded:** Partial page loading, specific features unavailable (e.g., avatar not loading due to VAS, payment methods errors), increased latency.
