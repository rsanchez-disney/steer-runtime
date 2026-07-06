# Business Rules — DLR Mobile Application (Profile)

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in Confluence Cloud | Not documented in Confluence Cloud |
| Response time (p95) | Not documented in Confluence Cloud | Not documented in Confluence Cloud |
| Error rate | Not documented in Confluence Cloud | Not documented in Confluence Cloud |

## Peak Periods

- Park opening hours (7am-12am PT for DLR)
- Holiday seasons (Thanksgiving, Christmas, Spring Break)
- New ticket/reservation release events
- Park WiFi congestion periods (high NetworkFailure rates)

## Business Logic

- Login and registration flows via OneID integration
- Profile viewing and editing (name, avatar, preferences)
- Native module within the Disneyland app
- Shared BAPP ID between iOS (Swift) and Android (Kotlin) platforms

## Dependencies

- OneID — Authentication (login/registration callbacks)
- Profile backend services — Profile data CRUD operations
- Parks WiFi infrastructure — Network connectivity in parks

## Impact Classification

- **Full outage:** Cannot view/edit profile in DLR app. Login/Registration flows broken. OneID integration failures.
- **Degraded:** Intermittent NetworkFailure errors (usually parks WiFi, not a code issue). Slow profile loading.
