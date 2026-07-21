# Business Rules — WDW Dine Plan Middleware

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Aligned with MOO SLA |
| Response time (p95) | < 1s | Splunk |
| Error rate | < 1% | Splunk |

## Peak Periods

- Aligned with MOO peak periods (meal times, holidays)
- Higher usage when Disney Dining Plan promotions are active

## Business Logic

- Validates Disney Dining Plan (DDP) entitlement redemptions for mobile ordering
- Called by MOO when guests use dining plan credits to pay
- Integrates with Reservation Entitlement service for coupon charge processing
- Assignment group: web-global-ddp-eas (separate from prd-global-fnb for some escalations)

## Dependencies

- MOO (caller)
- Reservation Entitlement service
- Disney Dining Plan system

## Impact Classification

- **Full outage:** Guests with Disney Dining Plan cannot use credits for mobile orders. Must use physical POS for DDP redemption.
- **Degraded:** Slow validation, timeouts. MOO may fall back to non-DDP payment methods.
