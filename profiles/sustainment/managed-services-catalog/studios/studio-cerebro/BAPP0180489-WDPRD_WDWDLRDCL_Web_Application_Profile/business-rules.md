# Business Rules — WDPRD WDWDLRDCL Web Application Profile

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in Confluence Cloud | |
| Response time (p95) | Not documented in Confluence Cloud | |
| Error rate | CPU > 30% or Memory > 50% triggers alert | CloudWatch / gac-profile-prod-alerts |

## Peak Periods

- Not documented in Confluence Cloud

## Business Logic

- Primary guest-facing web application for profile management across WDW, DLR, and DCL brands
- Features: Profile view/edit, Affiliations, Terms & Conditions, MEP (Magic Express Pass), Login, Registration, Payment Methods, Florida Residency Validation
- Serves disneyworld.disney.go.com/profile/ and disneyland.disney.go.com/profile/
- Angular 18 SPA with Node.js 20 server-side rendering
- Active-active deployment across US-EAST-1 (WDW) and US-WEST-2 (DLR)
- Debug mode available: add /debug/dashboard to any environment URL, sign in with myId

## Dependencies

- AuthenticatorJS (BAPP0248309) — Login/Registration completely broken if down. Tech Lead: Cesar.A.Munoz.Acevedo.-ND@disney.com
- Profile B2C (BAPP0245892) — Cannot load guest data, affiliations, avatar if down. Tech Lead: andrew.southwick@disney.com
- Profile VAS (BAPP0242566) — Avatar loading fails (Duplicate Key issue) if down. Tech Lead: martin.x.uribe.-nd@disney.com
- Profile WebAPI WAM (BAPP0253435) — Cannot reach backend services if down. Tech Lead: andrew.southwick@disney.com
- Preference Service (BAPP0170520) — Guest preferences unavailable if down. Tech Lead: andrew.southwick@disney.com
- OneID (External) — All authentication fails if down. Escalation: Jira IDY-* at support.twdc.technology. Slack: #identity-help
- Akamai CDN (External) — 502 errors, no traffic reaches origin if down. Escalation: ops-global-parks-se-guestexp
- GAM (External) — Guest keys, keyring unavailable if down. Escalation: Enterprise Technology
- Internal Libraries: Vault, Nimbus, RA Components, RA Logger, Analytics, CloudWatch, NavUI, Profile-shared

## Akamai Gateway

| Environment | Hostname |
|-------------|----------|
| PROD | profile-svcs.wdprapps.disney.com |
| STAGE | stage.profile-svcs.wdprapps.disney.com |
| LOAD | load.profile-svcs.wdprapps.disney.com |
| LATEST | latest.profile-svcs.wdprapps.disney.com |

## AWS Infrastructure

| Service | Usage | Impact if Down | Monitoring |
|---------|-------|----------------|------------|
| ECS Fargate | Hosting Profile SPA | SPA completely down, all brands affected | CloudWatch: Task Count, CPU, Memory |
| S3 | Static assets, analytics files | 404 on analytics, static assets missing | S3 bucket metrics |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**Alert Thresholds:** CPU >30%, Memory >50%
**Alert Channel:** gac-profile-prod-alerts

## Internal Consumers (Who Uses Profile SPA)

| Consumer | URL | Impact if Profile SPA Fails |
|----------|-----|------------------------------|
| disneyworld.disney.go.com | /profile/ | Profile page unavailable, login/registration broken |
| disneyland.disney.go.com | /profile/ | Login/Registration broken |
| disneycruise.disney.go.com | /profile/ | Login/Registration broken |
| hongkongdisneyland.com | /profile/ | Login/Registration broken |

## Monitoring by Layer

| Layer | Key Metrics | Primary Tool |
|-------|-------------|--------------|
| Web (Angular) | Duck Out Error metrics, Frustration analysis, LCP metrics, HTTP 2XX/4XX/5XX | ContentSquare Dashboard |
| Business | Login and Re-authentication count | New Relic Parks Login/Reauth Dashboard |

## Impact Classification

- **Full outage:** Guests cannot access profile page on web (all brands: WDW, DLR, DCL). Cannot view/edit personal information, preferences, family and friends. Cannot manage MagicBands, Disney Bands, and cards. Cannot access Florida Residency verification. Cannot renew Annual Passes. Login/Registration flows broken.
- **Degraded:** Partial page loading, specific features unavailable (e.g., avatar not loading due to VAS, payment methods errors), increased latency.
