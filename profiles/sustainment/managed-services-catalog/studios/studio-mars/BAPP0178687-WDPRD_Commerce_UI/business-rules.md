# Business Rules — Commerce UI

## Overview

Commerce UI is the guest-facing frontend for the EC (Enterprise Commerce) checkout path. It renders cart, checkout, and confirmation pages.

## Key Rules

- Serves EC path only (not UC)
- Products: Trade tickets, AP new sales/renewals, Photopass, Ticket-to-pass upgrades, VO/Packages DTA, Room Only DTA
- Downstream: Booking Service handles orchestration after checkout submission


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

#### Special Cases

- **Error 828:** GENERIC wrapper. ALWAYS complete DTI Gateway step.
- **Gift Orders:** `isGift=true` + `PENDED` → expected. Do NOT escalate.
- **Disney Rewards Card:** Transient, often self-resolves.

---

### Flow: UC Checkout (Unified Commerce)

> Consumer ticket purchase/mods, schedule activities, Genie+/LL (DLR), AP MK-to-MK upgrades, AP upgrades WDW, VO/Packages consumer, Room Only consumer, Cast Life.

#### Path

```
UC SPA/API → Order VAS → Order Service → PEOS → DTI → eGalaxy/GAM
```

#### Services Involved

| Step | Service | Action |
|------|---------|--------|
| 1 | uc-spa-dlr / uc-spa-wdw | Guest-facing UI — generates ConvoIDs |
| 2 | order-vas-dlr / order-vas-wdw | Order orchestration (REQ_IN POST) |
| 3 | order-service | Order processing |
| 4 | peos | Payment + Entitlement Orchestration |
| 5 | payment-service | Payment capture/authorization |
| 6 | dti-gateway | Entitlement fulfillment |

#### Investigation (Sequential — ALL steps MANDATORY)

1. **Order VAS attempts by SWID** → extract ConvoIDs
2. **UC SPA errors for most recent ConvoIDs** — extract `paymentSessionId`, `paymentClientId`

#### Special Cases

- **MK-to-MK Tier Upgrade:** `orderType=UPGRADE` + `itemType=AP` in Order VAS. Creates new VID, old VID exchanged.
- **Gift Card / Stored Value Card Errors:** Look for `STORED_VALUE_CARD_APPLIED` with `success: false`. Route to `app-flwdw-payment`.
