# Business Rules — WDW Mobile Application (Profile)

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in MyWiki | Not documented in MyWiki |
| Response time (p95) | Not documented in MyWiki | Not documented in MyWiki |
| Error rate | Not documented in MyWiki | Not documented in MyWiki |

## Peak Periods

- Park opening hours (7am-11pm ET for WDW)
- Holiday seasons (Thanksgiving, Christmas, Spring Break)
- New ticket/reservation release events
- Park WiFi congestion periods (high NetworkFailure rates)

## Business Logic

- Login and registration flows via OneID integration
- Profile viewing and editing (name, avatar, preferences)
- Push notification preferences management (via MNO service)
- Family & Friends list management
- Native module within the My Disney Experience app
- Shared BAPP ID between iOS (Swift) and Android (Kotlin) platforms

## Dependencies

- OneID — Authentication (login/registration callbacks)
- MNO Service (BAPP0229223) — Push notification opt-in management
- Profile backend services — Profile data CRUD operations
- Parks WiFi infrastructure — Network connectivity in parks

## Impact Classification

- **Full outage:** Cannot view/edit profile in WDW app. Login/Registration flows broken. OneID integration failures. Push notification preferences unavailable.
- **Degraded:** Intermittent NetworkFailure errors (usually parks WiFi, not a code issue). Slow profile loading.
