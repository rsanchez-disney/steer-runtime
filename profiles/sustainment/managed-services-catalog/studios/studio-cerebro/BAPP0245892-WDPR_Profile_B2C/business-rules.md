# Business Rules — WDPR Profile B2C

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in MyWiki | |
| Response time (p95) | Not documented in MyWiki | |
| Error rate | Not documented in MyWiki | |

## Peak Periods

- Not documented in MyWiki. Expected high traffic during park hours, ticket booking windows, and marketing campaigns.

## Business Logic

- All endpoints require GUEST tokens only (B2C channel)
- Handles: affiliations, avatar selection, catalog favorites, communication preferences, get/set profile
- Profile get/set operations route to OneID GuestController
- Replacement for legacy BAPP0054836
- Revenue-critical — System of Record for guest profile data
- External accessibility (available via Akamai: profile-svcs.wdprapps.disney.com)

## Dependencies

- OneID GuestController — profile get/set operations, authentication
- Preference Service (BAPP0170520) — communication preferences
- GAM — guest account management
- Akamai CDN/WAF — external access gateway

## Impact Classification

- **Full outage:** Cannot view or update profile information. Cannot manage account settings, affiliations, avatar, favorites. Affects ALL WDW/DLR/DCL web and mobile apps. Revenue-critical.
- **Degraded:** Partial profile operations may fail. Specific features (avatar, affiliations, preferences) may be unavailable while core profile get/set still works.
