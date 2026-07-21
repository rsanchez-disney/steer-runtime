# Business Rules — WDW Mobile Application Dine Fulfillment

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | New Relic |
| Crash-free rate | > 99.5% | New Relic |
| Error rate | < 1% | New Relic alerts |

## Peak Periods

- During all meal service hours at WDW restaurants with mobile ordering
- Holidays and special events have higher fulfillment volume

## Business Logic

- Native iOS tablet app used by cast members at Xpedite stations
- Displays incoming mobile orders for preparation and fulfillment
- Cast members mark orders as ready/picked-up
- Real-time updates via Pusher websocket connection
- Backend: MOO service (BAPP0089046)

## Dependencies

- MOO backend service
- VenueNext/Xpedite tablet infrastructure
- Pusher (real-time order updates)
- QSRA (QSR Automation status: https://status.qsr.cloud/)

## Impact Classification

- **Full outage:** Cast members cannot see/fulfill mobile orders on tablets at WDW. Orders pile up; guests wait indefinitely.
- **Degraded:** Delayed order display, stale status.
