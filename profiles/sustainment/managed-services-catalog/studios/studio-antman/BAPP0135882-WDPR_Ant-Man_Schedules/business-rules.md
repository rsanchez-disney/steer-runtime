# Business Rules — WDPR Ant-Man Schedules (Kronos)

## Service Purpose

D-Scribe Schedules (Kronos) generates and manages schedule XML and meal period XML files for park entities. It publishes this data to S3 buckets for downstream consumption by guest-facing applications.

---

## Entity Types Handled

Kronos generates schedule data for the following entity types:
- Facilities
- Attractions
- Entertainment
- Events
- MealPeriods
- MerchandiseFacilities
- FoodBeverageFacilities
- GolfCourses
- ActivityProducts
- Products
- Services
- Resorts (ToonFinder)

---

## Schedule Generation Flow

1. Kronos receives schedule data from upstream sources (OpSheets, manual updates, force update triggers)
2. Generates XML files (schedule XML + meal period XML) for each entity
3. Publishes XML to S3 bucket (`d-scribe-content-live` for prod)
4. Downstream services (Collector, Longshot) serve this data to consumers

---

## Dependencies

| Direction | Service | BAPP | Relationship |
|-----------|---------|------|-------------|
| Downstream | Collector | BAPP0159223 | Reads schedule data from S3 |
| Downstream | Longshot | BAPP0089428 | Serves schedule content to consumers |
| Downstream | Watcher | BAPP0142680 | Monitors schedule content state |
| Infrastructure | S3 | — | Schedule XML storage |

---

## Key Operations

- **Force Update:** Triggers re-generation of schedule data for specific entities. Primary self-service recovery tool.
- **Batch Jobs:** Bulk schedule generation for multiple entities at once.
- **Naughty List:** Entities with known data issues that consistently fail generation.
- **Pricing View:** Special schedule view for pricing-related data.

---

## Impact Classification

- **Full outage:** Schedule generation stops — park hours, attraction schedules, meal periods not updated for guests
- **Degraded:** Some entity types failing while others succeed — partial schedule staleness
- **Single entity failure:** One facility/attraction schedule not updating — use force update to recover

---

## Key Business Constraints

- Schedule data must be current for guest-facing applications (park hours, show times, dining availability)
- XML format must be valid for downstream parsers
- Force update is the primary recovery mechanism — should be attempted before escalation
- Naughty list entities require source data correction, not service-level fixes
