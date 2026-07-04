# POS-6003: EJ | Taxable Catchall should not trigger a Marked Out of Stock activity

## Quick Reference

| Field | Value |
|-------|-------|
| Ticket | POS-6003 (subtasks: POS-9994) |
| Feature | Open Price Items (Taxable/Non-Tax Catchall) must register ADD_ITEM in EJ, not MARKED_OUT_OF_STOCK |
| Module | `gc/AppetizeActivate` (audit / retail presenters) |
| Fix Commit | `10e9cc91b74` by Carlos Agudelo (2025-06-27) |
| Entry Point | `BehaviorHelper.kt` → `OpenItemPresenter.java` → `ProductItemRequireDataEntryPresenter.java` |
| Audit Flow | `CartProxy.runAfterItemAddedToCart()` → `ReportAddItemUseCase` → `AuditReporter.reportItemAddedToAudit()` |
| Scope | Audit event registration only — no cart or payment logic changes |

---

## 1. Feature Overview

When a Merch Open Price Item (Taxable Catchall or Non-Tax Catchall) is added to the cart, the Electronic Journal (EJ) report must show an `ADD_ITEM` activity. Prior to this fix, the system was incorrectly registering a `MARKED_OUT_OF_STOCK` activity.

### Business Rules

1. **ADD_ITEM**: Must be the only event registered in EJ when any item is added to cart (including Open Price Items)
2. **MARKED_OUT_OF_STOCK**: Should NOT be triggered when an Open Price Item is added
3. The fix applies to Merch item types only (Taxable Catchall and Non-Tax Catchall)

### Acceptance Criteria

**AC1**: Given the Electronic Journal report, when adding an Open Price Item to the cart, then the transaction is registered **without** the "MARKED_OUT_OF_STOCK" activity — only ADD_ITEM appears.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     OPEN PRICE ITEM → CART → EJ FLOW                        │
└─────────────────────────────────────────────────────────────────────────────┘

User taps Open Price Item (Taxable Catchall)
          │
          ▼
┌──────────────────────────────┐
│     BehaviorHelper.kt        │  Detects item.isOpenPriceItem == true
│  handleItemBehavior()        │  Routes to → addModifierValidation()
│                              │    which calls callback.onOpenItem()
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│    OpenItemPresenter.java    │  Shows numeric keypad for price entry
│    onProceedAction()         │  Sets openOrWeightCost on RetailCartItem
│                              │  If item.isRequireDataEntryEnabled →
│                              │     view.requireExtraData()
└──────────────┬───────────────┘
               │ (Catchall items have requireDataEntry = true)
               ▼
┌──────────────────────────────────────────────────────────────┐
│  ProductItemRequireDataEntryPresenter.java                   │
│  onCompleteButtonClicked()                                   │
│                                                              │
│  1. Captures SKU + Note from dialog                          │
│  2. Sets inputSkuBarcode and note on RetailCartItem          │
│  3. Calls view.addItem(retailCartItem)  ─────────────────┐   │
│  4. Calls view.dismissDialog()                           │   │
│                                                          │   │
│  ❌ REMOVED: AuditReporter.reportMarkedOutOfStockToAudit │   │
└──────────────────────────────────────────────────────────┼───┘
                                                           │
               ┌───────────────────────────────────────────┘
               │  view.addItem() triggers the standard cart addition
               ▼
┌──────────────────────────────────────────────────────────────┐
│  CartProxy.kt                                                │
│                                                              │
│  addItem() → observeCartProcessId → onSuccess:              │
│    ├── runAfterItemAddedToCart(retailCartItem)               │
│    │       └── reportItemAddedAudit(retailCartItem)          │
│    │               ├── reportAddItemUseCase.invoke()     ✅  │
│    │               └── reportAddItemToCheckUseCase.invoke()  │
│    ├── linkedItemsCartProxy.addLinkedItemsFromParentItem()   │
│    └── simpleSecondaryDisplayManager.addItemToBasket()       │
└──────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│  ReportAddItemUseCase.kt                                     │
│  invoke(retailCartItem) →                                    │
│    AuditReporter.reportItemAddedToAudit(screenName, item)    │
│    AuditReporter.reportMapTreeItemsAddedToAudit(item)        │
└──────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│  AuditReporter.kt → reportItemAddedToAudit()                │
│                                                              │
│  Creates AuditEvent with:                                    │
│    action = ADD_ITEM                                         │
│    fields: ORDER_ITEM_ID, ITEM_NAME, ORDER_ITEM_UUID,       │
│            ORIGINAL_UNIT_PRICE, ITEM_INPUT_METHOD, QTY,      │
│            ITEM_TYPE, CURRENCY, UNSSPC, TAXES_COUNT,         │
│            ITEM_TAXES_COUNT, HAS_INTERNAL_TAXES, HAS_TAXES,  │
│            HAS_TAXABLE                                       │
└──────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│  InsertAuditEventInteractor.kt                               │
│  execute(event) → Persists AuditEvent to Room DB             │
│  Sets checkSequenceStatus = PENDING (for ADD_ITEM actions)   │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Root Cause Analysis

### The Bug

`ProductItemRequireDataEntryPresenter.java` was calling `AuditReporter.reportMarkedOutOfStockToAudit()` **after** `view.addItem()`. This meant:
- The standard `ADD_ITEM` event was being registered correctly (via `CartProxy.runAfterItemAddedToCart`)
- **AND** an additional `MARKED_OUT_OF_STOCK` event was being registered incorrectly

The `MARKED_OUT_OF_STOCK` action appeared in the EJ report because the method was being invoked explicitly in the presenter's `onCompleteButtonClicked()`.

### Why It Was Wrong

The `reportMarkedOutOfStockToAudit()` method was likely added during early development when the "Require Data Entry" dialog was associated with item availability. However, catchall items requiring data entry have nothing to do with stock availability — they just need SKU and notes captured.

### The Fix (commit `10e9cc91b74`)

Pure deletion — 16 lines removed, 0 added:

1. **Removed** `reportMarkedOutOfStockToAudit()` method entirely from `AuditReporter.kt`
2. **Removed** the call to that method in `ProductItemRequireDataEntryPresenter.java`

The `ADD_ITEM` event was **already being registered** via the existing flow: `view.addItem()` → cart addition → `CartProxy.runAfterItemAddedToCart()` → `reportAddItemUseCase.invoke()`.

---

## 4. Key Files

| File | Path | Role |
|------|------|------|
| **BehaviorHelper.kt** | `gc/AppetizeActivate/src/main/java/.../retail/ui/mvp/presenter/BehaviorHelper.kt` | Routes items by type. Open price items → `onOpenItem()` |
| **OpenItemPresenter.java** | `gc/AppetizeActivate/src/main/java/.../retail/ui/mvp/presenter/OpenItemPresenter.java` | Numeric keypad for price entry. If `isRequireDataEntryEnabled` → `view.requireExtraData()` |
| **ProductItemRequireDataEntryPresenter.java** | `gc/AppetizeActivate/src/main/java/.../retail/ui/mvp/presenter/ProductItemRequireDataEntryPresenter.java` | **Fixed file.** Captures SKU + Note, then calls `view.addItem()` |
| **RequireDataEntryView.java** | `gc/AppetizeActivate/src/main/java/.../retail/ui/mvp/view/contract/RequireDataEntryView.java` | Interface: `getInputSkuBarcode()`, `getNode()`, `addItem()`, `dismissDialog()` |
| **CartProxy.kt** | `gc/AppetizeActivate/src/main/java/.../main/cartproxy/CartProxy.kt` | Central cart management. `runAfterItemAddedToCart()` → triggers audit |
| **ReportAddItemUseCase.kt** | `gc/AppetizeActivate/src/main/java/.../main/interactor/audit/ReportAddItemUseCase.kt` | Invokes `AuditReporter.reportItemAddedToAudit()` |
| **AuditReporter.kt** | `gc/AppetizeActivate/src/main/java/.../audit/AuditReporter.kt` | Central audit event builder. `reportItemAddedToAudit()` creates ADD_ITEM events |
| **AuditService.kt** | `gc/audit/src/main/java/.../audit/keystores/AuditService.kt` | Constants: `AuditServiceAction`, `AuditServiceKey`, `AuditServiceValue` |
| **InsertAuditEventInteractor.kt** | `gc/audit/src/main/java/.../audit/operations/InsertAuditEventInteractor.kt` | Persists audit events to Room DB |
| **PrintAuditReporter.kt** | `gc/AppetizeActivate/src/main/java/.../audit/PrintAuditReporter.kt` | Print-time audit events. Uses `TAXABLE_CATCHALL` / `NON_TAX_CATCHALL` values for print item data |

---

## 5. Related Constants (AuditService.kt)

### Actions
| Constant | Value | Usage |
|----------|-------|-------|
| `ADD_ITEM` | `"ADD_ITEM"` | ✅ Correct event for all items added to cart |
| `MARKED_OUT_OF_STOCK` | `"MARKED_OUT_OF_STOCK"` | ❌ Was incorrectly triggered for catchall items. Still defined but unused in current code |
| `ITEM_UNAVAILABLE` | `"ITEM_UNAVAILABLE"` | Used when item count drops to zero (unrelated feature POS-10572) |
| `ITEM_COUNTDOWN` | `"ITEM_COUNTDOWN"` | Used when item stock quantity is updated (unrelated feature POS-10572) |

### Relevant Keys & Values
| Constant | Value | Context |
|----------|-------|---------|
| `ITEM_SKU` / `SKU_NOTE` / `DESCRIPTION_NOTE` | — | Were used in the removed `reportMarkedOutOfStockToAudit()` method |
| `TAXABLE_CATCHALL` | `"Taxable Catchall"` | Used in `PrintAuditReporter` for print-event item data |
| `NON_TAX_CATCHALL` | `"Non-tax Catchall"` | Used in `PrintAuditReporter` for print-event item data |

---

## 6. Testing & Verification

### How to verify the fix works
1. Log into Merch venue (e.g., 5955)
2. Search → Item name → "Taxable Catchall"
3. Enter price → Complete "Require Data Entry" (SKU + Note)
4. Checkout with credit payment
5. In DSP Connect → Analytics → Electronic Journal:
   - ✅ `ADD_ITEM` is registered
   - ✅ No `MARKED_OUT_OF_STOCK` appears

### Regression risks
- **None expected**: The fix is a pure deletion. The `ADD_ITEM` event was already being registered via the standard cart flow.
- **MARKED_OUT_OF_STOCK constant**: Still defined in `AuditService.kt` but has zero usages. Safe to leave or remove in cleanup.

---

## 7. Safety Zones for Future Changes

### Safe to modify
- `ProductItemRequireDataEntryPresenter.java`: Only handles SKU/Note capture and delegates to `view.addItem()`
- `OpenItemPresenter.java`: Only handles price keypad logic

### Careful with
- `CartProxy.runAfterItemAddedToCart()`: This is the single point where ADD_ITEM audit is triggered for ALL items. Modifying this affects every item type.
- `AuditReporter.reportItemAddedToAudit()`: The event builder for ADD_ITEM. Changes affect all items in EJ.
- `InsertAuditEventInteractor.getCheckSequenceStatus()`: ADD_ITEM triggers `CHECK_SEQUENCE_PENDING`. Don't break this mapping.

### Do NOT touch (unrelated but nearby)
- `reportItemUnavailable()` / `reportItemCountDownUpdate()` in `AuditReporter.kt`: These are for the Item Countdown feature (POS-10572), completely separate from Open Price Items.
- `PrintAuditReporter.kt`'s `hasRequireDataEntryCheckoutCartItem()`: This handles print-time `RIDE_PHOTO_ITEM_TRANSACTION` events for items with `requireDataEntry = true`. A related follow-up fix (POS-18081, commit `119c70f8bff`) added the `&& !isItemDataOnlyPrint` guard to prevent duplicate print events when catchall items already report their own item data (e.g., `NON_TAX_CATCHALL`, `TAXABLE_CATCHALL`).
