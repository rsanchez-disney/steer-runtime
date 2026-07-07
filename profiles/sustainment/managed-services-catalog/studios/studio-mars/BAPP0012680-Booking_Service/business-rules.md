# Business Rules — Booking Service

## Overview
EC checkout orchestrator. Handles trade tickets, AP new sales/renewals, Photopass, ticket-to-pass upgrades, VO/Packages DTA, Room Only DTA, WDW consumer mods, Aulani.

## Key Rules

- **Gift Orders:** `isGift=true` + `orderStatus=PENDED` → expected behavior (gift fulfillment pending). Do NOT escalate. Gift orders with `FAILED` status should still be investigated.
- **Disney Rewards / Visa Redemption Card:** Transient error during rewards card entry. Guest-specific, often succeeds after retry. Check if order eventually completed (BOOKED). Not systemic unless multiple unrelated guests report same error. Ref: INC28785819.
- **Error 828 (Credit Card Denied):** GENERIC wrapper. Do NOT assume card issuer decline. ALWAYS complete DTI Gateway step to get actual eGalaxy response. Real cause is in eGalaxy ErrorCode + ErrorText fields. Ref: INC28977070.

## Key Fields

| Field | Purpose |
|-------|---------|
| ConvoId / conversationId | Correlation ID across the checkout flow |
| OrderId | Unique order identifier |
| payloadId | Used to trace into DTI Gateway and eGalaxy |
| OrderAnalyticsLogger status | BOOKED / FAILED / PENDED |
| Confirmation Number | Guest-facing confirmation |
| CCLastFourDigits | Payment card last 4 |
| product-name / product-id | What was purchased |
| PageId | URL path — identifies which checkout step (e.g. `/passes/renew/proceed-to-checkout/`) |

## OrderAnalyticsLogger Format

```
Order submitted: {ORDER_ID},{site},NEW,BOOKED,{##},{total},{monthly_payment},{productType},Payments[{method}],...
```

- `NEW` = new order, `MODIFICATION` = mod
- `BOOKED` / `FAILED` / `PENDED` = order status
- `{total},{monthly_payment}` = e.g. `4847.00,297.00` means $4,847 total, $297/month installment
- For AP/MK monthly plans: monthly_payment is the recurring charge, NOT tax
- **FAILED orders include:** error code, payloadID, and card type in one line — fastest way to get all identifiers

## Diagnostic Patterns

| Pattern | Meaning |
|---------|---------|
| OrderAnalyticsLogger BOOKED | Order completed successfully — likely guest didn't see confirmation |
| OrderAnalyticsLogger FAILED + Error 828 | GENERIC wrapper — must check DTI for real cause |
| OrderAnalyticsLogger PENDED + `isGift=true` | Expected — gift fulfillment pending. Do NOT escalate |
| OrderAnalyticsLogger PENDED (not gift) | Investigate — may be stuck in fulfillment |
| No OrderAnalyticsLogger entry | Order never reached submission — check Commerce UI for earlier errors |

## Dependencies

| Direction | Service | Relationship |
|-----------|---------|-------------|
| Upstream | commerce-ui | Cart page initiates checkout |
| Downstream | dti-gateway | Fulfillment — ticket creation |
| Downstream | payment-service | Payment processing |
| Downstream | egalaxy-dlr | DLR ticket fulfillment via DTI |
| Downstream | notification-dlr / notification-wdw | Confirmation emails |

## Related Flows
- EC Checkout
- MK Renewal


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

**Step 1: Pre-Investigation — Check if Order Already Booked (MANDATORY)**

Before deep-diving into errors, check if the guest already completed the purchase.

1. Search booking-service by email/SWID → extract ConvoIDs and order IDs
2. Search OrderAnalyticsLogger by ConvoID or order ID
3. If `BOOKED` → recommend INC closure with order details
4. If no BOOKED order → continue

**Step 2: Booking Service Investigation**

1. Search booking-service by SWID → extract ConvoIDs
2. Search OrderAnalyticsLogger by ConvoId → determine order status (BOOKED/FAILED/PENDED)
3. If FAILED → proceed to Step 3

**Step 3: Downstream Investigation (MANDATORY for FAILED orders)**

1. Extract `payloadId` from Booking Service logs
2. Search dti-gateway by payloadId
3. Search egalaxy-dlr by payloadId for errors

**Routing based on failure:**
- Payment gateway failure → `app-flwdw-payment`
- Fulfillment failure → `app-flwdw-dticrt` or `app-cadlr-galaxy`

**Step 4: Commerce Cart & UI (Rule 36 — "Duck Out" / Resort Package Errors)**

**Trigger:** Steps 1-3 return zero results for WDW resort package / lodging issue, OR INC mentions "Duck Out" error.

1. Search commerce-cart by SWID — Look for `DefaultAvailabilityDAO` ERROR + rental car availability 500 / error code `010028`
2. Search commerce-ui by SWID + "checkout" — `PCI_COMMERCE_UI_ERROR` on `/cart/proceed-to-checkout/`
3. If payment decline suspected → extract `paymentSessionId` → route to `app-flwdw-payment`

#### Special Cases

- **Disney Rewards / Visa Redemption Card Issues:** Transient error during rewards card entry. Check if order eventually completed. Ref: INC28785819
- **Gift Orders:** `isGift=true` + `orderStatus=PENDED` → expected behavior. Do NOT escalate.
- **Error 828 (Credit Card Denied):** GENERIC wrapper. ALWAYS complete DTI Gateway step. Real cause is in eGalaxy ErrorCode + ErrorText fields. Ref: INC28977070

---

### Flow: Magic Key Renewal (DLR)

> Guest renews their Magic Key pass online through the booking service.

#### Path

```
Commerce UI (Presales) → COM Shared API → Booking Service → DTI → eGalaxy
```

#### Services Involved

| Step | Service | Action |
|------|---------|--------|
| 1 | booking-service | Renewal checkout (PageId: `/passes/renew/proceed-to-checkout/`) |
| 2 | com-shared-api-dlr | Presales product selection |
| 3 | dti-gateway | Fulfillment |
| 4 | egalaxy-dlr | Pass renewal in source of record |
| 5 | tms-dlr | Ticket data update + Keyring publish |

#### Investigation Order

1. **Booking Service FIRST** — search by SWID/VIDs
2. **Commerce UI SECOND** (if 0 results)
3. **COM Shared API THIRD** (if still 0)
4. **eGalaxy MANDATORY** — Verify Renewable flag. If eGalaxy=NO but affiliation=true → PLU config issue → `app-cadlr-galaxy`
5. **TMS DLR MANDATORY** — Check `renewable`, `modifiable`, `skipRenewal` flags

#### Business Rules

- **VID Persistence:** VID does NOT change on renewal. Same VID, new SKU.
- **MK Renewed:** ACS returns current + next pass.
- **MK Renewal PLUs:** Managed in CME Admin.
- **MK Upgrade (not renewal):** Previous MK remains available until expiration.
- **SoCal MK Zip Validation:** For SoCal Magic Key eligibility, verify in eGalaxy `QueryTicketResponse` that the VID has a zip code in range 90000–93599. If zip is outside this range → guest is not eligible for SoCal MK renewal.

#### Troubleshooting Scenarios

- **Profile Linking Lost After Online Renewal:** SWID was present in booking flow but `primaryGuestLinked=false` in TMS → eGalaxy linking failure. Route to `app-cadlr-galaxy`. Ref: INC28969668
- **Known eGalaxy Expiration Date Issue:** After renewal, `ValidatedExpirationDate` NOT updated → TMS reads pass as EXPIRED. Fix: `app-cadlr-galaxy`. Ref: INC28784254
- **Duplicate Pass in Memberships & Passes:** After renewal, guest sees 3 MKs instead of 2. Expected behavior — original entry disappears after expiration. Ref: INC28873626
