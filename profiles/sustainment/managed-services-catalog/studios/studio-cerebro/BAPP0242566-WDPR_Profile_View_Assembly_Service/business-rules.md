# Business Rules — WDPR Profile View Assembly Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in Confluence Cloud | |
| Response time (p95) | Not documented in Confluence Cloud | |
| Error rate | Not documented in Confluence Cloud | |

## Peak Periods

- Not documented in Confluence Cloud. Expected high traffic during park hours and ticket/reservation booking windows.

## Business Logic

- Aggregates data from multiple backend sources into a unified profile view
- Sources: Profile data (registered guests), Avatar selection, XBMS (orders, linked bands), FnF (friends with plans), DCL Reservation Service (DCL page only), Facility Service
- Key response fields: friendsWithDataIntegrityFailureDetectedList, isFriendDataIntegrityFailureDetected, isWdwBrandRequest, ordersSuppressedInThePast, requestUrlMap, requestUrlMapWithout200ResponseCount, OrderDataComplete
- Orders in the past are suppressed from response (ordersSuppressedInThePast field)
- OrderDataComplete=True means guest saw the order successfully

## Dependencies

- Profile B2C (BAPP0245892) — Guest profile data. Tech Lead: andrew.southwick@disney.com
- XBMS — MagicBand/DisneyBand orders and linked bands. Escalation: XBMS Team
- GAM (FnF) — Friends with plans data. Escalation: GAM team
- DCL Reservation Service — DCL page reservations. Escalation: DCL Team
- Facility Service — Facility/location data
- Avatar Service — Avatar selection data
- ElastiCache (Redis) — Response caching (does NOT protect against Duplicate Key issue)
- Akamai CDN/WAF — Edge routing. Escalation: ops-global-parks-se-guestexp

## Akamai Gateway (via Profile Services)

| Environment | Hostname |
|-------------|----------|
| PROD | profile-svcs.wdprapps.disney.com |
| STAGE | stage.profile-svcs.wdprapps.disney.com |
| LOAD | load.profile-svcs.wdprapps.disney.com |
| LATEST | latest.profile-svcs.wdprapps.disney.com |

## AWS Infrastructure

| Service | Usage | Impact if Down | Monitoring |
|---------|-------|----------------|------------|
| ECS Fargate | Hosting VAS service (both regions) | All profile views fail, cascading to all SPAs | CloudWatch: Task Count, CPU, Memory |
| ElastiCache (Redis) | Response caching | Performance degradation, higher downstream load | CloudWatch: CacheHitRate, Evictions |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**Alert Thresholds:** CPU >30%, Memory >50%
**Alert Channel:** [DX Profile] Prod Alerts

## Internal Consumers (Who Calls VAS)

| Consumer | What They Consume | Impact if VAS Fails |
|----------|-------------------|---------------------|
| Profile SPA (BAPP0180489) | Avatar, profile assembled view | Profile page shows no avatar, partial data |
| MB+C SPA (BAPP0180565) | MB/DB orders, band data | ALL band data missing, MB+C completely broken |
| FnF SPA (BAPP0247007) | Friends with plans, avatars | Friend list incomplete |
| WDW/DLR Mobile Apps | Avatars (iOS uses VAS directly) | Avatar not loading in mobile |
| MagicBand / Build-a-Band | magic-bands endpoint | MB customization and ordering flow broken |

## Impact Classification

- **Full outage:** Avatar loading fails across all SPAs (Profile SPA, MB+C SPA, FnF SPA). MB/DB order data unavailable. Friend list data incomplete. Cascading 500 errors to all frontend applications.
- **Degraded:** Partial data returned — some sections of profile view may be empty or stale depending on which downstream service is failing.
