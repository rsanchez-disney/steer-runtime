# Business Rules — WDPRD Dining Menu Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | CloudWatch / AppDynamics |
| Response time (p95) | < 1s | AppDynamics |
| Error rate | < 1% | Splunk |

## Peak Periods

- Park opening hours (8am-10pm local), heaviest during meal times
- Menu updates typically pushed by operations in early morning before park open
- Holiday and event periods increase traffic significantly

## Business Logic

- Serves dining menu data (items, prices, meal periods, allergens) for WDW and DLR restaurants
- Consumed by mobile apps (Digital Menus feature) and web (Dining Menu UI)
- Menu data sourced from VenueNext/restaurant management systems
- Dual-region deployment: WDW (us-east-1) and DLR (us-west-2)
- Menus are cached; stale data is acceptable for short periods

## Dependencies

- VenueNext (menu source data)
- Mobile apps (consumers)
- Dining Menu UI SPA (consumer)
- CloudWatch logs for monitoring

## Impact Classification

- **Full outage:** Guests cannot view restaurant menus in app or on website. Does not block ordering but degrades discovery experience.
- **Degraded:** Stale menus displayed, missing allergen info, or slow loading. Minimal guest impact if cached data available.
