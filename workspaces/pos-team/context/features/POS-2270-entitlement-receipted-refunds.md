# POS-2270: Entitlement (DDP / Digital Coupon) Receipted Refunds

## Quick Reference

| Field | Value |
|-------|-------|
| Ticket | POS-2270 |
| Feature | Package Plan (DDP/Digital Coupon) Receipted Refunds |
| Module | `gc/AppetizeActivate` (main), `gc/emma`, `gc/dataModel` |
| Entry Point | `UniversalRefundOrderFragment` → `UniversalRefundOrderPresenter` → `RefundReceiptedItemFlow` |
| Key Feature Flag | `IsRemoveDinningPlanGratuityEnabled` (POS-14929) |
| External System | Disney EMMA (Entitlement Management) |

---

## 1. Feature Overview

This feature enables receipted refunds for items purchased using Disney Dining Plans (DDP) or Digital Coupons. Items consumed under an entitlement are grouped by their `comboGroupId` from Emma and must be refunded atomically — no partial entitlement refunds are allowed. The refund flow bypasses the Emma UI for cached (receipted) refunds and auto-reverses entitlement points via the Coupon Charge API.

### Business Rules Summary

1. **Atomic Group Refunds**: Items sharing a `comboGroupId` are refunded together (all or nothing)
2. **Package Plan Items First**: DDP items display before non-plan items in the refund UI
3. **Gratuity Auto-Add**: When plan items are added to refund cart, inclusive gratuity is auto-added
4. **Gratuity Non-Removable**: Gratuity covered by plan items cannot be independently removed (shows popup)
5. **Payment Ordering**: DINING tender always appears first (position 0) in refund payment selection
6. **No Emma UI for Cached Refunds**: Receipted DDP refunds auto-refund to original plan without user media scan
7. **Non-Cached Plan Refunds**: Prompt for media → go through Emma flow

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UI LAYER                                         │
│                                                                               │
│  UniversalRefundOrderFragment                                                 │
│  ├── displays: dinningPlanItemsConverted (grouped by comboGroup)             │
│  ├── displays: noPlanItemsConverted (regular items)                          │
│  └── displays: feesTips (gratuity section)                                   │
│                                                                               │
│  Delegates:                                                                   │
│  ├── RefundOrderTopItemDinningPlanDelegate (plan group items)                │
│  ├── RefundOrderTopItemDelegate (regular items)                              │
│  └── RefundOrderFeesTipsDelegate (fees/gratuity)                             │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRESENTER LAYER                                      │
│                                                                               │
│  UniversalRefundOrderPresenter                                                │
│  ├── onOrderRetrieved() → RefundOrderConverter.mapToRefundOrderModel()       │
│  ├── onReturnItemClick() → refundReceiptedItemFlow.refundItem()              │
│  ├── onReturnItemsGroupClick() → refundReceiptedItemFlow.refundItemsGroup() │
│  ├── onGroupIdClick() / onGroupIdRemove() → group selection                 │
│  └── processReceiptedFeesAndTips() → auto-add gratuity                      │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BUSINESS LOGIC LAYER                                  │
│                                                                               │
│  RefundReceiptedItemFlow ★ (core orchestrator)                                │
│  ├── handleNormalItemReturn()                                                 │
│  │   ├── IF entitlementBlock != null → RefundOrderItemCombinationInteractor  │
│  │   └── ELSE → SetRefundModifiersToCartInteractor (regular path)            │
│  ├── refundItemsGroup() → atomic group refund                                │
│  └── processReceiptedFeesAndTips() → gratuity management                     │
│                                                                               │
│  RefundOrderConverter ★ (display logic)                                       │
│  ├── buildDinningPlanItems() → groups items by comboGroupId                  │
│  └── mapToRefundOrderModel() → separates plan vs non-plan                    │
│                                                                               │
│  Gratuity Delegates:                                                          │
│  ├── DiningGratuityCartControllerDelegateImpl → removal validation           │
│  └── RefundValidationDiningGratuitiesDelegateImpl → fee constraint logic     │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTERACTORS / USE CASES                                │
│                                                                               │
│  RefundOrderItemCombinationInteractor → adds all combo items to cart          │
│  RefundReceiptedEntitlementsInteractor → calls Emma API to reverse points     │
│  SetDiningPlanToItemsInteractor → stamps cart items with entitlement data     │
│  EntitlementRefundRequestBuilder → builds API request for point reversal      │
│  GetOrderFeesForRefundUseCaseImpl → determines which fees to auto-add        │
│  GetFeeValueFromDiningPlanUseCaseImpl → calculates non-removable gratuity    │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA / MODELS                                        │
│                                                                               │
│  EmmaResponseChargeGroup → { comboGroupId, pointUsage }                      │
│  EmmaResponsePlanUsage → { couponCode, diningPlanName, comboGroups, items }  │
│  EntitlementSet → { entitlementCode, pointIncrement, referenceList }          │
│  CheckoutEntitlementBlock → { couponCode, itemCombinationKey, uuidMap }      │
│  EmmaItemExtension → { couponCode, entitlementGroupList, comboKeys }         │
│  OrderItemCombination → { countPerSet, checkoutCartItems }                   │
│  GratuityDiningOnFee → enum { NONE, PARTIAL, TOTAL }                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key File Locations

### UI Layer
| File | Class | Responsibility |
|------|-------|---------------|
| `main/refund_order/UniversalRefundOrderFragment.kt` | `UniversalRefundOrderFragment` | Main refund UI, displays grouped/ungrouped items |
| `main/refund_order/UniversalRefundOrderPresenter.kt` | `UniversalRefundOrderPresenter` | Orchestrates UI events, delegates to flow |

### Core Flow
| File | Class | Responsibility |
|------|-------|---------------|
| `refund/RefundReceiptedItemFlow.kt` | `RefundReceiptedItemFlow` | ★ Central orchestrator for receipted refunds |
| `main/refund_order/RefundOrderConverter.kt` | `RefundOrderConverter` | ★ Converts order data to display models, separates plan/non-plan |

### DDP/Entitlement Interactors
| File | Class | Responsibility |
|------|-------|---------------|
| `retail/ui/mvp/presenter/refund/RefundOrderItemCombinationInteractor.kt` | `RefundOrderItemCombinationInteractor` | Adds entire combo group to cart atomically |
| `emma/interactors/RefundReceiptedEntitlementsInteractor.kt` | `RefundReceiptedEntitlementsInteractor` | Calls Emma API to reverse entitlement points |
| `emma/builder/EntitlementRefundRequestBuilder.kt` | `EntitlementRefundRequestBuilder` | Builds the API request payload for point reversal |
| `main/refund_order/interactor/SetDiningPlanToItemsInteractor.kt` | `SetDiningPlanToItemsInteractor` | Assigns entitlement block data to refund items |

### Gratuity Handling
| File | Class | Responsibility |
|------|-------|---------------|
| `main/refund_order/refundDining/DiningGratuityCartControllerDelegateImpl.kt` | `DiningGratuityCartControllerDelegateImpl` | Validates gratuity removal in cart |
| `main/refund_order/refundDining/RefundValidationDiningGratuitiesDelegateImpl.kt` | `RefundValidationDiningGratuitiesDelegateImpl` | Fee constraint logic per GratuityDiningOnFee state |
| `main/refund_order/refundDining/GratuityDiningOnFee.kt` | `GratuityDiningOnFee` | Enum: NONE, PARTIAL, TOTAL |

### Payment
| File | Class | Responsibility |
|------|-------|---------------|
| `payment/PaymentUtil.java` | `PaymentUtil` | Payment ordering logic, DINING first |
| `payment/proceed/interactors/ReceiptedTipRefundAmountsCalculator.kt` | `ReceiptedTipRefundAmountsCalculator` | Splits refund between subtotal and tip |

### Data Models
| File | Class | Responsibility |
|------|-------|---------------|
| `gc/dataModel/.../emma/response/EmmaResponseChargeGroup.kt` | `EmmaResponseChargeGroup` | Charge group from Emma (comboGroupId) |
| `gc/dataModel/.../emma/response/EmmaResponsePlanUsage.kt` | `EmmaResponsePlanUsage` | Plan usage with combo groups and items |
| `gc/dataModel/.../entitlement/EntitlementSet.kt` | `EntitlementSet` | Aggregates items into entitlement groups |
| `gc/dataModel/.../entitlement/CheckoutEntitlementBlock.kt` | `CheckoutEntitlementBlock` | Persisted entitlement per cart item |
| `gc/dataModel/.../integration/emma/EmmaCartExtension.kt` | `EmmaCartExtension` | Cart-level entitlement maps and grouping |
| `gc/dataModel/.../integration/emma/EmmaItemExtension.kt` | `EmmaItemExtension` | Per-item entitlement metadata |
| `gc/dataModel/.../emma/OrderItemCombination.kt` | `OrderItemCombination` | Groups items for refund by combo key |

### New Classes (Post-Update)
| File | Class | Responsibility |
|------|-------|---------------|
| `refund_order/RefundDiningPlanSplitItemsConverter.kt` | `RefundDiningPlanSplitItemsConverter` | ★ Splits consolidated items into per-combo-group clones for correct refund quantities |
| `refund_order/SplitPurchaseAdjuster.kt` | `SplitPurchaseAdjuster` | Adjusts purchase data (qty, cost, tax) when splitting multi-quantity items |
| `refund_order/interactor/GetOrderFeesForRefundUseCaseImpl.kt` | `GetOrderFeesForRefundUseCaseImpl` | Determines which fees to add to cart based on GratuityDiningOnFee state |
| `refund_order/interactor/IsFeeInCartUseCaseImpl.kt` | `IsFeeInCartUseCaseImpl` | Determines if a fee displays as "Refunding" in UI |
| `refund_order/FeeRefundContext.kt` | `FeeRefundContext` | Data class grouping all fee refund state parameters |
| `refund_order/GetGratuityDiningFromOrderAndCartUseCaseImpl.kt` | `GetGratuityDiningFromOrderAndCartUseCaseImpl` | Determines GratuityDiningOnFee state from order + cart |

---

## 4. Critical Decision Points (Where Bugs Likely Occur)

### 4.1 Branching: DDP vs Regular Refund

**Location**: `RefundReceiptedItemFlow.handleNormalItemReturn()`

```
IF orderItem.entitlementBlock != null && itemCombinationKey.isNotEmpty()
   → DDP path: RefundOrderItemCombinationInteractor.execute()
ELSE
   → Regular path: SetRefundModifiersToCartInteractor.execute()
```

**Risk**: If `entitlementBlock` is null unexpectedly (data corruption, incomplete Emma response), items won't follow the DDP path and may refund incorrectly as individual items.

### 4.2 Entitlement Grouping Construction

**Location**: `RefundOrderConverter.buildDinningPlanItems()`

**Flow**:
1. Extract `DiningPlanOrderPayment` from order payments
2. Parse `ExternalDiningPlanData` → `emmaResponse` → `planUsage`
3. When feature flag ON: call `RefundDiningPlanSplitItemsConverter.splitItems()` to split consolidated items (mutates `order.cartList`)
4. For each `planUsage.comboGroups`:
   - Get `comboGroupId`
   - Match cart items by checking `cartItem.entitlementBlock?.entitlementGroupList?.contains(comboGroupId)`
   - Build `DinningPlanItems(id=comboGroupId, items, planName)`

**Item Matching** (Updated): Items are matched to combo groups via `entitlementBlock.entitlementGroupList.contains(comboGroupId)` on the cart items themselves — NOT via `planUsage.items` filtering from Emma response.

**Risk**: If `entitlementBlock.entitlementGroupList` is empty or incorrectly populated during checkout, items won't match any combo group and will appear ungrouped (falling to Non-Plan section erroneously).

### 4.3 Gratuity State Determination

**Location**: `DiningGratuityCartControllerDelegateImpl.getGratuityDiningOnFee()`

**Logic**:
- `NONE`: No plan items in cart, or no inclusive gratuity
- `PARTIAL`: Mix of plan and non-plan items with gratuity
- `TOTAL`: All gratuity is attributable to plan items

**Risk**: Edge case when all plan items are removed but gratuity state isn't recalculated, leaving orphaned constraints.

### 4.4 Payment Tender Filtering

**Location**: `PaymentUtil.getPaymentTendersFilteredByDining()`

**Logic**: If ALL cart items have Emma extension → remove all non-DINING tenders

**Risk**: If cart has mixed items but is incorrectly evaluated as "all dining", user won't see cash/credit refund options.

### 4.5 Fee/Tip Auto-Addition

**Location**: `RefundReceiptedItemFlow.processReceiptedFeesAndTips()`

**Logic**:
1. Removes ALL existing fees from cart (`cartProxy.retailCart.removeAllFees()`)
2. Uses `GetOrderFeesForRefundUseCaseImpl` to determine which fees to re-add based on `GratuityDiningOnFee` state
3. Partitions between order tips and order fees
4. Tracks `processedParentOrderIds` to avoid duplication in group refunds

**De-duplication Guard (NEW)**:
```
When IsRemoveDinningPlanGratuityEnabled is ON:
  IF orderItem.entitlementBlock != null:
    track orderItem.parentOrderId in processedParentOrderIds set
    IF already processed → SKIP fee recalculation for this item
```
This prevents duplicate fee addition when multiple items in the same entitlement group each trigger `processReceiptedFeesAndTips()` during a group refund.

**Method `clearGroupIdList()`**: Resets the `processedParentOrderIds` set between refund operations.

**Risk**: If the set is not cleared properly between operations, fees may be incorrectly skipped in subsequent refunds within the same session.

### 4.6 Item Splitting for Consolidated Items

**Location**: `RefundDiningPlanSplitItemsConverter.splitItems()` called from `RefundOrderConverter.buildDinningPlanItems()`

**Problem**: A single `CheckoutCartItem` with qty=4 spanning 2 combo groups must be split into clones per group.

**Risk**: The `order.cartList` is **mutated** (`order.cartList = ArrayList(split)`). If any code caches the original cart list before this mutation runs, it will operate on stale data. Also, the UUID suffixing (`uuid#groupId`) could break lookups that expect exact UUID matching.

### 4.7 Tax Reconciliation Rounding

**Location**: `retailCart.java → reconcileLineTaxToCartTotal()`

**Risk**: The 5-cent (`MAX_RECONCILE_RESIDUAL = 0.05`) threshold could mask real calculation errors if a bug introduces a residual of exactly 5 cents. Monitor for `TRANSACTION_OUT_OF_BALANCE` CAP quarantines close to but above 5 cents — those indicate a real calculation bug slightly above the reconciliation cap.

---

## 5. Entitlement Grouping Deep Dive

### How comboGroupId Works

Emma returns a response structured as:
```
planUsage[0]:
  couponCode: "ML"
  diningPlanName: "DDP 1 Meal"
  comboGroups:
    - comboGroupId: "18964706|99928|26|1|1|3|6"
      pointUsage: 1
  items:
    - id: "uuid1..." comboGroupId: "18964706|99928|26|1|1|3|6" (Burger)
    - id: "uuid2..." comboGroupId: "18964706|99928|26|1|1|3|6" (Soda)
    - id: "uuid3..." comboGroupId: "18964706|99928|26|1|1|3|6" (Fries)
```

All three items share the same `comboGroupId` → they were consumed as a single meal entitlement → must be refunded together.

### Key Maps in EmmaCartExtension

| Map | Key | Value | Purpose |
|-----|-----|-------|---------|
| `entitlementSetIdMap` | `comboGroupId` (raw) | `EntitlementSet` | Primary grouping by Emma charge group |
| `entitlementSetTypeMap` | `productCompositeKey` (sorted product IDs) | `EntitlementSet` | Consolidation of same-product groups |
| `uniqueIdEntitlementSetMap` | `uniqueIdsKey` (sorted UUIDs) | `EntitlementSet` | Refund-specific tracking by instance |

### Composite Key Formats

- **productCompositeKey**: `"ML@1@10001-1:20020-1:30000-1"` (entitlementCode@points@productId-qty:...)
- **uniqueCompositeKey**: `"ML@1@c82dad6c-...-1:688aae28-...-1"` (entitlementCode@points@uuid-qty:...)

### Refund-Time Grouping via OrderItemCombination

At refund time, `OrderItemCombinationUtils.buildEntitlementBlockMap()`:
1. Groups `CheckoutCartItem`s by `entitlementBlock.uuidCombinationKey`
2. Creates `OrderItemCombination(countPerSet, checkoutCartItems)` per group
3. When any item in the group is selected → all items are refunded

---

## 6. Cart Behavior During DDP Refunds

### Adding Items (Group)

```
User clicks "Refund" on a DDP group
  → onReturnItemsGroupClick(items)
    → refundReceiptedItemFlow.refundItemsGroup(items)
      → for each item in group:
          RefundOrderItemCombinationInteractor.execute()
            → gets OrderItemCombination from entitlementBlock
            → adds ALL items in combination to cart
      → processReceiptedFeesAndTips() → auto-adds gratuity
```

### Removing Items (Group)

```
User clicks "X" on a plan item in cart
  → DiningGratuityCartControllerDelegateImpl.reviewHandleSwipeDeleteClick()
    → finds all items in same plan group
    → removes ALL items in group from cart
    → recalculates gratuity (may remove or reduce fee)
```

### Gratuity Cannot Be Removed Popup

```
User clicks "X" on gratuity line in cart
  → DiningGratuityCartControllerDelegateImpl.reviewHandleDeleteClick()
    → getGratuityDiningOnFee()
      → TOTAL: view.showUnableToRemoveFeeDueToPlanItems()
        → Shows: "Gratuity is included with the plan items and can't 
           be removed separately. Remove the items to remove the gratuity."
      → PARTIAL: recalculates fee to non-removable portion only
      → NONE: allows normal delete
```

---

## 7. Payment Flow for DDP Refunds

### Tender Ordering
1. `PaymentUtil.getPaymentTendersForOriginalRefundSorted()` sets DINING to visual position 0
2. DINING tenders always appear first in the UI

### Tender Filtering
- If ALL cart items have entitlement extensions → only DINING tender shown
- If NO cart items have entitlements → DINING tender excluded
- Mixed → all original tenders shown with DINING first

### Refund Execution
1. `RefundReceiptedEntitlementsInteractor.invoke(kttwValue, retailCart)`
2. `EntitlementRefundRequestBuilder.build()` → calculates point usage per coupon
3. `couponChargeService.execute()` → calls Emma API to reverse points
4. On success: `entitlementReservationProcessor.updateBalanceAfterRedemption()`
5. On failure: checks offline limit (venue-specific allowance)

---

## 8. Feature Flags

| Flag | ID | Purpose |
|------|----|---------|
| `IsRemoveDinningPlanGratuityEnabled` | `isRemoveDinningPlanGratuityEnabled` | Gates all DDP gratuity removal validation. When OFF: gratuity freely removable. When ON: NONE/PARTIAL/TOTAL logic applies |
| `IsInclusiveGratuitiesEnabled` | `isInclusiveGratuitiesEnabled` | Controls inclusive gratuities tax fix (separate from refund flow, affects tax calculation) |
| `feesTipsRefundEnabled` | — | From `UserManager.allowTipOrFeeRefunds()`. Gates whether fees/tips refund UI shows |
| `refundingModifiersEnabled` | — | DEV flag for modifier-level refunding |

---

## 8.1 Item Splitting for Consolidated Items (NEW)

### Problem Solved
When the same product (e.g., "Smart Water") is purchased at quantity 4 and spans multiple combo groups (e.g., 2 plans each covering 2 waters), the original cart has a single `CheckoutCartItem` with qty=4. For refund, we need to know which specific quantities belong to which combo group.

### Solution: `RefundDiningPlanSplitItemsConverter`

**Called from**: `RefundOrderConverter.buildDinningPlanItems()` (when feature flag ON)

**Algorithm**:
```
1. getAllComboGroupIds(order) → Set<String>
   - Extracts valid combo group IDs from DiningPlanOrderPayment.originalExternalData

2. splitItems(cartList, validComboGroupIds) → List<CheckoutCartItem>
   - For each item in cartList:
     - If item.entitlementBlock.entitlementGroupList.size > 1:
       → Clone item per group via cloneForGroup()
     - Else: keep as-is

3. cloneForGroup(cartItem, groupId, isLastItem) → CheckoutCartItem
   - Deep copy with UUID suffixed "#groupId"
   - Adjusts purchase via SplitPurchaseAdjuster
   - Creates new entitlementBlock with single group

4. SplitPurchaseAdjuster.adjust(purchase, isLastItem)
   - Sets qty = 1
   - Recalculates costs to unit cost
   - Splits tax using largest-remainder method
     (last item gets residual to avoid rounding loss)
```

**Critical Side Effect**: `order.cartList = ArrayList(split)` — the order's cart list is **mutated** so all downstream consumers (display, cart operations) see split items.

### Relation to Bugs POS-19212, POS-19750, POS-19751
This converter is the fix for the "wrong quantities" bugs (15.13, 15.14). By splitting consolidated items into per-group clones with qty=1, the `RefundOrderItemCombinationInteractor` correctly handles them individually.

---

## 8.2 Fee Determination Use Cases (NEW)

### `GetOrderFeesForRefundUseCaseImpl`
Determines which fees to re-add to cart after removal during `processReceiptedFeesAndTips()`:

| GratuityDiningOnFee State | Behavior |
|---------------------------|----------|
| `NONE` | Return initial fees filtered by cart (or all if cart empty) |
| `TOTAL` | Adjust fee value using `GetFeeValueFromDiningPlanUseCase`, include plan fee |
| `PARTIAL` | Filter by IDs including plan fee ID |

### `IsFeeInCartUseCaseImpl`
Determines if a fee shows as "Refunding" in UI:

| GratuityDiningOnFee State | Behavior |
|---------------------------|----------|
| `NONE` | Simple ID check against cart fees |
| `TOTAL` | Excludes gratuity percent fees from "in cart" (they're non-removable) |
| `PARTIAL` | Complex: checks `explicitlyRefundedFeeUids` or `hasNonEntitlementItemsInCart` |

### `FeeRefundContext` (Data Class)
Consolidates all fee state parameters:
- `cartFeesIds` — IDs of fees currently in cart
- `feeValueFromPlan` — calculated plan gratuity amount
- `gratuityDiningOnFee` — current NONE/PARTIAL/TOTAL state
- `explicitlyRefundedFeeUids` — fees user explicitly added to refund
- `hasNonEntitlementItemsInCart` — whether non-plan items exist in cart
- `isDiningPlanGratuityEnabled` — feature flag value

### `GetGratuityDiningFromOrderAndCartUseCaseImpl`
Replaces scattered state determination logic:
1. If no inclusive gratuities → `NONE`
2. If fee from dining equals order total fee → `TOTAL`
3. If `orderItem.hasEntitlement` → compare fee from dining with calculated value → `TOTAL` or `PARTIAL`
4. Otherwise → compare negated dining fee with fee on cart → `TOTAL` or `PARTIAL` or `NONE`

---

## 8.3 Tax Reconciliation in RetailCart (NEW — Resolution of Section 15.4)

### `reconcileLineTaxToCartTotal()` Method in `retailCart.java`

**Purpose**: Fixes `TRANSACTION_OUT_OF_BALANCE` CAP quarantine caused by rounding drift between order-level tax (HALF_EVEN rounded) and per-line tax (independently rounded).

**Algorithm (Largest-Remainder Reconciliation)**:
```
1. expectedLineSum = newTotal - fee - tip
2. actualSum = sum of (line costs + taxes) excluding refunding items
3. residual = expected - actual
4. IF residual > 0 AND residual ≤ MAX_RECONCILE_RESIDUAL (0.05):
   - Find item with largest active tax
   - Absorb residual into that item's calculatedTax
5. Guards: won't make tax negative, won't mask residuals > 5 cents
```

**Called from**: `calculateCartTotals()` just before `setTotal(newTotal)`

**Key Addition in `calculateCartTotals()`**:
- Now calculates `newEntitlementTotal = getEntitlementSubtotal()` in parallel with `newTotal`
- Fee is added to BOTH `newTotal` and `newEntitlementTotal` (gratuity counts in entitlement totals)

**Resolution of Bug (Section 15.4)**: Instead of changing inclusion/exclusion of entitlement items in tax calculation (which caused duplication), the fix uses a post-calculation reconciliation approach. The `getHasEntitlement()` guard remains — entitlement taxes still come via `originalTaxSubTotalTaxData` — but any rounding drift is absorbed by the largest-tax item.

---

## 9. Display/UI Sections

### Refund History Screen Layout

```
┌──────────────────────────────────────┐
│  PACKAGE PLAN                         │  ← Section header (not "Meal Plan")
│  ┌────────────────────────────────┐  │
│  │ DDP 1 Meal                      │  │  ← Plan name from Emma
│  │  🍔 Burger        $12.99       │  │
│  │  🥤 Soda          $3.99        │  │  ← Items grouped by comboGroupId
│  │  🍟 Fries         $4.99        │  │
│  │  [REFUND GROUP]                 │  │  ← Single CTA for entire group
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ DDP 1 Snack                     │  │
│  │  🍪 Cookie        $5.99        │  │
│  │  [REFUND GROUP]                 │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│  NON PLAN                             │  ← Section header
│  ┌────────────────────────────────┐  │
│  │  🧃 Juice Box     $2.99        │  │
│  │  [REFUND]                       │  │  ← Individual CTA
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│  FEES & TIPS                          │
│  ┌────────────────────────────────┐  │
│  │  Gratuity 18%     $3.96        │  │
│  │  [REFUND] (only for non-plan)  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Sorting Rules
1. Plan items FIRST (grouped by `comboGroupId`, each group shows plan name)
2. Non-plan items AFTER
3. Fees/tips LAST
4. Within refunding items: items being refunded sort before available items

---

## 10. Receipts Behavior

### Store Copy
- Meal plan items with their dollar value
- Gratuity with its dollar value

### Guest Copy
- Meal plan items WITHOUT price (value hidden from guest)
- Non-plan items with price as normal

---

## 11. Edge Cases & Scenarios

### Same Item, Multiple Tenders
**Scenario**: Side Fries exists in a QSR Meal (plan), also sold as a Snack (plan), and as Non-Plan.

**Behavior**: When scanned, filter refund list to only groups containing that item. User selects which group/instance to refund.

### Mixed Cart (Plan + Non-Plan)
**Gratuity State**: `PARTIAL` → gratuity is recalculated to only show the non-removable (plan-attributable) portion when user tries to delete.

### All Plan Items Removed from Cart
**Gratuity State**: Transitions from TOTAL/PARTIAL → NONE. Gratuity becomes freely removable.

### Offline Refund
If Emma API is unreachable during `RefundReceiptedEntitlementsInteractor`:
- Checks venue's offline dining refund allowance
- If within limit: processes refund offline
- If exceeded: fails with error

---

## 12. Testing Scenarios for QA (2.1.3)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | DDP 1 Snack refund | Single item refunds, points reversed |
| 2 | DDP 1 Meal (Entree + Drink) | Both items refund atomically as group |
| 3 | DDP 1 Meal + 1 Snack | Meal group and snack group shown separately |
| 4 | DDP 2 Meal + 1 Snack + 1 Non-Plan | Plan section shows 3 groups, Non-Plan section shows 1 item |
| 5 | SNS 1 Snack | Snack coupon (not DDP) follows same grouping rules |
| 6 | 1 Meal + 18% Gratuity (fully covered) | Gratuity auto-added, cannot be removed independently |
| 7 | 1 Meal + 18% Gratuity (not covered by plan) | Gratuity has independent refund button |
| 8 | 3 Meals + non-plan + 18% Gratuity (partial) | Gratuity partially removable (PARTIAL state) |
| 9 | Remove plan item from cart → gratuity recalculates | Gratuity adjusts proportionally |
| 10 | All plan items in cart → only DINING tender shown | Non-DINING tenders filtered out |
| 11 | Mixed items → DINING tender first | DINING at position 0, others follow |
| 12 | Click "X" on gratuity (TOTAL state) | Popup: "can't be removed separately" |

---

## 13. Modification Safety Guide

### Safe to Modify (low risk of side effects)
- UI string resources (section headers, popup messages)
- `RefundOrderConverter` display ordering logic
- `RefundOrderTopItemDinningPlanDelegate` (visual rendering only)

### Moderate Risk (test surrounding logic)
- `processReceiptedFeesAndTips()` — affects gratuity calculation for all items
- `GratuityDiningOnFee` state transitions — affects removal popup behavior
- `PaymentUtil` tender sorting/filtering — affects payment screen
- `GetOrderFeesForRefundUseCaseImpl` — determines fee re-addition logic
- `GetGratuityDiningFromOrderAndCartUseCaseImpl` — determines NONE/PARTIAL/TOTAL state
- `IsFeeInCartUseCaseImpl` — affects fee display status in UI
- `processedParentOrderIds` clearing logic — affects fee duplication prevention

### High Risk (requires full regression)
- `RefundReceiptedItemFlow.handleNormalItemReturn()` — branching between DDP/regular
- `RefundOrderItemCombinationInteractor` — core group refund logic
- `EmmaCartExtension` maps — affects entire entitlement system (sale AND refund)
- `EntitlementRefundRequestBuilder` — affects Emma API integration
- `CheckoutEntitlementBlock` model changes — affects persistence and all consumers
- `RefundDiningPlanSplitItemsConverter` — splits consolidated items; errors cause wrong quantities (POS-19212)
- `SplitPurchaseAdjuster` — tax splitting via largest-remainder; errors cause CAP quarantine
- `retailCart.java calculateCartTotals()` / `reconcileLineTaxToCartTotal()` — tax reconciliation; errors cause TRANSACTION_OUT_OF_BALANCE

---

## 14. Dependencies Between Components

```
UniversalRefundOrderPresenter
  ├── depends on → RefundOrderConverter (display)
  ├── depends on → RefundReceiptedItemFlow (business logic)
  ├── depends on → CartProxy (cart operations)
  └── depends on → TipRefundsRepository (tip balance)

RefundReceiptedItemFlow
  ├── depends on → RefundOrderItemCombinationInteractor
  ├── depends on → SetRefundModifiersToCartInteractor
  ├── depends on → GetOrderFeesForRefundUseCaseImpl
  ├── depends on → DiningGratuityCartControllerDelegate
  └── depends on → Feature flags (IsRemoveDinningPlanGratuityEnabled)

RefundReceiptedEntitlementsInteractor
  ├── depends on → EntitlementRefundRequestBuilder
  ├── depends on → CouponChargeService (Emma API)
  ├── depends on → EntitlementReservationProcessor
  └── depends on → Offline limits configuration

RefundOrderConverter
  ├── depends on → Order.paymentItems (DiningPlanOrderPayment)
  ├── depends on → ExternalDiningPlanData → EmmaResponse → PlanUsage
  └── depends on → CheckoutCartItem.entitlementBlock
```

---

## 15. Subtask Details

### 15.1 FOH | UI: All related item references should be added/removed from cart as a group — Gratuity included

**Subtask Scope**: Cart behavior after "Refund" CTA is clicked. Items display in cart with correct grouping.

**Key Clarifications from Subtask**:

| Point | Detail |
|-------|--------|
| Gratuity from package plan | Does NOT display in the refund page UI. Only shows at cart footer |
| Gratuity from other tender | DOES display in the refund page as a refundable line item |
| Inclusive gratuity auto-add | When meal items are added to cart, gratuity auto-adds to cart |
| Tax behavior | Tax always stays with the items in a refund (no separate tax refund line) |
| DDP-covered modifiers | Shown under parent item, returned together with parent as part of entitlement group |
| Non-DDP modifiers | Shown in "Non Plan" section with own selectable refund value (treated as individual item) |
| Venue types | Applies to QSR, TSR, and Merch venues |
| Pre-condition | EAS must set `includesGratuity` flag to `true` at the venue |
| Offline validation | Out of scope |

**Acceptance Criteria Mapping**:

| AC | Scenario | Expected Result |
|----|----------|-----------------|
| AC1 | 1 Meal + 18% Gratuity, fully covered by plan | Entire amount (Meal + Gratuity) refunded to original package plan |
| AC2 | 1 Meal + 18% Gratuity, NOT covered by plan (cash/card) | Entire amount (Meal + Gratuity) refunded to original non-plan tender |

**Important Design Decision**: Gratuity covered by package plan is INVISIBLE in the refund history UI — it only appears in the cart footer after items are added. This means:
- `RefundOrderConverter.buildRefundFeesTipsViewModel()` should exclude plan-covered gratuity from the fees/tips section
- `processReceiptedFeesAndTips()` adds it to the cart subtotals/footer only
- Only non-plan gratuity gets a visible "Refund" button in the refund history

**Impact on Code**:
- `RefundOrderFeesTipsDelegate` → must filter out plan-covered gratuity from display
- `DiningGratuityCartControllerDelegateImpl` → gratuity shows in cart footer, not as line item
- `RefundValidationDiningGratuitiesDelegateImpl` → handles the filtering logic based on `includesGratuity` EAS flag

### 15.2 FOH | UI: Gratuity uncovered removal behavior — Cart Part 3

**Subtask Scope**: Behavior when user removes gratuity ("X") or swipes to delete items from the refund cart. Focuses on how gratuity splits between plan-covered and uncovered portions.

**Venue Type**: TSR (Table Service Restaurant)

**Key Behavior — Gratuity "X" Removal**:

```
User clicks "X" on gratuity in cart:
  → Plan-covered gratuity REMAINS in the cart (non-removable)
  → Uncovered (non-plan) gratuity is REMOVED from cart
  → Removed uncovered gratuity RETURNS to the refund page as refundable line item
```

This means the `PARTIAL` state in `GratuityDiningOnFee` enum triggers a **split**: the plan portion stays, the non-plan portion goes back to available-for-refund.

**Acceptance Criteria**:

| AC | Scenario | Trigger | Expected Result |
|----|----------|---------|-----------------|
| AC1 | Plan items with plan gratuity | Swipe-delete a plan item | ALL plan items removed + plan gratuity value removed from cart |
| AC2 | Non-plan item with non-plan gratuity | Swipe-delete a non-plan item | Non-plan item removed + non-plan gratuity value removed from cart |

**Critical Logic Flow — Swipe Delete**:

```
Swipe-delete on plan item:
  → DiningGratuityCartControllerDelegateImpl.reviewHandleSwipeDeleteClick()
    → finds ALL items in same plan group (via checkForPlanItems())
    → removes ALL plan items in group
    → recalculates gratuity: removes plan gratuity portion from cart total
    → remaining cart gratuity = only non-plan gratuity (if any)

Swipe-delete on non-plan item:
  → Standard item removal
  → recalculates gratuity: removes non-plan gratuity portion
  → remaining cart gratuity = only plan gratuity (if any)
```

**Impact on Code**:
- `DiningGratuityCartControllerDelegateImpl.reviewHandleSwipeDeleteClick()` — must correctly identify plan vs non-plan item and cascade removal
- `processReceiptedFeesAndTips()` — recalculation after removal must correctly split gratuity
- `GetFeeValueFromDiningPlanUseCaseImpl` — recalculates the plan-attributable gratuity portion after cart changes
- The "return to refund page" for uncovered gratuity likely means updating `ItemStatus` back to `AvailableToRefund` for that fee line

**Bug-Prone Area**: The transition between gratuity states when items are removed one-by-one in a mixed cart (plan + non-plan). The recalculation in `processReceiptedFeesAndTips()` removes ALL fees then re-adds — if the state determination (`getGratuityDiningOnFee()`) is stale or recalculated incorrectly after partial removal, gratuity can disappear or show wrong amounts.

### 15.3 GLB_EPIC_Design — Receipt Display Rules for DDP Refunds

**Subtask Scope**: Guest Copy receipt must never show dollar values for plan-covered items. Store Copy shows full values.

**Business Rule**: Guest Copy of a DDP receipt hides item prices for plan-covered items. Totals only reflect monetary tender amounts (cash, credit, etc.), not entitlement point values.

**Receipt Behavior Matrix**:

| Copy Type | Plan-Covered Items | Non-Plan Items | Total/Refund Amount |
|-----------|-------------------|----------------|---------------------|
| **Store Copy** | Shows dollar value | Shows dollar value | Full amount (all tenders) |
| **Guest Copy** | NO price shown | Shows dollar value | Only monetary tender amounts |

**Acceptance Criteria — All Combinations**:

| # | Scenario | Guest Copy Total Shows |
|---|----------|----------------------|
| 1 | Receipted Refund — DDP only | $0.00 or no total (no monetary tender) |
| 2 | Receipted Refund — DDP + Guest ID | Only Guest ID amount |
| 3 | Receipted Refund — DDP + Cash | Only Cash amount |
| 4 | Receipted Refund — DDP + Credit Card | Only Credit Card amount |
| 5 | Non-Receipted Refund — DDP only | $0.00 or no total |
| 6 | Non-Receipted Refund — DDP + Guest ID | Only Guest ID amount |
| 7 | Non-Receipted Refund — DDP + Cash | Only Cash amount |
| 8 | Non-Receipted Refund — DDP + Credit Card | Only Credit Card amount |

**Impact on Code**:
- `gc/receipts/` module — receipt template logic must check if item has `entitlementBlock` and suppress price on guest copy
- Receipt builder must filter out DDP tender amounts from totals on guest copy
- Applies to BOTH receipted and non-receipted refund receipt generation

**Key Code Location**: `gc/receipts/src/` — look for receipt formatters/builders that distinguish between store copy and guest copy. The condition is likely based on `isGuestCopy` flag combined with checking `EmmaItemExtension.entitlement == true` per line item.

### 15.4 FOH | Investigate Retail Cart Tax Calculation for Entitlement Items

**Subtask Scope**: Tax calculation bug investigation. Entitlement items not included in tax calculations correctly, causing incomplete tax values sent to Emma. Naive fix caused duplication.

**Problem Statement**:
- `retailCart.java` has tax calculation logic that **excludes** entitlement items from `subTotalTaxData`
- When the condition `!retailCartItem.getOrderItem().getHasEntitlement()` was removed (to include entitlement items), it caused **duplicated tax values** during `subTotalTaxData.add(originalTaxSubTotalTaxData)`
- This means entitlement item taxes are being calculated elsewhere and the naive inclusion double-counts them

**Root Cause Hypothesis**:
The tax for entitlement items is likely already included via `originalTaxSubTotalTaxData` (which captures the original order's tax data). Adding them again through the regular item iteration creates duplication. The architecture separates:
1. **Regular items**: tax calculated from cart item prices during iteration
2. **Entitlement items**: tax carried over from the original order data (since the "price" for DDP items is points, not dollars, but tax was applied to the dollar value at sale time)

**Key Code Location**: `retailCart.java` (Java file in the cart/domain layer)

**Investigation Points**:
1. How `subTotalTaxData` is accumulated (loop over cart items)
2. How `originalTaxSubTotalTaxData` is derived (from original order?)
3. The `getHasEntitlement()` guard — what it currently excludes
4. Where entitlement item tax should be incorporated for Emma without duplication
5. Whether `originalTaxSubTotalTaxData` already contains entitlement tax from the sale

**Impact on Refunds**:
- If tax is wrong, Emma receives incorrect amounts during `RefundReceiptedEntitlementsInteractor` → point reversal could be off
- Receipt totals (Store Copy) could show wrong tax breakdown
- This affects the `EntitlementRefundRequestBuilder.build()` which computes total amount including tax

**Relation to Other Subtasks**: Tax behavior rule from 15.1 states "Tax always stays with the items in a refund" — this investigation ensures that principle is correctly implemented in the cart math without duplication.

**Status**: Investigation ticket — findings documented in Confluence.

### 15.5 FWT Dependency for DDP Receipted Refunds

**Subtask Scope**: Feature flag dependency for Functional Walkthrough Testing.

**Requirement**: The feature flag `isRemoveDinningPlanGratuityEnabled` **must be enabled** in the environment before FWT can proceed.

**Implication for Bug Analysis**: If this flag is OFF in a test environment, all the DDP gratuity removal validation logic (NONE/PARTIAL/TOTAL states, popup behavior, cart footer display) will be **bypassed**. Bugs reported during testing where gratuity behaves unexpectedly should first verify this flag is enabled.

**Flag Details** (from Section 8):
- ID: `isRemoveDinningPlanGratuityEnabled`
- Related ticket: POS-14929
- When OFF: gratuity freely removable (old behavior)
- When ON: NONE/PARTIAL/TOTAL logic applies (new DDP refund behavior)

### 15.6 GLB | DDP Receipted Refunds Fail When Selecting Saved Tender (BUG — FIXED)

**Type**: Bug (found during POS-2270 testing)
**Status**: Fixed (via POS-18598), verified passing on build post-fix
**Build Found**: 2.1.1.41573 | Venue: 0816 | Login: 0816T | Env: Latest

**Problem**:
- When selecting the **saved tender** (cached DDP tender at top of payment screen) for a DDP receipted refund, the refund fails with an error message (online) or simply does nothing (offline)
- After the failed saved tender attempt, the non-saved DDP option also becomes unavailable offline

**Steps to Reproduce**:
1. Enable `isRemoveDinningPlanGratuityEnabled` in dev tools
2. Login to WDW Store (e.g., 0816)
3. Have a closed check paid with DDP
4. Refund icon → scan check or select from all orders
5. Select refund all or a DDP item/group
6. On tender screen → tap the **saved tender** at top

**Root Cause**: Fixed by POS-18598 (blocked this ticket). The saved tender path likely had a missing or incorrect parameter when invoking `RefundReceiptedEntitlementsInteractor` — the cached tender reference wasn't being correctly mapped to the Emma API call.

**Impact on Code**:
- `PaymentUtil.getPaymentTendersForOriginalRefundSorted()` — saved vs non-saved tender distinction
- The "saved tender" is the cached package plan payment from the original order
- `RefundReceiptedEntitlementsInteractor` — must handle both saved (cached) and non-saved (media scan) paths
- Offline path: `entitlementReservationProcessor` offline limit check was also affected

**Regression Risk**: If payment tender caching logic changes or the mapping between saved tenders and Emma API parameters is altered, this bug could resurface. The offline fallback path is independently fragile.

### 15.7 GLB | Completing Order Fully with DDP Makes Package Plan Tender Unusable in Further Transactions (BUG — FIXED)

**Type**: Bug (found during POS-2270 testing)
**Status**: Fixed (no longer reproducible as of build 2.1.1.43113)
**Build Found**: 2.1.1.41573 | Venue: 0816 | Login: 0816T | Env: Latest

**Problem**:
- After completing an order paid **fully** with DDP, attempting a receipted refund and selecting "Package Plan" tender does **nothing** (app loads briefly, then no action)
- This persisted for that check even after closing and re-scanning the refund flow
- Affected both receipted and non-receipted refund scenarios
- Reproduced with all 4 DDP plan options

**Steps to Reproduce**:
1. Enable `isRemoveDinningPlanGratuityEnabled`
2. New check → add DDP items → checkout with Package Plan tender
3. Close check → scan for refund (or stay in refund mode)
4. Select items → checkout → tap Dining Plan option on tender screen
5. **Nothing happens**

**Root Cause**: Likely related to POS-18598 fix (same family of bugs). The package plan tender state was being corrupted or marked as "consumed" after the initial full-DDP payment, making it unavailable for subsequent refund operations. The tender's available balance was probably being set to zero or the tender reference was becoming stale.

**Impact on Code**:
- `PaymentUtil.getPaymentTendersForOriginalRefund()` — the filter that skips "fully-refunded tenders (zero amount remaining)" may have incorrectly treated a full-DDP payment as already refunded
- `getPaymentTendersFilteredByDining()` — if the DINING tender was being excluded due to incorrect balance check
- `RefundReceiptedEntitlementsInteractor` — the tender lookup/validation before calling Emma API

**Regression Risk**: Any change to how tender balances are tracked post-checkout (especially for DDP-only orders) could resurface this. The distinction between "tender fully used for payment" vs "tender fully refunded" is the likely confusion point.

### 15.8 FOH | UI: Gratuity Covered and Uncovered Removal from Cart

**Subtask Scope**: Popup behavior when user clicks "X" on gratuity in cart. Distinguishes plan-covered vs non-plan gratuity removal.

**Venue Type**: TSR (Table Service Restaurant)

**Pre-condition**: EAS `includesGratuity` flag = `true`

**Acceptance Criteria**:

| AC | Scenario | User Action | Expected Result |
|----|----------|-------------|-----------------|
| AC1 | Gratuity COVERED by plan | Refund a Meal plan item → open cart → click "X" on gratuity | Popup: "Gratuity is included with the plan items and can't be removed separately. Remove the items to remove the gratuity." + "OK" CTA |
| AC2 | Gratuity NOT covered by plan | Refund a non-plan item → open cart → click "X" on gratuity | Gratuity is removed (no popup) |

**Code Mapping**:

```
User clicks "X" on gratuity
  → DiningGratuityCartControllerDelegateImpl.reviewHandleDeleteClick()
    → getGratuityDiningOnFee()
      → TOTAL (all gratuity is plan-covered):
          view.showUnableToRemoveFeeDueToPlanItems()
            → displays popup with R.string.unable_to_remove_fee_due_to_plan_items
            → "OK" button dismisses
      → NONE (no plan items in cart, all gratuity is non-plan):
          proceeds with normal delete → gratuity removed
      → PARTIAL (mix):
          see subtask 15.2 for split behavior
```

**Key Implementation Details**:
- Popup uses standard dimension for prompt and CTAs
- The string resource `R.string.unable_to_remove_fee_due_to_plan_items` holds the exact message text
- `GratuityDiningOnFee.TOTAL` state triggers the popup
- `GratuityDiningOnFee.NONE` state allows free removal
- Feature flag `isRemoveDinningPlanGratuityEnabled` must be ON for this logic to execute

### 15.9 FOH | UI: Gratuity Uncovered Removal Behavior — Cart (Mixed Scenarios)

**Subtask Scope**: Detailed gratuity removal behavior in mixed carts (plan + non-plan items). Covers removal from cart "X", removal from refund view, and button label transitions.

**Venue Type**: TSR

**Pre-condition**: EAS `includesGratuity` = `true`

**Acceptance Criteria**:

| AC | Scenario | Action | Expected Result |
|----|----------|--------|-----------------|
| AC1 | Non-plan gratuity removal (mixed cart) | Click "X" on gratuity when cart has plan + non-plan items | Only non-plan gratuity removed. Plan gratuity stays. |
| AC2 | Refund all → remove plan from refund view | Remove plan group from refund view after "Refund All" | Cart: only non-plan item remains. Gratuity = non-plan portion. Button: **"Clear"** |
| AC3 | Refund all → remove non-plan from refund view | Remove non-plan item from refund view after "Refund All" | Cart: only plan item remains. Gratuity = plan portion. Button: **"Refund"** |
| AC4 | Refund all → remove gratuity via "X" (mixed) | Click "X" on gratuity when both plan + non-plan in cart | Plan gratuity remains. Non-plan gratuity removed. Button in refund history: **"Refund"** |
| AC5 | Remove gratuity again after AC4 (only plan grat left) | Click "X" on gratuity again | Restriction popup shown. Gratuity value unchanged. |

**Gratuity Button Label Logic**:

| Cart State | Gratuity Button Label | Meaning |
|------------|----------------------|---------|
| Only non-plan gratuity in cart | **"Clear"** | Can be freely removed/cleared |
| Only plan gratuity in cart (or plan portion after partial removal) | **"Refund"** | Will be refunded with the plan tender |
| Mixed (plan + non-plan) | **"Refund"** (before X) → after X removes non-plan portion, stays **"Refund"** | Transitions through removal |

**State Transitions**:

```
Initial state (Refund All, mixed cart):
  Gratuity = plan_portion + non_plan_portion
  Button = "Refund"
  GratuityDiningOnFee = PARTIAL

After "X" on gratuity (AC4):
  Gratuity = plan_portion only
  Button = "Refund" (in refund history view)
  GratuityDiningOnFee = TOTAL

After second "X" attempt (AC5):
  → Popup: "Gratuity is included with the plan items..."
  Gratuity unchanged
  GratuityDiningOnFee = TOTAL (blocked)

After removing plan from refund view (AC2):
  Gratuity = non_plan_portion only
  Button = "Clear"
  GratuityDiningOnFee = NONE

After removing non-plan from refund view (AC3):
  Gratuity = plan_portion only
  Button = "Refund"
  GratuityDiningOnFee = TOTAL
```

**Impact on Code**:
- `DiningGratuityCartControllerDelegateImpl` — must correctly transition `GratuityDiningOnFee` state after each removal operation
- The button label ("Clear" vs "Refund") is driven by whether remaining gratuity is plan-covered or not
- `processReceiptedFeesAndTips()` recalculation must update the state correctly when items are removed from refund view (not just from cart)
- `RefundValidationDiningGratuitiesDelegateImpl.reviewFeeToRemoveItems()` — handles the transition from PARTIAL → TOTAL when non-plan portion is removed via "X"

**Bug-Prone Area**: The state transition PARTIAL → TOTAL after "X" removal. If `getGratuityDiningOnFee()` doesn't re-evaluate after the non-plan portion is removed, a second "X" tap might incorrectly allow removal instead of showing the popup.

### 15.10 FOH | Fix Refund Mapping in DSP Go

**Subtask Scope**: Fix mapping between refund service response and DSP Go's local database. Ensures refund data is accurately processed and stored.

**No CQE Testing Required** (developer-only fix)

**Two Parts**:

1. **Fix Refund Mapping**: Correct the parsing/mapping of the order/refund service response
2. **Modify DSP Go Database**: Update Room DB schema/fields to accommodate correct refund data structure

**Service Endpoint**:
```
GET /v5/admin/connect/order/deviceOrderId/{orderId}
  ?venueId={venueId}
  &vendorId={vendorId}
  &mode=retail
  &version=3.1
  &groupPaymentsByRrn=false
```
Example: `https://api.latest.dev-posr.wdprapps.disney.com/v5/admin/connect/order/deviceOrderId/D0852999925012313540045?venueId=1740&vendorId=290&mode=retail&version=3.1&groupPaymentsByRrn=false`

**Impact on Code**:
- `gc/api_activate/` — API client parsing of order/refund response
- `gc/repository_room/` — Room database entities and DAOs for refund data
- `gc/dataModel/` — data classes that map service response to domain models
- `RefundOrderConverter` — depends on correctly mapped order data to build display models

**Relation to Other Subtasks**: If the mapping is wrong, all downstream logic (entitlement grouping, gratuity calculation, tender availability) will operate on incorrect data. This is a foundational fix that other subtasks depend on.

**Key Parameters**:
- `groupPaymentsByRrn=false` — payments are NOT grouped by RRN (Retrieval Reference Number), meaning each payment is listed individually
- `version=3.1` — specific API version that includes entitlement/DDP data in the response

### 15.11 FOH | Create Feature Flag

**Subtask Scope**: Creation of the feature flag that gates all new DDP receipted refund functionality.

**Flag Name**: `isRemoveDinningPlanGratuityEnabled`

**Purpose**: Gates all new gratuity removal validation logic for DDP receipted refunds. When disabled, the app falls back to pre-POS-2270 behavior (gratuity freely removable, no plan grouping constraints).

**Note**: The flag name contains a typo ("Dinning" instead of "Dining") — this is intentional/historical and must be used as-is throughout the codebase.

### 15.12 FOH | UI: Gratuity Uncovered Removal Behavior — Cart Part 2 (Refund/Clear Actions)

**Subtask Scope**: Gratuity add/remove behavior when using "Refund" and "Clear" CTAs for plan and non-plan items. Gratuity is additive and must track which portion belongs to plan vs non-plan.

**Venue Types**: QSR, TSR, Merch

**Pre-condition**: EAS `includesGratuity` = `true`

**Acceptance Criteria**:

| AC | Scenario | Action | Expected Result |
|----|----------|--------|-----------------|
| AC1 | Refund plan | Click "Refund" on plan group | Plan items added to cart. Gratuity set to plan gratuity (or added to existing gratuity if items already in cart) |
| AC2 | Clear plan | Click "Clear" on plan group | All plan items removed. Plan gratuity value subtracted from cart gratuity |
| AC3 | Refund non-plan | Click "Refund" on non-plan item | Non-plan item added to cart. Gratuity set to non-plan gratuity (or added to existing) |
| AC4 | Clear non-plan | Click "Clear" on non-plan item | Non-plan item removed. Non-plan gratuity value subtracted from cart gratuity |
| AC5 | Clear all | Click "Clear all" | All items removed. Total gratuity removed entirely |

**Gratuity Accumulation Logic**:

```
Cart Gratuity = plan_gratuity_portion + non_plan_gratuity_portion

Refund plan:
  cart_gratuity += plan_gratuity_for_group
  
Clear plan:
  cart_gratuity -= plan_gratuity_for_group

Refund non-plan:
  cart_gratuity += non_plan_gratuity_for_item

Clear non-plan:
  cart_gratuity -= non_plan_gratuity_for_item

Clear all:
  cart_gratuity = 0
```

**Impact on Code**:
- `processReceiptedFeesAndTips()` — the "remove all → recalculate" pattern must correctly sum plan + non-plan portions based on which items remain in cart
- `GetFeeValueFromDiningPlanUseCaseImpl` — calculates plan gratuity portion (plan items subtotal × gratuity %)
- The gratuity is **additive** — adding a second group adds its gratuity on top of existing. This means the recalculation must consider ALL items currently in cart, not just the newly added ones.

**Bug-Prone Area**: The "or added to existing gratuity value if present" clause. If `processReceiptedFeesAndTips()` does a full "remove all + recalculate from scratch" on each add/remove, this should work correctly. But if it tries to incrementally add/subtract, rounding errors or missed items could cause discrepancies.

### 15.13 GLB | Refund All on DDP Not Adding Correct Quantities (BUG — CLOSED)

**Type**: Bug
**Status**: Closed (fix for related POS-19212 was discarded, no further action required)
**Related Bugs**: POS-19212 (consolidated items only add 1 plan), POS-19209

**Problem**:
- Order with multiple DDP items (e.g., Item 1 × 4 + Smart Water × 4 = 4 plans consuming 8 items)
- Click "Refund All" → cart displays **wrong quantities** for items

**Steps to Reproduce**:
1. Enable `isRemoveDinningPlanGratuityEnabled`
2. Add item + complementary DDP item (e.g., Item 1 + Smart Water)
3. Increase both to quantity > 1 (e.g., 4 each)
4. Complete order → consumes 4 plans covering all 8 items
5. Refund flow → "Refund All" → observe cart

**Root Cause Area**: `RefundOrderItemCombinationInteractor` — when processing "Refund All" with consolidated items (same product, multiple quantities across multiple entitlement groups), the `countPerSet` from `OrderItemCombination` may not correctly account for items that span multiple combo groups.

The issue is in how `buildEntitlementBlockMap()` groups items by `uuidCombinationKey` — when the same product appears in multiple combo groups with quantity > 1, the consolidation logic in `EntitlementsToCartInteractor.updateCartFromMaps()` (which merges by `entitlementCode + cartItemUuid`) may produce incorrect `countPerSet` values.

**Impact on Code**:
- `OrderItemCombinationUtils.buildEntitlementBlockMap()` — grouping by `uuidCombinationKey`
- `RefundOrderItemCombinationInteractor.execute()` — uses `countPerSet` to set `refundedQuantity`
- `CartItemSegmentSplitter` — if items were split during original sale, refund must respect those splits
- `RefundAllInteractor` — orchestrates the "Refund All" operation

**Regression Risk**: Any change to how quantities are tracked across multiple combo groups for the same product. Particularly when `EntitlementSet.referenceList` aggregates quantity for same-UUID items.

### 15.14 GLB | Refund Multiple Items with DDP Not Adding Correct Quantities (BUG — CLOSED)

**Type**: Bug
**Status**: Closed (same as 15.13 — fix for POS-19212 discarded, no further action)
**Related Bugs**: POS-19212, POS-19210

**Problem**:
- Order with multiple DDP items across multiple combo groups (e.g., 3× Item 5 + 2× Smart Water = 2 plans, 5 items total)
- Click "Refund" on two individual DDP groups → cart displays **wrong quantities**

**Difference from 15.13**: This is individual group refund (not "Refund All"), but same root cause — quantity tracking across consolidated items in multiple combo groups.

**Same Root Cause Area**: `RefundOrderItemCombinationInteractor` + `OrderItemCombinationUtils.buildEntitlementBlockMap()` when same product spans multiple combo groups with different quantities per group.

### 15.15 FOH | UI Modifications to Display Meal Plan Items and Non-Plan Items — Types of Plans

**Subtask Scope**: Core UI modification that separates plan items from non-plan items in the refund history screen, removes hardcoded DDP refund logic, and implements search/scan filtering.

**Out of Scope**: Payments tab, Merch items (separate ticket)

**Acceptance Criteria**:

| AC | Scenario | Expected Result |
|----|----------|-----------------|
| AC1 | Meal Plan items only | Plan items grouped by entitlement. One "Refund" CTA per group. |
| AC2 | Meal Plan + Non-Plan items | Sections separated: Plan items first (grouped), Non-Plan items after. Each has "Refund" CTA. |
| AC3 | Search/scan for item existing in multiple plans + non-plan | Item shown under EACH entitlement group it belongs to AND under non-plan section. User picks which to refund. |

**AC3 Deep Dive — Scan Filtering**:

Example: "Bottle of Water" sold in 3 contexts:
- As part of Meal Plan Entitlement 1 (with Burger + Soda)
- As part of Meal Plan Entitlement 2 (with Salad + Juice)
- As a Non-Plan item (paid with cash)

After scanning "Bottle of Water":
```
┌─ PACKAGE PLAN ─────────────────────┐
│ Entitlement 1 (DDP Meal)           │
│   🍔 Burger                        │
│   💧 Bottle of Water  ← highlighted│
│   🥤 Soda                          │
│   [REFUND GROUP]                   │
│                                     │
│ Entitlement 2 (DDP Meal)           │
│   🥗 Salad                         │
│   💧 Bottle of Water  ← highlighted│
│   🧃 Juice                         │
│   [REFUND GROUP]                   │
├─ NON PLAN ──────────────────────────┤
│   💧 Bottle of Water               │
│   [REFUND]                          │
└─────────────────────────────────────┘
```

The list is **filtered** to only show groups containing the scanned item. User selects which group/instance to refund following scan rules (not button rules).

**Key Requirements Implemented**:
1. **Remove hardcoded DDP refund** — old behavior gated behind feature flag
2. **Plan type display** — users see which plan type (Meal, Snack, etc.) each group belongs to
3. **Sorting**: Plan items first → Non-Plan items after
4. **Grouping**: Items sharing `comboGroupId` = 1 group with 1 "Refund" CTA
5. **Atomic refund**: All items in group refund together
6. **Atomic removal**: Removing one item from group removes all

**Impact on Code**:
- `RefundOrderConverter.mapToRefundOrderModel()` — separation into `dinningPlanItemsConverted` / `noPlanItemsConverted`
- `RefundOrderConverter.buildDinningPlanItems()` — grouping by `comboGroupId`
- `UniversalRefundOrderFragment.setItems()` — display ordering (plan first)
- `UniversalRefundOrderPresenter` — scan/search filtering logic that matches item across multiple groups
- `RefundOrderTopItemDinningPlanDelegate` — renders grouped plan items with plan name header

### 15.16 FOH | UI: All Related Item References Added/Removed from Cart as a Group (No Gratuity)

**Subtask Scope**: Cart display after clicking "Refund" CTA. Items appear grouped in cart. Gratuity logic is OUT OF SCOPE (handled in separate ticket POS-13421).

**Out of Scope**: Gratuity display logic, terminal revenue report

**Acceptance Criteria**:

| AC | Scenario | Expected Result |
|----|----------|-----------------|
| AC1 | Cart update — Meal plan items | After "Refund" CTA, cart shows meal plan items grouped by entitlement |
| AC2 | Cart update — Non-plan items | After "Refund" CTA, cart shows non-plan items grouped by tender |

**Core Rules Reiterated**:
- Entire entitlement refunded in whole → all items added to cart together
- Selecting one item → all grouped items added
- Removing one item → all grouped items removed
- Payment ordering: plan tenders first, then other original tenders

**Impact on Code**:
- `RefundOrderItemCombinationInteractor.execute()` — adds all items from `OrderItemCombination.checkoutCartItems` to cart
- `DiningGratuityCartControllerDelegateImpl.reviewHandleSwipeDeleteClick()` → `checkForPlanItems()` → removes entire group
- Cart adapter/renderer must visually group items under their entitlement (plan items) or tender (non-plan items)

**Relationship**: This is the base cart behavior ticket. Subtasks 15.1, 15.2, 15.8, 15.9, 15.12 add gratuity logic ON TOP of this grouping behavior.

### 15.17 FOH | Refund Flow Meal Plan + Non-Plan Items, Removal and Checkout

**Subtask Scope**: End-to-end refund flow covering grouping, cart removal, and checkout for all DDP scenarios. Applies to QSR, TSR, and Merch venues.

**Out of Scope**: Offline validation, Magic Band flux

**Pre-condition**: EAS `includesGratuity` = `true`

**Acceptance Criteria**:

| AC | Scenario | Expected Result |
|----|----------|-----------------|
| AC1 | Sort & Grouping | Select any item from entitlement → all items in that entitlement auto-group and add to cart |
| AC2 | Removing items from cart | Remove any item from group → entire group removed. No partial entitlement refunds allowed. |
| AC3 | DDP 1 Snack (Merch) | Refund single snack item → processes according to package plan |
| AC4 | DDP 1 Meal (Entree + Drink) | Refund any part of meal → groups Entree + Drink → refunds entire meal to plan |
| AC5 | DDP 1 Meal + 1 Snack (separate entitlements) | Refund both → meal grouped together, snack handled separately |
| AC6 | DDP 2 Meals + 1 Snack + 1 Non-Plan | Refund all → DDP meals grouped per entitlement, snack separate, non-plan item last |
| AC7 | 3 Meals + Non-Plan + 18% Gratuity (partially covered) | Plan items refunded to plan first → non-plan items + remaining gratuity to original tenders |

**Checkout Payment Ordering** (reinforced by AC7):
```
1. Package plan items → refund to DINING tender (first)
2. Non-plan items → refund to original non-plan tenders
3. Remaining gratuity (uncovered) → refund to original tenders
```

**E2E Flow for AC6 (Most Complex)**:
```
Order: 2 Meals (each Entree+Drink) + 1 Snack + 1 Non-Plan

Refund View:
  PACKAGE PLAN:
    ├── DDP Meal 1: Entree A + Drink A [REFUND]
    ├── DDP Meal 2: Entree B + Drink B [REFUND]
    └── DDP Snack: Cookie [REFUND]
  NON PLAN:
    └── Juice Box [REFUND]

After "Refund All" → Cart:
  ├── Entree A
  ├── Drink A
  ├── Entree B
  ├── Drink B
  ├── Cookie
  └── Juice Box

Checkout → Tenders:
  1. DINING (Package Plan) — covers Entree A+Drink A, Entree B+Drink B, Cookie
  2. Original tender — covers Juice Box
```

**Impact on Code**:
- `RefundReceiptedItemFlow.handleNormalItemReturn()` — branching for each item type
- `RefundOrderItemCombinationInteractor` — atomic group add for meals
- `PaymentUtil.getPaymentTendersForOriginalRefundSorted()` — DINING first
- `RefundReceiptedEntitlementsInteractor` — processes plan refund via Emma API
- Standard payment flow — processes non-plan refund

### 15.18 FOH | Refund Flow Meal Plan + Non-Plan Items, Removal and Checkout (Magic Band)

**Subtask Scope**: Same E2E refund flow as 15.17 but specifically for **Magic Band tender**. Other tender types handled in POS-14066.

**Venue Types**: QSR, TSR, Merch

**Out of Scope**: Offline validation

**Key Difference from 15.17**: This ticket covers the Magic Band media path for DDP refunds. Magic Band is the physical wearable that stores DDP entitlement data — the refund flow uses the band's KTTW (Key To The World) value to identify the guest and reverse entitlement points.

**ACs**: Same as 15.17 (AC1–AC7) but executed with Magic Band as the entitlement media.

**Impact on Code**:
- `RefundReceiptedEntitlementsInteractor.invoke(kttwValue, retailCart)` — the `kttwValue` parameter comes from the Magic Band scan
- For **cached/receipted** refunds: KTTW value is stored in the order data, so no re-scan needed
- For **non-cached** refunds: user is prompted to scan Magic Band to obtain KTTW
- `EntitlementRefundRequestBuilder.build(kttwValue, retailCart)` — includes KTTW in Emma API request

**Magic Band Flow**:
```
Receipted (cached):
  KTTW from order → auto-refund → no band scan needed

Non-receipted (non-cached):
  Prompt "Scan Magic Band" → read KTTW → proceed to Emma flow
```

### 15.19 EMMA Error Screen Displayed When Removing Item from Refund Cart (BUG — FIXED)

**Type**: Bug
**Status**: Fixed & verified (CQE Pass on build 2.1.1.38345, TSR WDW 0835)
**Blocks**: POS-14066

**Problem**:
- Adding items to refund cart → attempt to remove one item → app redirects to **EMMA error screen**
- Blocks entire refund flow — user cannot continue transaction

**Root Cause Area**: The item removal path was incorrectly triggering an Emma API call (likely `RefundReceiptedEntitlementsInteractor` or `couponChargeService`) when it should have simply removed the item from the local cart. The removal action was being treated as a refund execution rather than a cart modification.

**Impact on Code**:
- `DiningGratuityCartControllerDelegateImpl.reviewHandleSwipeDeleteClick()` — must only modify local cart state, NOT trigger Emma API
- The distinction between "remove from cart" (local) vs "process refund" (API call) was being conflated
- The Emma error screen is shown when `couponChargeService.execute()` fails — this should never be called during item removal

**Lesson for Future Bugs**: If EMMA error screen appears unexpectedly, check if an Emma API call is being triggered in a code path that should be cart-only (local). The `RefundReceiptedEntitlementsInteractor` should ONLY be called during checkout/payment, never during cart manipulation.

### 15.20 FOH | UI: Validate Offline Behavior and CAP Payload

**Subtask Scope**: Validate that DDP receipted refunds work correctly offline and that the CAP (Central Audit Platform) payload is correctly stored and sent when the device reconnects.

**Out of Scope**: Online behavior

**Acceptance Criteria**:
1. Offline refund action works as expected
2. Data intended for CAP is stored on device when offline
3. When device goes back online, data is sent to CAP without data loss
4. CAP payload currently contains all information attached to the refund action

**Key Assumptions**:
- DSP can process refunds **without EMMA** by refunding the entire entitlement point value for the charge group
- When 1 item from a DDP meal is refunded → entire meal + full amount is refunded (validated in EJ — Electronic Journal)
- When a DDP item is selected → complete meal is refunded as well

**Risks Identified**:
- Adding a new flag in database for the item to identify the group of payment/plan type

**Dependencies**: POS-7692 (design of new refund screen)

**Impact on Code**:
- `RefundReceiptedEntitlementsInteractor` → offline path: when `couponChargeService.execute()` fails, checks venue offline dining refund allowance
- `entitlementReservationProcessor` — stores offline refund data locally
- CAP/audit module (`gc/audit/`) — must include entitlement refund data in payload
- Room DB (`gc/repository_room/`) — stores pending CAP payloads for sync when online
- The offline flow skips Emma API entirely and relies on local entitlement point value from the original order's `CheckoutEntitlementBlock`

**Offline Refund Flow**:
```
Device offline → user initiates DDP refund
  → RefundReceiptedEntitlementsInteractor detects offline
  → checks venue offline limit (max refunds allowed offline)
  → if within limit: processes locally, stores in DB
  → if exceeded: shows error, blocks refund
  → when back online: syncs stored refund to CAP + Emma
```

### 15.21 DDP Receipted Refunds — Display DDP Associated Details for Covered Items and Modifiers

**Subtask Scope**: Display entitlement type/plan details alongside items in the refund view so cast members can identify the correct items to refund. Also enables independent modifier refunding.

**Business Rules**:
1. Show package plan TYPE for each item/group (so user knows what entitlement was used)
2. Package Plan items sorted first, other tenders after
3. Multiple items on same plan type → grouped with single "Refund" CTA
4. Entitlements refunded in whole (all items in group together)
5. Adding one item from group → all added to cart
6. Removing one item from group → all removed from cart
7. Payment: plan tenders first, then remainder to other original tenders

**New Capabilities**:
- **Independent modifier refunding**: Non-DDP modifiers can be refunded individually (e.g., guacamole charged incorrectly)
- **Same item, multiple tenders prompt**: When same item appears in multiple entitlements or mixed payment methods, user is prompted to select which instance

**Display Requirements**:
```
Refund View:
  PACKAGE PLAN:
    ├── DDP Meal (plan type shown)
    │   ├── Burger (parent)
    │   │   └── Guacamole (DDP-covered modifier → refunds with parent)
    │   ├── Soda
    │   └── [REFUND GROUP]  ← single CTA
    │
    ├── DDP Snack (plan type shown)
    │   ├── Cookie
    │   └── [REFUND GROUP]
    │
  NON PLAN:
    ├── Side Fries
    │   └── Extra Cheese (non-DDP modifier → independently refundable)
    ├── [REFUND]  ← individual CTA for item
    └── [REFUND]  ← individual CTA for modifier
```

**Modifier Handling Rules**:
- **DDP-covered modifiers**: Under parent item, returned WITH parent as part of entitlement group
- **Non-DDP modifiers**: Shown in Non-Plan section with own refund value, selectable independently

**Same-Item Disambiguation**:
When "Side Fries" was sold as:
- Part of QSR Meal (DDP entitlement 1)
- As a Snack (DDP entitlement 2)
- As Non-Plan (cash)

→ Prompt user to select WHICH instance to refund. Each shows its entitlement context.

**Impact on Code**:
- `RefundOrderConverter.mapGroupedItemsToRefundItemDinningPlan()` — builds modifier tree per plan item
- `RefundOrderConverter.getModifierByPlan()` — separates DDP-covered vs non-DDP modifiers
- `RefundOrderTopItemDinningPlanDelegate` — renders plan type header + grouped items + modifiers
- `UniversalRefundOrderPresenter` — handles disambiguation prompt when same item in multiple contexts
- `RefundReceiptedItemFlow` — modifier-level refund path (when `refundingModifiersEnabled` flag is ON)

### 15.22 FOH | UI: Gratuity Covered and Uncovered Removal from Cart Part 2 (Spike)

**Subtask Scope**: Spike/investigation for the specific scenario where user has BOTH plan and non-plan items + explicitly added gratuity to cart, then attempts removal. Combines the explicit gratuity refund CTA with the "X" removal behavior.

**Venue Types**: QSR, TSR, Merch

**Pre-condition**: EAS `includesGratuity` = `true`

**Key Scenario Difference from 15.8**: Here the user has explicitly clicked "Refund" CTA on the gratuity line (adding it to cart), THEN tries to remove it via "X". This is the explicit-add-then-remove flow.

**Acceptance Criteria**:

| AC | Scenario | Action | Expected Result |
|----|----------|--------|-----------------|
| AC1 | Mixed cart (plan + non-plan + gratuity explicitly added) | Click "X" on gratuity | Uncovered (non-plan) gratuity returns to refund page. Covered (plan) gratuity remains in cart. |
| AC2 | Plan-only cart (plan items + gratuity) | Click "X" on gratuity | Popup: "Gratuity is included with the plan items and can't be removed separately. Remove the items to remove the gratuity." + "OK" |

**Flow for AC1**:
```
User journey:
  1. "Refund" CTA on Meal Plan → plan items + plan gratuity auto-added to cart
  2. "Refund" CTA on Non-Plan item → non-plan item added to cart
  3. "Refund" CTA on Gratuity line → non-plan gratuity explicitly added to cart
  4. Open cart → see total gratuity (plan + non-plan portions)
  5. Click "X" on gratuity:
     → Non-plan gratuity removed from cart, returns to refund page
     → Plan gratuity stays (non-removable)
```

**Impact on Code**:
- `FeeRefundContext.explicitlyRefundedFeeUids` — tracks which fees were explicitly added by the user via "Refund" CTA
- `IsFeeInCartUseCaseImpl` (PARTIAL state) — uses `explicitlyRefundedFeeUids` to determine what's removable vs what's plan-locked
- When "X" is clicked: only the explicitly-added non-plan portion is removed; the auto-added plan portion is protected

### 15.23 FOH | Adding Different Payment Types to Store Plan Type for Entitlement Group Identification (Spike)

**Subtask Scope**: Investigation spike — understand how payment/plan types are stored, how to identify entitlement groups (Snack, TSR Meal, etc.), and how to name refund buttons accordingly.

**Type**: Spike / Investigation (documented in Confluence)

**Key Questions Answered**:
1. **Where is plan type stored?** → `EmmaResponsePlanUsage.couponCode` (e.g., "SN" for Snack, "ML" for Meal) + `diningPlanName` (display name)
2. **How are items grouped by plan?** → Items share a `comboGroupId` within a `planUsage` entry. The `couponCode` determines the plan TYPE.
3. **Meal Plan vs Non-Plan distinction** → Items with `entitlementBlock != null` are plan items; items without are non-plan
4. **Refund button naming** → Uses `diningPlanName` from `EmmaResponsePlanUsage` (e.g., "DDP 1 Meal", "DDP 1 Snack")

**Plan Type Mapping**:

| Coupon Code | Plan Type | Display Name Example |
|-------------|-----------|---------------------|
| `ML` | Meal | "DDP 1 Meal (Entree + Drink)" |
| `SN` | Snack | "DDP 1 Snack" |
| `QS` | Quick Service | "QSR Meal" |
| `TS` | Table Service | "TSR Meal" |

**Data Flow**:
```
Emma Response → planUsage.couponCode + planUsage.diningPlanName
  → stored in CheckoutEntitlementBlock.couponCode
  → stored in EmmaItemExtension.couponCode
  → used by RefundOrderConverter to build section headers
  → displayed on RefundOrderTopItemDinningPlanDelegate as group title
```

**Impact on Code**:
- `RefundOrderConverter.buildDinningPlanItems()` — uses `diningPlanName` for group display name
- `RefundOrderTopItemDinningPlanViewModel` — holds plan name for rendering
- `CheckoutEntitlementBlock.couponCode` — persisted identifier for plan type

### 15.24 FOH | DDP Coupon Should Be Returned to Guest on Item Refund (Spike)

**Subtask Scope**: Spike to clarify that when a DDP item is refunded, the entitlement coupon (points) are returned to the guest's plan balance. Also validates Emma response data for button display naming.

**Type**: Spike / Investigation (documented in Confluence)

**Core Behavior**: When a DDP item is refunded → the coupon/entitlement points are **returned to the guest** (reversed in Emma). The guest regains the meal/snack credit on their plan.

**Implementation**: `RefundReceiptedEntitlementsInteractor` → `couponChargeService.execute()` reverses the charge → `entitlementReservationProcessor.updateBalanceAfterRedemption()` updates the guest's available balance.

**Validation Scenarios (Emma Response)**:

| Scenario | Refund Action | Expected Emma Behavior |
|----------|--------------|----------------------|
| 1 Adult Meal + 1 Child Meal | Refund only Adult Meal | Adult Meal coupon returned. Child Meal unaffected. |
| 2 Adult Meals | Refund only 1 Adult Meal | 1 coupon returned. Other meal untouched. |
| 3 DDP snacks (2 DDP + 1 Cash) | Refund 1 DDP snack | 1 snack coupon returned. Cash snack and other DDP snack unaffected. |
| 1 Adult Meal (incl. water) + 1 Snack water + 1 Cash water | Refund Adult Meal | Meal coupon returned (includes the water). Snack water and Cash water unaffected. |

**Button Display Name Validation**:
- Verified that Emma response provides `diningPlanName` (e.g., "QSR Meal 1") in `planUsage`
- This value is used to populate the refund button/section header
- Button shows the plan type name from Emma, not a hardcoded string

**Key Point for Bug Analysis**: If after a refund the guest's balance doesn't reflect the returned coupon, check:
1. `couponChargeService.execute()` — did the API call succeed?
2. `entitlementReservationProcessor.updateBalanceAfterRedemption()` — was the local balance updated?
3. Offline scenario: was the refund queued for sync?

---

## 16. Source Code Verification Notes (2026-06-25)

Final validation against current codebase confirmed document alignment. Key implementation details verified:

### Confirmed Behaviors
- ✅ Branching: `orderItem.entitlementBlock != null && orderItem.entitlementBlock!!.itemCombinationKey.isNotEmpty()`
- ✅ Item matching: `cartItem.entitlementBlock?.entitlementGroupList?.contains(comboGroupId) == true`
- ✅ Order mutation: `order.cartList = ArrayList(split)` with explicit comment: "Intentional mutation"
- ✅ DINING position 0 only in `getPaymentTendersForOriginalRefundSorted()` (refund flow), position 7 in normal payment flow
- ✅ `reconcileLineTaxToCartTotal()` with `MAX_RECONCILE_RESIDUAL = 0.05`
- ✅ `FeeRefundContext` has all 6 documented fields with correct defaults
- ✅ `processedParentOrderIds` de-duplication requires all 3 conditions: flag ON + already processed + has entitlement block

### Subtle Implementation Details Not Previously Documented

| Detail | Location | Note |
|--------|----------|------|
| Cart fees stored as negatives | `retailCart.java` | Refund fees have negative `calculatedValue`; `GetGratuityDiningFromOrderAndCartUseCaseImpl` multiplies `feeFromDining` by -1 for comparison |
| Entitlement total formula | `retailCart.java calculateCartTotals()` | `entitlementTotal = entitlementSubtotal + entitlementTax + fee` (tip NOT included) |
| NONE case returns all fees | `GetOrderFeesForRefundUseCaseImpl` | When `idsRetailCartFees` is empty, returns ALL `initialOrderFees` unfiltered |
| Swipe-delete no refund mode gate | `DiningGratuityCartControllerDelegateImpl` | `reviewHandleSwipeDeleteClick()` does NOT check `cartProxy.isRefundMode` unlike `reviewHandleDeleteClick()` — potential edge case if swipe-delete is triggered outside refund mode |
| processedParentOrderIds accumulates always | `RefundReceiptedItemFlow` | `.add(groupId)` called unconditionally even when flag is disabled (no functional impact since guard also requires flag) |
| TOTAL vs PARTIAL fee difference | `GetOrderFeesForRefundUseCaseImpl` | TOTAL **mutates** the fee's `calculatedValue` to plan value; PARTIAL does NOT mutate |
| Split converter only runs with flag ON | `RefundOrderConverter` | `RefundDiningPlanSplitItemsConverter` only called when `IsRemoveDinningPlanGratuityEnabled` is enabled |

---

*Document generated: 2026-06-24 | Updated: 2026-06-25 | Verified against source code: 2026-06-25*
