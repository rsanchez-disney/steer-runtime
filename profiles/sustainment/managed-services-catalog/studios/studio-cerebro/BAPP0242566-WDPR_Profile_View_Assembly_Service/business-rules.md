# Business Rules — WDPR Profile View Assembly Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in MyWiki | |
| Response time (p95) | Not documented in MyWiki | |
| Error rate | Not documented in MyWiki | |

## Peak Periods

- Not documented in MyWiki. Expected high traffic during park hours and ticket/reservation booking windows.

## Business Logic

- Aggregates data from multiple backend sources into a unified profile view
- Sources: Profile data (registered guests), Avatar selection, XBMS (orders, linked bands), FnF (friends with plans), DCL Reservation Service (DCL page only), Facility Service
- Key response fields: friendsWithDataIntegrityFailureDetectedList, isFriendDataIntegrityFailureDetected, isWdwBrandRequest, ordersSuppressedInThePast, requestUrlMap, requestUrlMapWithout200ResponseCount, OrderDataComplete
- Orders in the past are suppressed from response (ordersSuppressedInThePast field)
- OrderDataComplete=True means guest saw the order successfully

## Dependencies

- Profile B2C (BAPP0245892) — guest profile data
- XBMS — MagicBand/DisneyBand orders and linked bands
- GAM (FnF) — friends with plans data
- DCL Reservation Service — DCL page reservations
- Facility Service — facility/location data
- Avatar Service — avatar selection data

## Impact Classification

- **Full outage:** Avatar loading fails across all SPAs (Profile SPA, MB+C SPA, FnF SPA). MB/DB order data unavailable. Friend list data incomplete. Cascading 500 errors to all frontend applications.
- **Degraded:** Partial data returned — some sections of profile view may be empty or stale depending on which downstream service is failing.
