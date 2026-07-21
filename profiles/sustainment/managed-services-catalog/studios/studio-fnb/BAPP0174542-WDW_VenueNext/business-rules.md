# Business Rules — WDW VenueNext

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% (vendor SLA) | VenueNext status page |
| Response time (p95) | Per vendor SLA | Splunk (MOO/ROO response times) |

## Peak Periods

- All WDW park operating hours, especially meal times
- Holiday seasons, special events

## Business Logic

- Third-party vendor platform (Shift4/Xpedite) — Disney does not own or deploy this code
- Powers mobile ordering POS: order submission, kitchen display, fulfillment
- Real-time order updates delivered via Pusher websocket
- Issues must be emailed to help@venuenext.com with: site, env, API, time range, sample requests, response codes, order UUID, impact scope

## Dependencies

- Pusher (websocket for real-time updates): https://status.pusher.com/
- VenueNext infrastructure (managed by vendor)

## Impact Classification

- **Full outage:** No mobile orders can be submitted to POS at WDW. Critical revenue and guest experience impact.
- **Degraded:** Slow order processing, delayed kitchen display, order status updates not reaching guests.
