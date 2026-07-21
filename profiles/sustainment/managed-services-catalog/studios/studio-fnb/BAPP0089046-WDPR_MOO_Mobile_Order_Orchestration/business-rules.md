# Business Rules — WDPR MOO Mobile Order Orchestration

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | CloudWatch / AppDynamics |
| Response time (p95) | < 2s | AppDynamics |
| Error rate | < 1% | Splunk alerts |
| RTO | 24 hours | From disaster declaration |
| RPO | 0 hours | Cross-region data replication |

## Peak Periods

- WDW: Holidays (Thanksgiving, Christmas, Spring Break, Summer), special events, park opening hours
- DLR: Weekends, Oogie Boogie Bash, holidays, Summer, Grad Nite
- Lunch (11am-2pm) and Dinner (5pm-8pm) are highest volume windows

## Business Logic

- MOO orchestrates the full mobile ordering flow: menu availability → cart → payment → order submission to VenueNext → arrival window → fulfillment
- Orders route through VenueNext (Shift4/Xpedite) for POS integration
- Abandoned payment authorizations are refunded via MO Batch Service (BAPP0178865)
- Arrival windows are managed by a separate service (BAPP0199664/BAPP0090180)
- Redis cache used for session/cart data with configurable TTL
- Multi-region: WDW (us-east-1) and DLR (us-west-2) are independent deployments

## Dependencies

- VenueNext/Shift4 (third-party POS) — critical for order submission
- Arrival Windows Service — for pickup time slots
- Dining Menu Service (BAPP0089587) — for menu data
- Payment systems (DSP/POS team)
- Pusher (for real-time order status updates to guests)
- DynamoDB (order state), Redis (caching), Kinesis (events)

## Impact Classification

- **Full outage:** Guests cannot place mobile food orders at any WDW/DLR quick-service restaurant. Revenue loss; long physical queues form at locations.
- **Degraded:** Partial location availability, slow checkout, intermittent failures. Guests may retry or fall back to physical POS.
