# Business Rules — WDPR Profile B2C

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in Confluence Cloud | |
| Response time (p95) | Not documented in Confluence Cloud | |
| Error rate | Not documented in Confluence Cloud | |

## Peak Periods

- Not documented in Confluence Cloud. Expected high traffic during park hours, ticket booking windows, and marketing campaigns.

## Business Logic

- All endpoints require GUEST tokens only (B2C channel)
- Handles: affiliations, avatar selection, catalog favorites, communication preferences, get/set profile
- Profile get/set operations route to OneID GuestController
- Replacement for legacy BAPP0054836
- Revenue-critical — System of Record for guest profile data
- External accessibility (available via Akamai: profile-svcs.wdprapps.disney.com)

## Dependencies

- OneID GuestController — Profile get/set operations, authentication. Escalation: Jira IDY-* at support.twdc.technology. Slack: #identity-help
- Preference Service (BAPP0170520) — Communication preferences. Tech Lead: andrew.southwick@disney.com
- GAM — Guest account management. Escalation: Enterprise Technology
- Akamai CDN/WAF — External access gateway. PROD: profile-svcs.wdprapps.disney.com. Escalation: ops-global-parks-se-guestexp
- ElastiCache (Redis) — Profile data cache. Impact if down: performance degradation

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
| ECS Fargate | Hosting B2C service (both regions) | All guest profile operations fail | CloudWatch: Task Count, CPU, Memory |
| ElastiCache (Redis) | Profile data cache | Performance degradation, higher OneID load | CloudWatch: CacheHitRate, Evictions |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**Alert Thresholds:** CPU >30%, Memory >50%
**Alert Channel:** [DX Profile] Prod Alerts

## Internal Consumers (Who Calls B2C)

| Consumer | What They Consume | Impact if B2C Fails |
|----------|-------------------|---------------------|
| Profile SPA (BAPP0180489) | Guest data, affiliations, avatar | Profile page broken across all brands |
| MB+C SPA (BAPP0180565) | Guest profile for band management | Cannot retrieve guest info |
| FnF SPA (BAPP0247007) | FnF list, invites | Cannot manage friends |
| Profile VAS (BAPP0242566) | Guest profile data for assembly | VAS returns incomplete data |
| WDW/DLR Mobile Apps | Profile APIs (login, FnF, avatars) | Profile features in app broken |
| Shield Team (Digital Itinerary) | Profile APIs | Itinerary features broken |
| Commerce / Ticketing | Affiliations | Cannot validate AP/MEP for purchases |
| Dining / Mobile Order | Guest data | Cannot retrieve guest info for reservations |

## Impact Classification

- **Full outage:** Cannot view or update profile information. Cannot manage account settings, affiliations, avatar, favorites. Affects ALL WDW/DLR/DCL web and mobile apps. Revenue-critical.
- **Degraded:** Partial profile operations may fail. Specific features (avatar, affiliations, preferences) may be unavailable while core profile get/set still works.
