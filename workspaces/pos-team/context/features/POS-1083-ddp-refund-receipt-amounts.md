# POS-1083: DDP Receipt - Fix amounts on DDP refund template

## Quick Reference

| Field | Value |
|-------|-------|
| Ticket | POS-1083 |
| Feature | Hide DDP-covered item prices and show only monetary amounts on guest copy refund receipts |
| Module | `gc/AppetizeActivate` (receipts) |
| Entry Point | `VoucherReceiptConverter` → `UniversalVoucherReceiptStepsBuilder` |
| Key Feature Flag | `IsReceiptDecisionsEnabled` (new decisions pipeline) |
| Scope | Receipt rendering only — no refund logic or payment flow changes |

---

## 1. Feature Overview

When a guest receives a DDP refund receipt (guest copy), the prices of items covered by the dining plan must NOT appear, since no dollar-based tender was applied. The total, total paid, and refund amounts on the guest copy should reflect ONLY the monetary tender amounts (cash, credit card, Guest ID).

### Business Rules Summary

1. **Guest Copy**: Never shows the dollar value of DDP-covered items
2. **Guest Copy Totals**: Total/TotalPaid/Refund reflect only monetary tender amounts (excludes DDP)
3. **Merchant/Store Copy**: Shows ALL item prices and full totals (including DDP values)
4. **DDP Tender Lines**: Displayed as `$0.00` on guest copy (shows plan name only)
5. **Non-Plan Items**: Always display their prices on both copies
6. **Guest ID**: Treated as a monetary tender — its amounts ARE included in guest copy totals
7. **Gratuity Split**: If gratuity is partially covered by DDP, only the non-DDP portion shows on guest copy

### Acceptance Criteria

**AC1: Refund Receipt hides prices for items covered by dining plan**
- Given a guest has a dining plan and items covered by the plan have been added to the ticket
- When the refund ticket is generated
- Then the refund ticket does NOT display prices for items included in the dining plan
- And the refund ticket displays prices ONLY for items outside the dining plan

**AC2: Display only monetary tender amounts in totals**
- Given a guest has a dining plan and a payment is made using a monetary tender (cash, CC, Room Charge, etc.)
- When the refund ticket is generated
- Then "Total," "Total Paid," and "Refund" sections display ONLY monetary tender amounts
- And no values are shown for items covered by the dining plan

### Scope

**In scope**: Receipt rendering logic only (hiding DDP prices, showing only monetary totals)

**Out of scope**:
- Calculation of totals (handled upstream)
- Receipt modifications (structural layout changes)

**Dependency**: Receipted Refunds blocked by POS-2270 (Entitlement DDP/Digital Coupon Receipted Refunds)

### Acceptance Criteria Scenarios

| Scenario | Guest Copy Shows |
|----------|-----------------|
| Receipted Refund - DDP only | All DDP items no price, total $0.00 |
| Receipted Refund - DDP + Guest ID | DDP items hidden, Guest ID amount as total |
| Receipted Refund - DDP + Cash | DDP items hidden, cash amount as total |
| Receipted Refund - DDP + Credit Card | DDP items hidden, credit card amount as total |
| Non-Receipted Refund - DDP only | All DDP items no price, total $0.00 |
| Non-Receipted Refund - DDP + Guest ID | DDP items hidden, Guest ID amount as total |
| Non-Receipted Refund - DDP + Cash | DDP items hidden, cash amount as total |
| Non-Receipted Refund - DDP + Credit Card | DDP items hidden, credit card amount as total |

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RECEIPT GENERATION FLOW                                │
│                                                                               │
│  Refund Completed → Receipt Trigger                                           │
│                                                                               │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONVERTER LAYER (Data Assembly)                             │
│                                                                               │
│  VoucherReceiptConverter                                                      │
│  ├── convertXxx(payment, checkoutOrder, isMerchantCopy)                      │
│  │                                                                            │
│  ├── BuildPaymentSummaryReceiptDataInteractor ★                              │
│  │   └── filterEntitlements = !isMerchantCopy                                │
│  │   └── Guest: excludes DiningPlanTenderDescriptor payments                 │
│  │   └── Merchant: uses full order totals                                    │
│  │                                                                            │
│  ├── BuildCouponsReceiptDataInteractor                                        │
│  │   └── Builds couponsInfo (DDP items) + nonPlanItemsCouponInfo             │
│  │                                                                            │
│  ├── BuildItemsLinesReceiptDataInteractor                                     │
│  │   └── getFeeLines() → splits gratuity by DDP coverage                    │
│  │                                                                            │
│  └── Output: VoucherReceipt (data object)                                    │
│                                                                               │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DECISIONS LAYER (Business Logic)                            │
│                    (Feature Flag: IsReceiptDecisionsEnabled)                   │
│                                                                               │
│  ResolveReceiptTotalUseCaseImpl ★                                             │
│  ├── Merchant: displayTotal = subtotal + tax + tip + gratuity                │
│  └── Guest: displayTotal = (subtotal+tax+tip+gratuity)                       │
│                              - ddpCoveredAmount - ddpCoveredGratuity          │
│                                                                               │
│  ResolveDDPReceiptDataUseCaseImpl                                             │
│  └── Resolves: displayName, balanceDisplay, showBalance                      │
│                                                                               │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BUILDER LAYER (Receipt Rendering)                           │
│                                                                               │
│  UniversalVoucherReceiptStepsBuilder ★                                        │
│  ├── isRefund() → getReturnedItemsSection()                                 │
│  │   └── buildStructuredDdpCartItemsSteps(couponsReceiptData)                │
│  │       ├── "Disney Dining Plan" header                                     │
│  │       ├── Per-coupon items (via GetCouponLinesInteractor)                 │
│  │       │   └── shouldPrintAmount = false for DDP items on guest copy       │
│  │       └── "Non Plan" section with actual prices                           │
│  │                                                                            │
│  ├── printTotalsSection()                                                     │
│  │   └── Guest: getCouponTotalInfo(nonPlanItemsCouponInfo) → non-plan only   │
│  │   └── Merchant: getTotalsBlock() → full amounts                           │
│  │                                                                            │
│  └── Tender Lines (via ReceiptTendersExtractor)                              │
│      ├── printDinningTenderLines() → shows $0.00 for DDP (room charge)       │
│      └── printDefaultTenderLines() → shows actual amounts (monetary + DDP w/o room charge) │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key File Locations

### Receipt Converters (Data Assembly)
| File | Class | Responsibility |
|------|-------|---------------|
| `main/receipts/converters/VoucherReceiptConverter.kt` | `VoucherReceiptConverter` | Entry point: converts payment+order → VoucherReceipt |
| `main/receipts/converters/BuildPaymentSummaryReceiptDataInteractor.kt` | `BuildPaymentSummaryReceiptDataInteractor` | ★ Calculates subtotal/tax/total; filters DDP when `filterEntitlements=true` |
| `main/receipts/converters/BuildCouponsReceiptDataInteractor.kt` | `BuildCouponsReceiptDataInteractor` | Builds DDP coupon data (couponsInfo + nonPlanItems) |
| `main/receipts/converters/BuildItemsLinesReceiptDataInteractor.kt` | `BuildItemsLinesReceiptDataInteractor` | Builds item lines; handles DDP gratuity separation |

### Receipt Decisions (New Pipeline)
| File | Class | Responsibility |
|------|-------|---------------|
| `main/receipts/decisions/total/ResolveReceiptTotalUseCaseImpl.kt` | `ResolveReceiptTotalUseCaseImpl` | ★ Guest total formula: full - ddpCoveredAmount - ddpCoveredGratuity |
| `main/receipts/decisions/total/model/TotalContext.kt` | `TotalContext` | Input: subtotal, tax, tipAmount, gratuityAmount, ddpCoveredAmount, ddpCoveredGratuity, isMerchantCopy |
| `main/receipts/decisions/total/model/TotalDecision.kt` | `TotalDecision` | Output: displayTotal, hideDDPGratuity |
| `main/receipts/decisions/ddp/ResolveDDPReceiptDataUseCaseImpl.kt` | `ResolveDDPReceiptDataUseCaseImpl` | Resolves DDP display name and balance visibility |
| `main/receipts/decisions/ddp/model/DDPContext.kt` | `DDPContext` | Input: planName, couponDescription, remainingBalance, isOffline |
| `main/receipts/decisions/ddp/model/DDPDecision.kt` | `DDPDecision` | Output: displayName, balanceDisplay, showBalance |

### Receipt Builders (Rendering)
| File | Class | Responsibility |
|------|-------|---------------|
| `main/receipts/builders/UniversalVoucherReceiptStepsBuilder.kt` | `UniversalVoucherReceiptStepsBuilder` | ★ Main builder: generates receipt steps from VoucherReceipt |
| `main/receipts/builders/GetCouponLinesInteractor.kt` | `GetCouponLinesInteractor` | Generates item lines; `shouldPrintAmount` controls price visibility |
| `main/receipts/builders/DefaultReceiptLabelProvider.kt` | `DefaultReceiptLabelProvider` | Labels: "Disney Dining Plan", "Non Plan", "REFUND" |
| `main/receipts/builders/ReceiptDecisionSectionRenderer.kt` | `ReceiptDecisionSectionRenderer` | Renders tax/total/DDP sections using decisions pipeline |

### Receipt Extractors
| File | Class | Responsibility |
|------|-------|---------------|
| `main/receipts/extractors/ReceiptPaymentSummaryExtractor.kt` | `ReceiptPaymentSummaryExtractor` | ★ `getPaidAmount()` filters DDP payments when `filterEntitlements=true` |
| `main/receipts/extractors/ReceiptTendersExtractor.kt` | `ReceiptTendersExtractor` | `printDinningTenderLines()` → $0.00 (room charge DDP only); `printDefaultTenderLines()` → monetary + non-room-charge DDP |
| `main/receipts/extractors/ReceiptFeesExtractor.kt` | `ReceiptFeesExtractor` | Splits gratuity: DDP-covered vs non-DDP portion |
| `main/receipts/extractors/ReceiptCouponDataExtractor.kt` | `ReceiptCouponDataExtractor` | Builds per-coupon item lines and non-plan items |

### Payment/Tender Models
| File | Class | Responsibility |
|------|-------|---------------|
| `payment/PaymentUtil.java` | `PaymentUtil` | `isDiningPayment()` — checks payment type string |
| `gc/dataModel/.../DiningPlanTenderDescriptor.kt` | `DiningPlanTenderDescriptor` | Tender descriptor class identifying DDP payments |
| `gc/dataModel/.../PaymentBase.kt` | `PaymentBase` | Base payment with `tenderDescriptor`, `isDining` extension |

### Tests
| File | Responsibility |
|------|---------------|
| `src/test/.../receipts/builders/UniversalVoucherReceiptStepsBuilderTest.kt` | Validates DDP refund guest copy hides amounts, shows non-plan amounts, correct section ordering |

---

## 4. Critical Decision Points (Where Bugs Likely Occur)

### 4.1 The `filterEntitlements` Flag

**Location**: `VoucherReceiptConverter.convertXxx()`

```
buildPaymentSummaryReceiptData(order, filterEntitlements = !isMerchantCopy)
```

**How it works**: When `filterEntitlements = true` (guest copy), `BuildPaymentSummaryReceiptDataInteractor` excludes all payments where `tenderDescriptor is DiningPlanTenderDescriptor`.

**Risk**: If a new tender type is introduced that wraps DDP (e.g., a different DiningPlan variant), the `is DiningPlanTenderDescriptor` check may not catch it, causing DDP amounts to leak onto the guest copy.

---

### 4.2 Guest Copy Total Calculation

**Location**: `ResolveReceiptTotalUseCaseImpl.invoke()`

```kotlin
// Guest copy formula:
displayTotal = (subtotal + tax + tipAmount + gratuityAmount) - ddpCoveredAmount - ddpCoveredGratuity
```

**Risk**: If `ddpCoveredAmount` or `ddpCoveredGratuity` are not correctly populated in `TotalContext`, the guest total will be wrong. The values come from the payment data — if a mixed payment (DDP + monetary) doesn't correctly split amounts, the subtraction will be off.

---

### 4.3 `getPaidAmount()` Filtering

**Location**: `ReceiptPaymentSummaryExtractor.getPaidAmount()`

```kotlin
if (filterEntitlements)
    validPayments.filter { !PaymentUtil.isDiningPayment(it) }  // Excludes DDP
```

**Risk**: `PaymentUtil.isDiningPayment()` uses `payment.getPaymentType().equalsIgnoreCase(Constants.PAYMENT_TYPE_DINING)`. If the payment type string doesn't match exactly (case difference, new constant), DDP payments won't be filtered.

---

### 4.4 DDP Item Price Visibility

**Location**: `GetCouponLinesInteractor` and `UniversalVoucherReceiptStepsBuilder.buildStructuredDdpCartItemsSteps()`

```kotlin
val shouldShowMerchantDetails = isMerchantCopy && !isRefund()
addAll(getCouponLinesInteractor(coupon, shouldShowMerchantDetails))
```

**Risk**: For refunds, `shouldShowMerchantDetails` is ALWAYS `false` (regardless of copy type) because `!isRefund()` = false. This means **DDP item prices are hidden on BOTH guest AND merchant copy for refunds**. This is the intended behavior per the code — DDP refund items never show price on either copy. However, if `isRefund()` incorrectly returns false for a refund scenario, merchant copy would show DDP prices (matching sale behavior) which may not be desired for refunds.

---

### 4.5 DDP Tender Line Routing (Room Charge Nuance)

**Location**: `ReceiptTendersExtractor.groupDistinct()` + `convertToDinningKey()`

```
DDP payment with isRoomChargeEnabled = true:
   → grouped by DinningTenderKey → printDinningTenderLines() → $0.00

DDP payment with isRoomChargeEnabled = false:
   → convertToDinningKey() returns null
   → falls to TransactionCardData.NO_DATA group
   → printDefaultTenderLines() → isDiningPlan() returns empty tenderName
   → BUT amount = payment.maxTotalPayment (actual DDP amount, NOT $0.00)
```

**Risk**: DDP payments WITHOUT room charge that fall into `printDefaultTenderLines()` will show the actual DDP amount on the tender line, not $0.00. However, this may be intentional if those payments are PRE-FILTERED by the caller (the `payments` parameter passed to `getTenderLines()` should already exclude DDP payments for the guest copy). Verify that the builder/converter only passes non-DDP payments to this method when building the guest copy.

**Actual caller**: `BuildItemsLinesReceiptDataInteractor` passes `checkoutOrder.getPayments()` (ALL payments including DDP) and `checkoutOrder.getDiningPayments()` as the separate `diningPayments` flag. The `diningPayments` parameter is used only to decide currency formatting, NOT to exclude DDP from the tender list. This means **ALL DDP payments with room charge show as $0.00, but DDP payments without room charge show their actual amount on the tender line**.

---

### 4.6 Gratuity Split (DDP vs Non-DDP)

**Location**: `ReceiptFeesExtractor.getFeeDiningGratuitiesLines()`

```
Non-DDP gratuity = (nonDDPtotals / totalItemsCost) × currentFeeAmount
```

**Risk**: Division-based proportional split. If `totalItemsCost` is zero (e.g., all items fully refunded already), division by zero. If rounding differs between this calculation and the actual payment split, totals may not add up.

---

### 4.6 Guest ID is Monetary (Not DDP)

**Business Rule**: Guest ID payments are treated as monetary, so they MUST appear in guest copy totals.

**Location**: `PaymentUtil.isDiningPayment()` and tender descriptor type checks.

**Risk**: Guest ID uses a different tender descriptor (not `DiningPlanTenderDescriptor`), so it naturally passes through the filter. But if someone incorrectly classifies Guest ID as a dining payment type, it would be excluded from the guest copy total.

---

## 5. Data Flow: DDP Refund Receipt Generation

### Step-by-step for Guest Copy

```
1. VoucherReceiptConverter.convertXxx(payment, order, isMerchantCopy=false)
   │
2. BuildPaymentSummaryReceiptDataInteractor(order, filterEntitlements=true)
   │  └── Filters: payment.tenderDescriptor !is DiningPlanTenderDescriptor
   │  └── Result: subtotal/tax/total from ONLY monetary payments
   │
3. BuildCouponsReceiptDataInteractor(order)
   │  └── couponsInfo: list of DDP coupons with items (no prices for guest)
   │  └── nonPlanItemsCouponInfo: non-plan items WITH prices
   │
4. BuildItemsLinesReceiptDataInteractor(order, isMerchantCopy=false)
   │  └── getFeeLines() → getFeeDiningGratuitiesLines()
   │  └── DDP gratuity portion excluded from display
   │
5. VoucherReceipt assembled → UniversalVoucherReceiptStepsBuilder.buildSteps()
   │
6. getReturnedItemsSection()
   │  └── Prints "---REFUND---"
   │  └── buildStructuredDdpCartItemsSteps():
   │      ├── "Disney Dining Plan" header
   │      ├── Each coupon: description + point usage (NO dollar amount)
   │      └── "Non Plan" section: items WITH dollar amounts
   │
7. printTotalsSection()
   │  └── getCouponTotalInfo(nonPlanItemsCouponInfo)
   │  └── Shows ONLY non-plan subtotal/tax/total
   │
8. Tender lines section
   │  └── DDP with room charge: printDinningTenderLines() → "$0.00"
   │  └── DDP without room charge: printDefaultTenderLines() → shows actual amount (empty name)
   │  └── Monetary (Cash/Credit/GuestID): printDefaultTenderLines() → actual amount
   │
9. Final receipt printed
```

### Guest Copy vs Merchant Copy Comparison

| Receipt Element | Guest Copy | Merchant/Store Copy |
|----------------|------------|-------------------|
| DDP item prices | Hidden (no amount) | Hidden on refund (shown on sale) |
| Non-plan item prices | Shown | Shown |
| DDP tender amount (room charge) | $0.00 | $0.00 |
| DDP tender amount (no room charge) | Actual DDP value (empty name) | Actual DDP value (empty name) |
| Monetary tender amount | Actual value | Actual value |
| Subtotal | Non-plan only | Full order |
| Tax | Non-plan only | Full order |
| Total | Monetary amounts only | Full amount |
| DDP gratuity | Hidden | Shown |
| Non-DDP gratuity | Shown | Shown |

---

## 6. DDP vs Monetary Tender Detection

### Detection Methods (used across receipt code)

| Method | Location | Check |
|--------|----------|-------|
| `payment.tenderDescriptor is DiningPlanTenderDescriptor` | `BuildPaymentSummaryReceiptDataInteractor` | Type check on descriptor class |
| `PaymentUtil.isDiningPayment(payment)` | `ReceiptPaymentSummaryExtractor` | `paymentType.equalsIgnoreCase(PAYMENT_TYPE_DINING)` |
| `payment.isDining` (extension) | Various | `tenderDescriptor is DiningPlanTenderDescriptor \|\| this is DiningPlanOrderPayment` |
| `checkoutCartItem.entitlementBlock != null` | `ReceiptFeesExtractor` | Item-level DDP coverage flag |

### Tender Classification

| Tender Type | Classified As | Included in Guest Copy Total |
|-------------|--------------|------------------------------|
| Disney Dining Plan | DDP (non-monetary) | ❌ No |
| Cash | Monetary | ✅ Yes |
| Credit Card | Monetary | ✅ Yes |
| Guest ID | Monetary | ✅ Yes |

---

## 7. Safe Modification Zones

When fixing bugs in this area, here are the safe boundaries:

### ✅ Safe to Modify (isolated receipt logic)
- `ResolveReceiptTotalUseCaseImpl` — only affects total calculation display
- `GetCouponLinesInteractor` — only affects item line formatting
- `UniversalVoucherReceiptStepsBuilder.getReturnedItemsSection()` — only affects refund section rendering
- `ReceiptDecisionSectionRenderer` — rendering decisions to steps

### ⚠️ Modify with Caution (shared across receipt types)
- `BuildPaymentSummaryReceiptDataInteractor` — used by ALL receipt types (sale, refund, void)
- `ReceiptPaymentSummaryExtractor.getPaidAmount()` — shared by all receipt scenarios
- `VoucherReceiptConverter` — orchestrates all receipt data assembly
- `ReceiptFeesExtractor` — affects gratuity display on all receipt types
- `ReceiptTendersExtractor.printDinningTenderLines()` — only DDP with room charge routes here; non-room-charge DDP uses `printDefaultTenderLines()`

### ❌ Do NOT Modify (affects payment/refund flow, not just receipts)
- `PaymentUtil.isDiningPayment()` — used in payment selection, ordering, and processing
- `DiningPlanTenderDescriptor` — model class used throughout the DDP integration
- `PaymentBase` / `tenderDescriptor` — core payment data model
- Any file in `emma/` package — affects entitlement management, not receipts

---

## 8. Testing Strategy

### Unit Tests
- `UniversalVoucherReceiptStepsBuilderTest` — DDP refund receipt scenarios:
  - DDP items have no amount on guest copy
  - Non-plan items show amounts on guest copy
  - Structured sections appear in correct order (REFUND → DDP → Non Plan)
  - Totals show only non-plan amounts on guest copy
- `ResolveReceiptTotalUseCaseImpl` tests — verify subtraction formula
- `BuildPaymentSummaryReceiptDataInteractor` tests — verify filtering logic

### Key Test Assertions for DDP Refund Guest Copy
1. DDP coupon items → no dollar amount printed
2. Non-plan items → dollar amount printed
3. Total = sum of monetary payments only
4. DDP tender line = "$0.00"
5. Monetary tender lines = actual refund amounts
6. Gratuity line = only non-DDP portion (if split)

---

## 9. AC-to-Code Mapping

### AC1: Hide DDP item prices on refund receipt

| What | Where |
|------|-------|
| DDP items rendered without price | `GetCouponLinesInteractor` — `shouldPrintAmount = false` (passed as `shouldShowMerchantDetails`) |
| shouldShowMerchantDetails logic | `isMerchantCopy && !isRefund()` — on refunds this is ALWAYS false (both copies hide DDP prices) |
| Non-plan items rendered with price | `buildStructuredDdpCartItemsSteps()` → "Non Plan" section uses `getCouponLinesInteractor(it)` (defaults `shouldPrintAmount=true`) |
| Decision: is this a DDP item? | `checkoutCartItem.entitlementBlock != null` |
| Decision: guest vs merchant copy | `VoucherReceipt.isMerchantCopy` flag set by `VoucherReceiptConverter` |

### AC2: Show only monetary tender amounts in totals

| What | Where |
|------|-------|
| Filter out DDP from total calculation | `BuildPaymentSummaryReceiptDataInteractor` — `filterEntitlements=true` excludes `DiningPlanTenderDescriptor` |
| Guest total formula | `ResolveReceiptTotalUseCaseImpl` — `displayTotal = full - ddpCoveredAmount - ddpCoveredGratuity` |
| "Total Paid" excludes DDP | `ReceiptPaymentSummaryExtractor.getPaidAmount(payments, filterEntitlements=true)` |
| "Refund" amount excludes DDP | Same filtering pipeline — refund = monetary amounts only |
| DDP tender shown as $0.00 | `ReceiptTendersExtractor.printDinningTenderLines()` |
| Monetary tenders shown with value | `ReceiptTendersExtractor.printDefaultTenderLines()` |

---

## 10. Known Issues / Bugs Found in Testing

### BUG: Receipted DDP refunds showing full price of items and total

| Field | Value |
|-------|-------|
| Environment | Latest, Build 2.1.1.43861 |
| Venue | 0816T |
| Feature Flag | `isRemoveDinningPlanGratuityEnabled` active |
| Scenario | Receipted Refund - DDP only (all items paid with DDP) |

**Steps to Reproduce**:
1. Login to DSP GO
2. Scan/look for a closed order fully paid with DDP
3. Refund all → Manager override
4. Checkout and refund all to DDP
5. Observe receipt

**Actual**: Receipt shows each DDP item with a price; subtotal and total include DDP amounts.

**Expected**: DDP items listed as $0.00; total/subtotal show only other (monetary) tenders.

**Root Cause Analysis — Where to Look**:

The issue is that the guest copy is rendering DDP item prices and including DDP amounts in totals. Based on the architecture, the most likely failure points are:

| Priority | Suspect | File | What to Check |
|----------|---------|------|---------------|
| 1 | `filterEntitlements` not being passed as `true` for refund guest copy | `VoucherReceiptConverter` | Verify that the refund receipt conversion calls `buildPaymentSummaryReceiptData(order, filterEntitlements = !isMerchantCopy)` — is `isMerchantCopy` incorrectly `true`? |
| 2 | `shouldPrintAmount` not `false` for DDP items on refund | `GetCouponLinesInteractor` | Check if `shouldShowMerchantDetails` logic: `isMerchantCopy && !isRefund()` — is `isRefund()` returning wrong value? |
| 3 | `couponsReceiptData` is null (fallback to non-DDP rendering) | `UniversalVoucherReceiptStepsBuilder.getReturnedItemsSection()` | If `couponsReceiptData` is null, the builder falls back to non-structured rendering that shows all prices. Check if `BuildCouponsReceiptDataInteractor` is called and returns data. |
| 4 | Receipted refund not detected as DDP payment | `BuildCouponsReceiptDataInteractor` | `hasDiningPayment(checkoutOrder)` gates coupon data creation — is the refund payment recognized as dining? |
| 5 | New receipted refund flow (POS-2270) not integrating receipt copy context | `ReceiptCopyContextFactory` | Check if `isDDPPayment` flag is set correctly for receipted refund scenario |
| 6 | Total section using `getTotalsBlock()` instead of `getCouponTotalInfo()` | `UniversalVoucherReceiptStepsBuilder.printTotalsSection()` | If the refund doesn't hit the DDP path, it uses full totals |

**Most Likely Root Cause**: The receipted refund flow added in POS-2270 likely constructs the `VoucherReceipt` without properly setting the DDP-related data (`couponsReceiptData`) or without marking the receipt as a guest copy (`isMerchantCopy = false`). This causes the builder to fall through to the non-DDP rendering path, showing all prices and full totals.

**Investigation Commands** (grep in codebase):
```
# Check how receipted refund triggers receipt generation
grep -r "receipted.*refund.*receipt\|refund.*voucher.*convert" gc/AppetizeActivate/src/main/ --include="*.kt" -l

# Check if VoucherReceiptConverter has a specific refund path for receipted
grep -n "isMerchantCopy\|filterEntitlements" gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/receipts/converters/VoucherReceiptConverter.kt

# Check if BuildCouponsReceiptDataInteractor is called in refund path
grep -rn "buildCouponsReceiptData\|BuildCoupons" gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/receipts/ --include="*.kt"
```

---

## 11. Related Tickets

| Ticket | Relationship |
|--------|-------------|
| POS-2270 | Parent feature: Entitlement receipted refunds (full refund flow) |
| POS-8369 | Child: FOH update logic to display only monetary amount |
| POS-14929 | Feature flag: `IsRemoveDinningPlanGratuityEnabled` (gratuity handling) |
