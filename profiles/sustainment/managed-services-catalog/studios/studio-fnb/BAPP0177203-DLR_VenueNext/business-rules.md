# Business Rules — DLR VenueNext

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% (vendor SLA) | VenueNext status page |
| Response time (p95) | Per vendor SLA | Splunk (MOO/ROO response times) |

## Peak Periods

- All DLR park operating hours, especially meal times
- Weekends, holidays, Oogie Boogie Bash

## Business Logic

- Third-party vendor platform (Shift4/Xpedite) — Disney does not own or deploy this code
- Powers mobile ordering POS at DLR: order submission, kitchen display, fulfillment
- Real-time order updates via Pusher
- Issues emailed to help@venuenext.com

## Dependencies

- Pusher: https://status.pusher.com/
- VenueNext infrastructure (managed by vendor)

## Impact Classification

- **Full outage:** No mobile orders can be submitted to POS at DLR. Critical revenue and guest impact.
- **Degraded:** Slow order processing, delayed kitchen display.
