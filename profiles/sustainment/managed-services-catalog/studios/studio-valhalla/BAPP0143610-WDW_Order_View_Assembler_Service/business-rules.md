# Business Rules — WDW Order VAS

## Overview

UC order orchestration for consumer purchases at WDW. Sits between UC API and Order Service in the UC path.

## Key Rules

- Path: UC SPA → UC API → Order VAS → Order Service → PEOS
- Orchestrates order assembly and validation
- Generates order-level ConvoIDs for tracing
- Handles: consumer tickets, Genie+/LL, AP upgrades, schedule activities, VO/Packages consumer


---

## Related Flows

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

---

### Flow: Gift Card / Stored Value Card Payment

> Guest uses a gift card or stored value card during UC checkout.

#### Path

```
UC SPA → Order VAS → Payment Service (stored value card validation) → Order completion
```

#### Services Involved

| Step | Service | Role |
|------|---------|------|
| 1 | UC SPA | Guest enters gift card details |
| 2 | order-vas-dlr / order-vas-wdw | Order orchestration |
| 3 | payment-service | Gift card balance validation |

#### Investigation

Follow UC Checkout investigation first, then additionally search for `STORED_VALUE_CARD` or `balanceError` or `gift` in UC SPA logs by ConvoID.

Look for `STORED_VALUE_CARD_APPLIED` with `success: false`.

#### Routing

Route to: `app-flwdw-payment`  
POC: Slack #adaptive-payment-help
