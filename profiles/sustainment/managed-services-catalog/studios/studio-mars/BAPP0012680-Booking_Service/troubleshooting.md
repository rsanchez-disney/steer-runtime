# Troubleshooting — Booking Service

## Pre-Investigation: Check if Order Already Booked (MANDATORY)

Before deep-diving into EC checkout errors:
1. Search Booking Service by email/SWID → extract ConvoIDs and order IDs
2. Search OrderAnalyticsLogger by ConvoID or order ID
3. If `BOOKED` → recommend INC closure with order details (confirmation #, products, payment, total)
4. If no BOOKED order → continue full investigation

## Common Issues

### Issue: OrderAnalyticsLogger FAILED + Error 828/832

**Symptoms:** Order shows FAILED status with generic credit card error.

**Root Cause:** Error 828 (Credit Card Denied) and 832 (Payment not approved) are GENERIC wrappers. Real cause is in DTI Gateway provider response.

**Resolution:**
1. Extract `payloadId` from OrderAnalyticsLogger FAILED line
2. Search DTI Gateway: `index=wdpr_dtigw_svc "{PAYLOAD_ID}" "Received response from DLR provider system"`
3. Real decline reason is in eGalaxy ErrorCode + ErrorText fields
4. NEVER close based on 828/832 alone

Ref: INC28977070

---

### Issue: OrderAnalyticsLogger PENDED + `isGift=true`

**Symptoms:** Order stuck in PENDED status, gift order.

**Root Cause:** Expected — gift fulfillment pending.

**Resolution:** Do NOT escalate. Gift orders with PENDED status are WAD.

---

### Issue: No OrderAnalyticsLogger entry

**Symptoms:** No order submission log found for guest.

**Root Cause:** Order never reached submission step.

**Resolution:** Check Commerce UI for earlier errors in the checkout flow.

---

### Issue: Disney Rewards / Visa Redemption Card transient error

**Symptoms:** Guest-specific error during rewards card entry.

**Root Cause:** Transient error, often succeeds after retry.

**Resolution:** Check if order eventually completed (BOOKED). Not systemic unless multiple unrelated guests report same error. Ref: INC28785819.

---

## FAILED Order — Downstream Investigation (MANDATORY)

When OrderAnalyticsLogger shows FAILED:

1. Booking Service → search by SWID/VID/OrderID → extract `payloadId`
2. DTI Gateway (MANDATORY): `index=wdpr_dti* "{PAYLOAD_ID}" "Received response from DLR provider system"`
3. eGalaxy (MANDATORY): `index=wdpr_egalaxy_dlr "{PAYLOAD_ID}" "*error*" OR "fault" OR "reject" OR "fail"`

**Routing:**
- Payment gateway failure → payment-service / `app-flwdw-payment`
- Fulfillment failure → `app-flwdw-dticrt` or `app-cadlr-galaxy`

## Accertify Post Reservation Log

After payment failure, check `[DefaultPaymentDAO] Getting Accertify Post Reservation`:
- `adaptivePayment: false` → payment went through DTI (not Adaptive Payment)
- `adaptivePayment: true` → payment went through Adaptive Payment session manager
- This determines the investigation path (DTI vs DPay)

## Key Fields

| Field | Purpose |
|-------|---------|
| ConvoId / conversationId | Correlation ID across checkout flow |
| OrderId | Unique order identifier |
| payloadId | Trace into DTI Gateway and eGalaxy |
| OrderAnalyticsLogger status | BOOKED / FAILED / PENDED |
| Confirmation Number | Guest-facing confirmation |
| PageId | URL path — identifies checkout step |

## Query Templates

### By SWID
```spl
search index=wdpr_booking_service "{SWID}" earliest=-7d
```

### By SWID (90 days — for renewals)
```spl
search index=wdpr_booking_service "{SWID}" earliest=-90d | head 30 | table _time, _raw
```

### eGalaxy SoCal MK Zip Validation (for renewal eligibility)
```spl
search index=wdpr_egalaxy_dlr "QueryTicketResponse" "{VID}" earliest=-7d | search "ZipCode"
```
> For SoCal MK eligibility, verify the zip code in `QueryTicketResponse` is in range **90000???93599**. If outside this range ??? guest is not eligible for SoCal MK renewal. Route to `app-cadlr-galaxy`.

### OrderAnalyticsLogger by ConvoId
```spl
search index=wdpr_booking_service "{CONVO_ID}" OrderAnalyticsLogger earliest=-7d
```

### OrderAnalyticsLogger by OrderId
```spl
search index=wdpr_booking_service "{ORDER_ID}" OrderAnalyticsLogger earliest=-7d
```

### Errors by ConvoId
```spl
search index=wdpr_booking_service "{CONVO_ID}" "*error*" earliest=-7d
```

### By OrderId
```spl
search index=wdpr_booking_service "{ORDER_ID}" earliest=-7d | head 20
```

### Upgrade by VIDs
```spl
search index=wdpr_booking_service ("{VID1}" OR "{VID2}") earliest=-14d | table _time, _raw | sort -_time | head 10
```

## OrderAnalyticsLogger Format

```
Order submitted: {ORDER_ID},{site},NEW,BOOKED,{##},{total},{monthly_payment},{productType},Payments[{method}],...
```

- `NEW` = new order, `MODIFICATION` = mod
- `BOOKED` / `FAILED` / `PENDED` = order status
- `{total},{monthly_payment}` = e.g. `4847.00,297.00` means $4,847 total, $297/month installment
- For AP/MK monthly plans: monthly_payment is the recurring charge, NOT tax
- FAILED orders include: error code, payloadID, and card type in one line


---

## External Dependencies — Quick Reference

### Payment Service
| Field | Value |
|-------|-------|
| AG | `app-flwdw-payment` |
| CI | Adaptive Payment Platform |
| Index | `wdpr_payment` |
| Health | https://paymentsvc-nap7.wdpro.starwave.com/payment-service/admin/health-report |
| AppD | app_id=932 |

**Key Query:**
```spl
search index=wdpr_payment "{SWID}" earliest=-7d | head 20
```

### DTI Gateway
| Field | Value |
|-------|-------|
| AG | `app-flwdw-dticrt` |
| CI | Disney Ticketing Interface (DTI) Gateway |
| Index | `wdpr_dtigw_svc`, `wdpr_dti*` |

**Key Queries:**
```spl
search index=wdpr_dtigw_svc "{PAYLOAD_ID}" earliest=-7d | head 50
```
```spl
search index=wdpr_dti* "{PAYLOAD_ID}" "Received response from DLR provider system" earliest=-7d | head 10
```

**Common DLR Provider Error Codes:**
| ErrorCode | Result | Meaning |
|-----------|--------|---------|
| 128/106 | AVS Mismatch | Billing address doesn't match card issuer |
| 128/100 | Declined | Generic card issuer decline |
| 128/114 | CVV Mismatch | CVV2 code incorrect |
| 128/200 | Do Not Honor | Card issuer refuses |
| 128/201 | Expired Card | Card is expired |

### eGalaxy DLR
| Field | Value |
|-------|-------|
| AG | `app-cadlr-galaxy` |
| CI | DLR Ticketing Galaxy (Gateway) |
| Index | `wdpr_egalaxy_dlr` |
| POC | Claudia Gonzalez |

**Key Queries:**
```spl
search index=wdpr_egalaxy_dlr "{VID}" earliest=-7d | sort -_time | head 100
```
```spl
search index=wdpr_egalaxy_dlr "{PAYLOAD_ID}" earliest=-7d | search "error" OR "fault" OR "reject" OR "fail" | head 50
```

**Status Codes:** 0=Active, 4=Exchanged, 5=Voided, 8=Blocked

---

## Routing

**Assignment Group:** `web-global-salescart`  
**s

### Quick Route-Away Patterns

| Keywords | Action | AG | CI |
|----------|--------|-----|-----|
| "unable to download photos", "download photopass", "download photos from the app" | Out of ticketing scope — route immediately | app-flwdw-dpi | DPI Magento e-Commerce Platform - DLR |
| "AIM Utility" + resort keywords | See auto-triage Rule 29 | ops-global-resortops | — |
| Old/discontinued product showing in purchase flow | Lexicon config issue | prd-global-DPRD Production | — |

### Key Escalation Groups

| Team | AG | When to escalate |
|------|-----|-----------------|
| DPay/Wallet | app-flwdw-payment | Payment failures |
| DTI | app-flwdw-dticrt | Specify PayloadId |
| eGalaxy DLR | app-cadlr-galaxy | If failing: TMS DLR, CME DLR, DTI, Pended Orders |
| Package Order | app-global-l3defenders | Booking Service (VO, Room Only) |
| Accertify | app-fltwdc-dpep accertify | Fraud decisioning |
