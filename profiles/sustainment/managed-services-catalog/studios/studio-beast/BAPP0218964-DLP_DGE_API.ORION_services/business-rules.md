# Business Rules — DLP DGE API.ORION services

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Critical (revenue-generating, guest-facing) | Healthcheck Manager |
| Response time (p95) | Monitored via AppDynamics | PROD_DLP_ORION_BAPP0218964 |
| Error rate | Monitored via Splunk | PEA V2 Errors Dashboard |

## Peak Periods

- Park operating hours (in-park only purchases)
- Morning rush (guests planning their day)
- High-attendance days (weekends, holidays, events)

## Pre-conditions

- Guest must have a valid Park Ticket, Annual Pass, Disneyland Pass, Pass en Scène, or Hotel+Tickets package
- Entitlement must be for the visit date
- Ticket must be marked as "In Park" (guest is physically in the park)

## Business Rules

- Valid for one ride, one time per attraction
- Not transferable — linked to specific park ticket and guest
- Limited availability per time slot (can sell out on busy days)
- Max 3 DPA One per attraction per guest per day
- Max 12 for same attraction/time slot in one transaction (groups)
- Valid only on the day of purchase
- **Cannot be cancelled once purchased**
- Booking must be done in-park (not available off-site like DPA Ultimate)
- 17 attractions available in production (FY 2025)
- Guests without smartphone can purchase at City Hall (DLP) or Studios Services (WDS)

## Dependencies

### Internal (Beast)
- **BIO Wait Times** — attraction wait time data
- **BIO Attractions Downtime** — attraction availability status
- **TMS Tickets Linking** — ticket validation

### External
- **Core API Order Service** (app-frdlp-coreapi) — order creation
- **Core API Payment Reference Service** (app-frdlp-coreapi) — payment references
- **Experience Access** (app-frdlp-experienceaccess) — pass management
- **Worldpay** — payment processing
- **Surqual** — product catalog
- **Redis (ElastiCache)** — PEA pass caching

## Impact Classification

- **PEA Provider down:** Guests cannot buy DPA — major revenue and experience impact
- **PSP Payment down:** Guests cannot complete DPA purchases
- **Itinerary down:** Guests cannot view their DPA passes
- **Push Notification down:** No timeslot expiry or autorecovery alerts
