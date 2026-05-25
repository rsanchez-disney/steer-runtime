# Business Rules — Commerce Cart

## Overview

Cart management service for EC checkout path.

## Key Rules

- Validates item availability before allowing checkout
- Supports multiple product types (tickets, passes, packages, lodging)
- Cart expiry is session-based


---

## Related Flows

### Flow: EC Checkout (Enterprise Commerce)

> Trade tickets, AP new sales/renewals, Photopass, Ticket-to-pass upgrades, VO/Packages DTA, Room Only DTA, WDW consumer mods, Aulani.

#### Path

```
Cart → Commerce UI → Booking Service → Payment Service → DTI Gateway → eGalaxy
```

#### Services Involved

| Step | Service | Action |
|------|---------|--------|
| 1 | commerce-ui | Guest browses cart, proceeds to checkout |
| 2 | commerce-cart | Cart management, item validation |
| 3 | booking-service | Checkout orchestration, order submission |
| 4 | payment-service | Payment processing |
| 5 | dti-gateway | Ticket fulfillment |
| 6 | egalaxy-dlr | DLR ticket creation/activation |
| 7 | notification-dlr / notification-wdw | Confirmation email |

#### Investigation Order

1. Pre-Investigation — Check if Order Already Booked (MANDATORY)
2. Booking Service Investigation — extract ConvoIDs, check OrderAnalyticsLogger
3. Downstream Investigation (MANDATORY for FAILED orders) — extract payloadId → DTI → eGalaxy
4. Commerce Cart & UI (Rule 36 — "Duck Out" / Resort Package Errors)

#### Cart-Specific Patterns (Step 4)

| Pattern | Root Cause | Resolution |
|---------|-----------|------------|
| Repeated rental car validation 500 | Availability Service failing | Guest remove rental car and retry |
| `PCI_COMMERCE_UI_ERROR` on proceed-to-checkout | Backend service error | Investigate which service failed |
| Guest reached checkout-booking but no order | Payment decline or timeout | Extract paymentSessionId → `app-flwdw-payment` |
| "Duck Out" with zero backend logs | Front-end session/timeout | Clear cache/cookies, try different browser |
| "Duck Out" WITH commerce cart/UI errors | Backend root cause | Investigate specific service errors |

**IMPORTANT:** "Duck Out" is NOT always client-side. Always check commerce_cart and commerce_ui before concluding front-end only. Ref: INC28874535
