# POS-1478: Bundling - Item Sets Promotion

## Quick Reference

| Field | Value |
|-------|-------|
| Ticket | POS-1478 |
| Feature | New promotion template "Buy Items for $Y (Bundling - Item Sets)" supporting final cost and percent off |
| Module | `gc/AppetizeActivate` (discounts/bundling), `gc/dataModel` (reduction models), `gc/repository` (data access) |
| Entry Point | `ReductionItemSetInteractor` (item selection) → `ReductionItemSetProcessor` (cart processing) |
| Discount Types | `buy_quantity_itemset_for_final_cost_item`, `buy_quantity_itemset_get_percent_off_item` |
| Scope | DSP Go discount application, display, and checkout payload generation |

---

## 1. Feature Overview

A new bundling promotion template that uses Item Sets to determine trigger/reward groups. The promotion automatically pulls Item Set assignments from a parent item and distributes the discount proportionally across parent + modifiers based on their relative cost.

### Business Context

Used for Bibbidi Bobbidi Boutique (BBB) salon transformations. A parent package item has modifiers (crown, wand, makeup, etc.) grouped via Item Sets. The promotion triggers when the required quantity of the parent item is in the cart, then distributes the discount across all items/modifiers.

### Two Discount Modes

| Mode | Type Constant | Behavior |
|------|---------------|----------|
| Final Cost ($) | `buy_quantity_itemset_for_final_cost_item` | Sets the total bundle price to a fixed amount; discount = originalCost - finalCost, distributed proportionally |
| Percent Off (%) | `buy_quantity_itemset_get_percent_off_item` | Applies a percentage discount to parent + all modifiers individually |

### Business Rules Summary

1. Trigger: Cart must contain N quantity of the parent item (N = trigger quantity from back office config)
2. The discount auto-applies (`auto_apply = true` expected for BBB promotions)
3. Discount cascades to ALL modifiers (`cascadeDiscountToAllModifiers = true` always for these types)
4. Items with $0 price get $0 discount; non-zero items get proportional share
5. Rounding configurable per reduction (Standard/Up/Down/Truncate)
6. Multiple trigger blocks supported (e.g., buy 2 required → 4 items = 2 blocks applied)

### API Payload Shape (from Back Office)

```json
{
  "type": "buy_quantity_itemset_for_final_cost_item",
  "rewards": [{ "level": "item", "type": "finalCost", "value": "144.0000", "aggregate_value": true }],
  "triggers": [{ "level": "item", "type": "quantity", "value": "1.0000", "aggregate_value": true,
    "targets": [{ "level": "item", "target_ids": [712491] }]
  }],
  "cascade_discount_to_all_modifiers": true
}
```

For percent off: `"type": "buy_quantity_itemset_get_percent_off_item"` with `rewards[0].type = "percentOff"` and `rewards[0].value = "20.0000"`.

---

## 2. Architecture & Data Flow

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: ITEM SELECTION (ModsWizard)                                           │
│  ModsWizardPresenter → ReductionItemSetInteractor.execute(item)                 │
│    ├── findItemSetReduction() → ReductionItemSetRepository (DB lookup)          │
│    ├── buildChildReductionMap() → proportional cost calculations per modifier   │
│    ├── addParentNodeIfNeeded() → includes parent in map (percent mode only)     │
│    └── buildParentReductionData() → sets item.reductionItemSetData              │
└────────────────────────────────────┬────────────────────────────────────────────┘
                                     │ item added to cart with reductionItemSetData
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: CART PROCESSING (RetailCart recalculation)                             │
│  ReductionsProcessor.gatherLinkAndCombineReductions()                           │
│    └── ReductionItemSetProcessor.processAndApplyRulesReductionItemSet(cart)      │
│         ├── evaluateItemSetTriggerStates() → DiscountItemSetTriggerEvaluator    │
│         ├── resetItemSetLineDiscounts() → clears previous line values           │
│         └── allocateItemSetDiscountAcrossLines() → computes per-line amounts    │
└────────────────────────────────────┬────────────────────────────────────────────┘
                                     │ discount amounts stored in ReductionItemSetLineDiscount
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: CHECKOUT PAYLOAD GENERATION                                           │
│  CheckoutReductionBuilder.convertFromItemSetReduction()                         │
│    → Produces CheckoutReduction objects for parent + each child modifier        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Trigger Evaluation Logic (DiscountItemSetTriggerEvaluator)

1. Filter cart items: not voided, has reduction, has reductionItemSetData, is itemset type
2. Group by `ItemSetTriggerKey(reductionId, parentItemId)`
3. Per group: sum quantities → divide by triggerQuantity (floor) = `appliedBlockCount`
4. `qualifiedQuantity` = appliedBlockCount × triggerQuantity
5. `nonQualifiedQuantity` = currentQuantity - qualifiedQuantity
6. `isTriggered` = qualifiedQuantity > 0

### Discount Allocation (ReductionItemSetProcessor)

After trigger evaluation, items are grouped by `ItemSetGroupKey(reductionId, parentItemId)`, sorted by `cartPosition`, then discount distributed in order:

**For Percent Off:**
```
lineDiscountAmount = (unitPrice × lineAppliedQuantity) - calculateCostOfItemSetUsingPercentCost(percentOff, unitPrice × lineAppliedQuantity)
```

**For Final Cost:**
```
totalDiscount = (unitPrice × triggerQty × appliedBlocks) - (finalCost × appliedBlocks)
discountPerUnit = totalDiscount / (triggerQty × appliedBlocks)
lineDiscountAmount = discountPerUnit × lineAppliedQuantity
```

---

## 3. Key Files

### Models & Data

| File | Purpose |
|------|---------|
| `gc/dataModel/.../reduction/Reduction.java` | Main entity. Constants: `REDUCTION_QUANTITY_ITEMSET_FINAL_COST`, `REDUCTION_QUANTITY_ITEMSET_PERCENT_COST`. Fields: `isItemSetFinalCost`, `isItemSetPercentCost`, `totalItemSetFinalCost`, `totalItemSetPercentCost`, `cascadeDiscountToAllModifiers` |
| `gc/dataModel/.../reduction/ReductionItemSetData.kt` | Per-item state: parentItemId, costs, child maps, mutable trigger state & line discount |
| `gc/dataModel/.../reduction/bundling/ReductionItemSetTriggerState.kt` | Mutable trigger progress: `triggerQuantity`, `currentQualifiedQuantity`, `currentCartQuantity`, `appliedBlockCount`, `appliedQuantity`, `nonAppliedQuantity`, `isTriggerSatisfied`, `missingQuantity` |
| `gc/dataModel/.../reduction/bundling/ReductionItemSetLineDiscount.kt` | Mutable line state: `lineAppliedQuantity`, `lineDiscountAmount`, `shouldShowLineDiscount`, `lineNonAppliedQuantity` |
| `gc/dataModel/.../reduction/ReductionUtilKt.kt` | `calculateCostOfItemSetUsingTotalCost()`, `calculateCostOfItemSetUsingPercentCost()`, `getRoundingMode()` |

### Business Logic

| File | Purpose |
|------|---------|
| `gc/AppetizeActivate/.../modswizard/main/ReductionItemSetInteractor.kt` | Orchestrates item-set reduction lookup + child/parent data setup during item selection |
| `gc/AppetizeActivate/.../retail/app_manager/retail/ReductionItemSetProcessor.kt` | Cart-level 3-step processing: evaluate triggers → reset lines → allocate discounts |
| `gc/AppetizeActivate/.../modswizard/main/discounts/DiscountItemSetTriggerEvaluator.kt` | Groups cart items and determines trigger satisfaction per (reductionId, parentItemId) |
| `gc/AppetizeActivate/.../modswizard/main/discounts/bundling/ItemSetReductionExtensions.kt` | `ItemSetReductionType` enum, `extractTriggerQuantity()`, `buildReductionItemSetData()`, `calculateChildReducedAmount()`, `calculateParentReducedAmount()` |
| `gc/AppetizeActivate/.../retail/app_manager/retail/ReductionsProcessor.kt` | Main cart reduction orchestrator; calls `ReductionItemSetProcessor` |

### Repository / Data Access

| File | Purpose |
|------|---------|
| `gc/repository/.../reduction/itemset/ReductionItemSetRepository.kt` | Interface: `findReductionForItem(venueId, vendorId, itemId, isAutoApply)` |
| `gc/repository/.../reduction/itemset/ReductionItemSetRepositoryImpl.kt` | Queries ReductionDao + TriggerTargetDao, filters by itemset types, matches target_ids to item |
| `gc/repository/.../item/set/ItemSetRepositoryImpl.kt` | Item Set persistence & retrieval |
| `gc/repository_room/.../reduction/ReductionEntity.kt` | Room entity with `cascadeDiscount` field |

### Checkout Integration

| File | Purpose |
|------|---------|
| `gc/dataModel/.../checkout/CheckoutReductionBuilder.kt` | `convertFromItemSetReduction()` → builds CheckoutReduction for order payload (parent + children) |
| `gc/AppetizeActivate/.../entity/checkout/CheckoutItemPurchaseExtensions.kt` | Includes item-set discounts when building checkout items |

### Cart / UI

| File | Purpose |
|------|---------|
| `gc/AppetizeActivate/.../entity/retail/RetailCartItem.java` | Holds `reduction` and `reductionItemSetData` fields |
| `gc/AppetizeActivate/.../entity/retail/RetailCart.java` | Cart with item-set processing integration |
| `gc/AppetizeActivate/.../support/cart/CurrentReduction.java` | Main reduction orchestration, handles bundled items grouping |

---

## 4. Calculation Details

### Final Cost Mode (`buy_quantity_itemset_for_final_cost_item`)

**At item selection (per modifier):**
```
percent = (modifierCost / parentOriginalCost) × 100
childReducedAmount = (percent × finalCost) / 100   // modifier's proportional share of the final cost (post-discount price)
```
This gives each modifier its proportional share of the final cost.

**At cart processing (per line):**
```
totalQualifiedOriginal = unitPrice × triggerQuantity × appliedBlocks
totalQualifiedFinal = finalCost × appliedBlocks
totalDiscount = totalQualifiedOriginal - totalQualifiedFinal
discountPerUnit = totalDiscount / (triggerQuantity × appliedBlocks)
lineDiscount = discountPerUnit × lineAppliedQuantity
```

**Parent reduced amount:** `parentCost - finalCost` (simple subtraction)

### Percent Off Mode (`buy_quantity_itemset_get_percent_off_item`)

**At item selection (per modifier):**
```
percentageCost = modifierCost × percentOff / 100
childReducedAmount = modifierCost - percentageCost   // this is the post-discount price (stored as reducedTotalAmount)
```

**At item selection (parent):**
```
parentPostDiscountPrice = calculateCostOfItemSetUsingPercentCost(percentOff, parentCost)
parentReducedAmount = parentPostDiscountPrice + sum(child.reducedTotalAmount for each child)
```
Note: `reducedTotalAmount` for children = their post-discount price (not the discount amount).
In percent mode, both parent AND children are included in the reduction map.

**At cart processing (per line):**
```
qualifiedAmount = unitPrice × lineAppliedQuantity
qualifiedFinalAmount = calculateCostOfItemSetUsingPercentCost(percentOff, qualifiedAmount)
                     = qualifiedAmount - (qualifiedAmount × percentOff / 100)  // returns post-discount price
lineDiscount = qualifiedAmount - qualifiedFinalAmount  // equals qualifiedAmount × percentOff / 100
```

### Rounding

The `ReductionRounding` from back office config determines `RoundingMode`:
- Standard → `HALF_UP`
- Up → `UP`
- Down → `DOWN`
- Truncate → `FLOOR`

Scale used: calculations at scale 3-4 internally, final amounts at scale 2 (cents).

### Important: `reducedTotalAmount` Semantics

Despite the name, `ReductionItemSetData.reducedTotalAmount` stores the **post-discount price** (the new price after applying the promotion), NOT the discount amount itself. For example, if an item costs $10 and gets 20% off, `reducedTotalAmount = $8.00` (not $2.00).

---

## 5. Key Behavioral Notes

1. **cascadeDiscountToAllModifiers**: Always `true` for itemset types. Forced to `1` in `Reduction.copy()` when `isItemSetFinalCost` or `isItemSetPercentCost` is true.
2. **Trigger grouping**: Items are grouped by `(reductionId, parentItemId)`. Multiple items with the same parent share a single trigger evaluation.
3. **Consolidation guard**: `allocateItemSetDiscountAcrossLines()` returns early if consolidation mode is active (`ConsolidationCartManagerImpl.isConsolidationStateEnable()`).
4. **Cart position ordering**: Lines are allocated in `cartPosition` order — earlier items get discount first when quantity exceeds qualified amount.
5. **Voided items**: Excluded from trigger evaluation and allocation.
6. **Auto-apply**: These promotions are found by `findReductionForItem()` with `isAutoApply = true`, meaning they apply automatically without user action.
7. **type_id / level_type_id NULL**: Per subtask 1, these fields are intentionally NULL in the rewards/triggers table for all bundling discounts. This is NOT a bug.

---

## 6. Known Issues & Subtask History

### Resolved (Not Bugs)

| Subtask | Issue | Resolution |
|---------|-------|------------|
| Subtask 1: Reduction service not recording fields | `type_id` and `level_type_id` NULL in rewards table | **Not a bug** — these fields are not saved for ANY bundling discount type. Expected behavior. |

### Bug: Discount rules not applied correctly for quantity > 1 (Subtask 4 - GLB)

**Problem**: System applies discount for 1 unit when rules require 2 items.

**Root Cause Area**: Likely in `DiscountItemSetTriggerEvaluator.evaluate()` or `allocateItemSetDiscountAcrossLines()`. Check:
- Is `triggerQuantity` being read correctly from the reduction trigger?
- Is `appliedBlockCount` calculation correct: `currentQuantity / triggerQuantity` (floor division)?
- Are items grouped correctly by `ItemSetTriggerKey`?

**Files to investigate**:
- `DiscountItemSetTriggerEvaluator.kt` — `extractTriggerQuantity()`, verify `decimalValue` parsing
- `ReductionItemSetProcessor.kt` — `allocateItemSetDiscountAcrossLines()`, verify `remainingQualifiedQuantity` distribution

### Bug: DSP Go not displaying bundling discounts (Subtask 8)

**Problem**: Discounts not visible in cart summary under the item.

**Root Cause Area**: `ReductionItemSetLineDiscount.shouldShowLineDiscount` not set to `true`.

**Files to investigate**:
- `ReductionItemSetProcessor.kt` — `allocateItemSetDiscountAcrossLines()` sets `shouldShowLineDiscount = lineDiscountAmount > BigDecimal.ZERO`
- Verify `evaluateItemSetTriggerStates()` sets `isTriggerSatisfied = true`
- Check UI layer reads `reductionItemSetData.reductionLineDiscount.shouldShowLineDiscount`
- Check `ReductionsProcessor` is calling `processAndApplyRulesReductionItemSet(cart)`

### Integration: Orders Egress valid discount ID (Subtask 3)

**Context**: CAP Order Export requires a valid `reference` ID from Back Office configuration. This is a downstream integration concern, not a DSP Go code issue.

---

## 7. Where to Modify (Safe Boundaries)

### Calculation changes
- **Change discount formula**: `ItemSetReductionExtensions.kt` (`calculateChildReducedAmount`, `calculateParentReducedAmount`)
- **Change cart-level allocation**: `ReductionItemSetProcessor.kt` (`calculatePercentLineDiscount`, `calculateFinalCostLineDiscount`)
- **Change rounding**: `ReductionUtilKt.kt` (`calculateCostOfItemSetUsingTotalCost`, `calculateCostOfItemSetUsingPercentCost`)

### Trigger logic changes
- **Change trigger evaluation**: `DiscountItemSetTriggerEvaluator.kt`
- **Change grouping key**: `ItemSetTriggerKey` / `ItemSetGroupKey` data classes

### Display changes
- **Change visibility condition**: `ReductionItemSetProcessor.kt` — `shouldShowLineDiscount` assignment
- **Change checkout payload**: `CheckoutReductionBuilder.kt` — `convertFromItemSetReduction()`

### ⚠️ High-impact areas (modify with caution)
- `ReductionsProcessor.kt` — orchestrates ALL discount types; changes here affect non-itemset discounts
- `Reduction.java` — shared entity for all reduction types; field changes affect entire discount system
- `RetailCartItem.java` — core cart item model used everywhere
- `CurrentReduction.java` — bundling orchestration shared with older bundle types

---

## 8. Testing

### Unit Tests

| Test File | Coverage |
|-----------|----------|
| `ReductionItemSetProcessorTest.kt` | Cart-level trigger evaluation, allocation, edge cases |
| `ReductionItemSetInteractorTest.kt` | Item selection flow, child/parent data building |
| `DiscountItemSetTriggerEvaluatorTest.kt` | Trigger grouping, block count, qualified/non-qualified split |
| `ItemSetReductionExtensionTest.kt` | Calculation utilities for both discount modes |
| `CheckoutReductionBuilderTest.kt` | Checkout payload generation |
| `ReductionItemSetRepositoryImplTest.kt` | Repository lookup filtering |

### Test Resources
- `itemSetsTestCases.json`
- `checkoutReductionBuilderSingleItemSetTest.json`
- `reductionBundleType.json`

### Manual Testing Pre-Req
- **Venue**: 5851 (Bibbidi Bobbidi Boutique)
- **Test item**: "Frozen Crown" (has Item Sets configured)
- Verify: item selection → discount display in cart → correct amounts in checkout payload

---

## 9. Glossary

| Term | Definition |
|------|------------|
| Reduction | DSP Go's internal name for any discount/promotion |
| Item Set | A group of modifiers/items linked to a parent item (configured in Back Office) |
| Trigger Quantity | Number of parent items required in cart to activate the promotion |
| Applied Block Count | How many full trigger groups are satisfied (floor(cartQty / triggerQty)) |
| Qualified Quantity | Items eligible for discount (appliedBlockCount × triggerQuantity) |
| Cascade Discount | Flag indicating discount applies to parent AND all its modifiers |
| Final Cost | Promotion sets the total bundle price to a fixed dollar amount |
| Percent Cost | Promotion applies X% off to each item individually |
