# POS-1936: Gift Card Reload & Activate Architecture

## Summary

This feature ensures the POS uses the correct Value Card item (Activate or Reload) based on the balance inquiry response, and that CAP receives `authCode`, `confirmationCode`, and `cardClass` in the payload.

**Problem solved:** Sporadic out-of-balance issues, guest overcharges, and CAP quarantines caused by missing `authCode`/`confirmationCode`/`cardClass`.

---

## Core Business Rule

Regardless of what the Cast Member initially selects (Activate or Reload):
- If the card is **Inactive** → use SKU `VALUE CARD ACTIVATE`
- If the card is **Active** → use SKU `VALUE CARD RELOAD`

The balance inquiry response (not the CM's selection) determines the final SKU.

---

## End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. CM selects Value Card Activate/Reload from POS menu                  │
│    → FiPayGiftCardCreationPresenter.buildGiftCard(mode)                 │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. Card Input (Swipe/Scan/Manual)                                       │
│    → FiPaySwipeScanInteractor.execute(mode)                             │
│    → Returns: FiPayGiftCardData + RetailCartItem                        │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. Duplicate Check                                                      │
│    → GiftCardDuplicationCheckInteractor.execute(giftCard, retailCart)   │
├─────────────────────────────────────────────────────────────────────────┤
│ 4. Balance Inquiry (determines Active vs Inactive)                      │
│    → FiPayGiftCardStatusCheckInteractor.execute(giftCard, cardDetails) │
│    → Calls GiftCardBalanceCheckOperation (PAX terminal)                 │
│    → Returns: StatusResult.Active / StatusResult.Inactive / Unverifiable│
├─────────────────────────────────────────────────────────────────────────┤
│ 5. Update cart item with external data from balance response            │
│    → FiPayGiftCardUpdaterInteractor.execute(giftCardItem, fiPayResponse)│
│    → Generates ExternalFiPayData (authCode, confirmationCode, cardClass)│
├─────────────────────────────────────────────────────────────────────────┤
│ 6. Show Amount Dialog                                                   │
│    → GiftCardHelper.onGiftCardCreationCompleted(result, giftcardItem)  │
│    → dialogFragmentsRouter.showGiftCardDialog(item, result, callback)   │
├─────────────────────────────────────────────────────────────────────────┤
│ 7. SKU Swap (CRITICAL - POS-1936 fix)                                   │
│    → GiftCardAmountPresenter.prepareGiftCardView(result, cartItem)      │
│    → FiPayGiftCardMapperInteractorImpl(action).execute(cartItem)        │
│    → Queries DB for correct item ID by name:                            │
│      • ACTIVE → "VALUE CARD RELOAD" → GiftCardAction.RELOAD            │
│      • INACTIVE → "VALUE CARD ACTIVATE" → GiftCardAction.ACTIVATE      │
├─────────────────────────────────────────────────────────────────────────┤
│ 8. At Checkout: Activation/Reload execution                             │
│    → FiPayGiftCardActivationReloadFlow.execute(giftCardsToProcess)     │
│    → FiPayGiftCardActivationReloadInteractor routes based on action:    │
│      • GiftCardAction.Activate → FiPayActivateInteractorImpl           │
│      • GiftCardAction.Reload → FiPayReloadInteractorImpl               │
├─────────────────────────────────────────────────────────────────────────┤
│ 9. On Success: Generate CAP payload                                     │
│    → externalDataGenerator.generate(legacyResponse)                     │
│    → Updates FiPayGiftCardItem.externalData with final authCode etc.    │
├─────────────────────────────────────────────────────────────────────────┤
│ 10. Transmission to CAP                                                 │
│    → ExternalFiPayData → ExternalDataJsonObject (via ExternalDataConv.) │
│    → CheckoutExternalFiPayDataConverter.toJsonObject()                  │
│    → JSON sent to Central Accounting Platform                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## CAP Payload: authCode, confirmationCode, cardClass

These values come from the **PAX terminal response, Packet 101**:

| CAP Field          | Source in Code                                | PAX Packet Field           |
|--------------------|-----------------------------------------------|----------------------------|
| `authcode`         | `response101.get(AUTH_CODE)`                  | AUTH_CODE in Packet 101    |
| `confirmationCode` | `Long.parseLong(response101.get(RRN))`        | RRN in Packet 101          |
| `cardClass`        | `response101.get(FiPayConstants.CARD_CLASS)`  | CARD_CLASS in Packet 101   |

**Parsing location:** `FiPayResponse.parseFor101ExternalFiPayData()` (line ~450 in FiPayResponse.java)

**Important:** If `confirmationCode` (RRN) fails to parse as Long (exception), it defaults to `0`. If AUTH_CODE or CARD_CLASS are null in the PAX response, they will be null in the payload → causes CAP quarantine.

### Data Flow for CAP Payload

```
PAX Terminal Response (rawResponse)
  → FiPayAXUtils.buildFiPayResponse(rawResponse)    // Creates FiPayResponse
  → FiPayResponse.toTransactionResponse()            // Parses packet 101
  → parseFor101ExternalFiPayData()                   // Builds ExternalFiPayData
  → FiPayExternalDataGeneratorImpl.generate(response) // Wraps with amount/captureMethod
  → ExternalFiPayData model stored in cart item
  → ExternalDataConverter.toJsonObject() (at checkout transmission)
  → CheckoutExternalFiPayDataConverter.toJsonObject() (serialization)
```

---

## Key Files

### Gift Card Creation (Pre-Cart)

| File | Location | Responsibility |
|------|----------|----------------|
| `FiPayGiftCardCreationPresenter.kt` | `AppetizeActivate/.../retail/ui/mvp/presenter/` | Entry point. Handles swipe/scan/manual, orchestrates balance inquiry |
| `FiPayGiftCardStatusCheckInteractor.kt` | `AppetizeActivate/.../payment/fipay/giftcardstatus/` | Calls `GiftCardBalanceCheckOperation`, returns Active/Inactive/Unverifiable |
| `GiftCardStatusCheckInteractor.kt` | Same package | Interface defining StatusResult sealed class |
| `FiPayGiftCardUpdaterInteractor.kt` | `AppetizeActivate/.../payment/fipay/utils/` | Updates cart item's externalData from balance inquiry response |
| `GiftCardHelper.kt` | `AppetizeActivate/.../payment/sdk/common/giftcards/` | Intermediary between presenter and interactors, shows dialogs |

### SKU Selection (POS-1936 Core Fix)

| File | Location | Responsibility |
|------|----------|----------------|
| `GiftCardAmountPresenter.kt` | `AppetizeActivate/.../retail/ui/mvp/presenter/` | Calls mapper based on status result |
| `FiPayGiftCardMapperInteractorImpl.kt` | `AppetizeActivate/.../retail/ui/mvp/interactor/implementation/` | **Swaps item ID** to correct SKU from DB based on GiftCardAction |

**SKU Constants in `FiPayGiftCardMapperInteractorImpl`:**
- `GIFT_CARD_ACTIVATION = "VALUE CARD ACTIVATE"`
- `GIFT_CARD_RELOAD = "VALUE CARD RELOAD"`
- `GIFT_CARD_CASHOUT = "VALUE CARD CASH OUT"`

Uses `ItemTable.getItemByName(name, venueId, vendorId)` to fetch the correct item from the database.

### Checkout Execution (Activate/Reload at PAX)

| File | Location | Responsibility |
|------|----------|----------------|
| `FiPayGiftCardActivationReloadFlow.kt` | `AppetizeActivate/.../payment/fipay/` | Orchestrates activation/reload, handles retry/rescan/cancel |
| `FiPayGiftCardActivationReloadInteractor.kt` | Same package | Routes to Activate or Reload interactor based on `GiftCardAction` |
| `FiPayActivateInteractorImpl.kt` | `AppetizeActivate/.../payment/fipay/activate/` | Sends Activate request to PAX terminal |
| `FiPayReloadInteractorImpl.kt` | `AppetizeActivate/.../payment/fipay/reload/` | Sends Reload request to PAX terminal |

### ExternalData / CAP Payload

| File | Location | Responsibility |
|------|----------|----------------|
| `ExternalFiPayData.java` | `swipers/.../data/` | Data model: authcode, confirmationCode, cardClass, etc. |
| `FiPayResponse.java` | `swipers/.../terminal/fipay/api/` | Parses PAX response → ExternalFiPayData (packet 101) |
| `FiPayExternalDataGeneratorImpl.kt` | `AppetizeActivate/.../retail/ui/mvp/interactor/implementation/` | Wraps `response.toTransactionResponse().externalFiPayData` with amount/captureMethod |
| `ExternalDataConverter.kt` | `AppetizeActivate/.../checkout/interactor/converter/payment/` | Converts ExternalFiPayData → ExternalDataJsonObject for API |
| `CheckoutExternalFiPayDataConverter.kt` | `AppetizeActivate/.../checkout/interactor/converter/` | Converts to CheckoutExternalFiPayDataJsonObject |

### Supporting Models

| File | Location | Responsibility |
|------|----------|----------------|
| `FiPayGiftCardData.java` | `swipers/.../data/` | Cart item extension data: holds ExternalFiPayData, maskedGcNum, action, amount |
| `FiPayGiftCardItem` | `fipay/.../model/giftcard/` | Domain model for activation/reload processing |
| `GiftCardAction` enum | `fipay/.../model/giftcard/` | Activate, Reload, CashOut |
| `GiftcardStatusResult` enum | `AppetizeActivate/.../interactor/contracts/enums/` | ACTIVE, INACTIVE, UNKNOWN, UNVERIFIABLE |

---

## Known Risk Points (Bug Investigation Guide)

### 1. Missing authCode / confirmationCode / cardClass → CAP Quarantine

**Root Cause Pattern:** PAX terminal response packet 101 does not contain these fields.

**Where to check:**
- `FiPayResponse.parseFor101ExternalFiPayData()` — Is packet 101 present? Are fields non-null?
- `FiPayExternalDataGeneratorImpl.generate()` — Is `transactionResponse?.externalFiPayData` null?
- If `toTransactionResponse()` returns null (no packet 101, 107, or 211), `externalFiPayData` will be null.

**Reproduction clue:** Balance inquiry response with error types other than `InactiveAccount` won't have valid packet 101 data.

### 2. Wrong SKU (Activate vs Reload mismatch)

**Root Cause Pattern:** Status check returns incorrect result, or mapper doesn't find item in DB.

**Where to check:**
- `FiPayGiftCardStatusCheckInteractor.handleResponse()` — Is `GiftCardErrorType.InactiveAccount` being correctly identified?
- `FiPayGiftCardMapperInteractorImpl.getItemFromDb()` — Does `ItemTable.getItemByName("VALUE CARD ACTIVATE", ...)` return a valid item?
- If item not found in DB → item ID stays unchanged → wrong SKU goes to CAP.

### 3. ExternalData overwritten or lost

**Where to check:**
- `FiPayGiftCardUpdaterInteractor.execute()` — Sets externalData from **balance inquiry** response (step 5)
- `FiPayGiftCardActivationReloadFlow.handleActivationReloadSuccess()` — Overwrites externalData with **activation/reload** response (step 9)
- The final externalData should come from the **activation/reload** response, not the balance inquiry.

### 4. Timing: ExternalData from balance vs activation

Two moments generate ExternalFiPayData:
1. **Balance Inquiry** (step 5) → stored in cart item pre-checkout
2. **Activation/Reload** (step 9) → overwrites with final response at checkout

If checkout activation/reload **fails**, the externalData from the balance inquiry may still be present. This balance inquiry externalData might have valid authCode/confirmationCode from the balance check, but they are **not** the activation/reload auth codes.

---

---

## Subtask: POS-1936 | FOH | Display "Value Card Activate" SKU in Cart for Inactive Cards

### Objective

Ensure the cart displays the correct SKU label based on the balance inquiry result, not the CM's initial menu selection.

### Acceptance Criteria

| AC | Scenario | Expected Cart Display |
|----|----------|----------------------|
| AC1 | CM selects Activate → card is Inactive → enters amount | **"Value Card Activate"** |
| AC2 | CM selects **Reload** → card is **Inactive** → enters amount | **"Value Card Activate"** |
| AC3 | CM selects **Reload** → card is **Active** → enters amount | **"Value Card Reload"** |

### Implementation Point

The SKU swap happens in `GiftCardAmountPresenter.prepareGiftCardView()`:

```kotlin
// GiftCardAmountPresenter.kt (line ~81)
} else if (result === GiftcardStatusResult.ACTIVE) {
    view.showReloadView()
    FiPayGiftCardMapperInteractorImpl(UserManager.getInstance(), GiftCardAction.RELOAD).execute(cartItem)
} else if (result === GiftcardStatusResult.INACTIVE) {
    view.showActivationView()
    FiPayGiftCardMapperInteractorImpl(UserManager.getInstance(), GiftCardAction.ACTIVATE).execute(cartItem)
}
```

This calls `FiPayGiftCardMapperInteractorImpl.getItemFromDb()` which fetches the item by name:
- `GiftCardAction.ACTIVATE` → `ItemTable.getItemByName("VALUE CARD ACTIVATE", venueId, vendorId)`
- `GiftCardAction.RELOAD` → `ItemTable.getItemByName("VALUE CARD RELOAD", venueId, vendorId)`

The fetched item's `id` replaces the cart item's `id`, so the correct SKU name appears in the cart.

### Cart Display Name Construction

The item name shown in cart is built in `FiPayGiftCardItemGeneratorImpl.getNameFromGiftCardData()`:

```kotlin
// FiPayGiftCardItemGeneratorImpl.kt
private fun getNameFromGiftCardData(giftcardData: FiPayGiftCardData): String {
    val title = StringBuilder()
    title.append("GC ${giftcardData.action} : ")  // "GC activation : " or "GC reload : "
    title.append(giftcardData.appMaskAcct ?: giftcardData.maskedGcNum)
    return title.toString()
}
```

And in `GiftCardAmountPresenter.updateGiftcardAmount()`:

```kotlin
// GiftCardAmountPresenter.kt
val title = FiPayTxnHelperExternal.buildItemNameFromGcData(data)
(retailCartItem.getItem() as Item).name = title
```

### Files to Modify (if fixing a bug here)

1. **`FiPayGiftCardMapperInteractorImpl.kt`** — If the wrong action is being passed
2. **`GiftCardAmountPresenter.kt`** — If `result` is null/incorrect when calling `prepareGiftCardView`
3. **`FiPayGiftCardCreationPresenter.kt`** — If `handleActiveGiftCard()`/`handleInactiveGiftCard()` return wrong status
4. **`FiPayGiftCardStatusCheckInteractor.kt`** — If balance inquiry response is misclassified

### Out of Scope

- Receipt modification
- Value Card Cash Out flow

---

## Subtask: GLB | POS-1936 - Value Card Activation Incorrectly Displayed in Receipt

### Bug

- **Actual:** Receipt displays "GC activation"
- **Expected:** Receipt displays "Value Card Activation"

### Root Cause

There are **two** places controlling receipt display, gated by feature flag `IsGiftCardReloadOrActivateEnabled`:

#### 1. Payment Section (Bottom of Receipt) — `ReceiptPaymentsExtractor.kt`

```kotlin
// ReceiptPaymentsExtractor.kt (line ~100)
private fun getGiftCardReceiptLabel(action: String?): String {
    if (!isGiftCardReloadOrActivateEnabled) {
        return formatActionLabel(action)  // ← BUG: shows "Activation" (raw action)
    }
    return when (action) {
        GIFTCARD_ACTION_ACTIVATION -> GIFTCARD_RECEIPT_ACTIVATION_LABEL  // "Value Card Activation"
        GIFTCARD_ACTION_RELOAD -> GIFTCARD_RECEIPT_RELOAD_LABEL          // "Value Card Reload"
        else -> formatActionLabel(action)
    }
}
```

**When flag is enabled:** Uses constants → "Value Card Activation" / "Value Card Reload" ✅
**When flag is disabled:** Falls back to `formatActionLabel()` → raw action capitalized ❌

#### 2. Item Body Section (Middle of Receipt) — `UniversalItemizedMainBodyLinesStepsBuilder.kt`

```kotlin
// UniversalItemizedMainBodyLinesStepsBuilder.kt (line ~300)
private fun transformGiftCardItemName(itemLineName: String): String {
    if (!isGiftCardReloadOrActivateEnabled) return itemLineName  // No transform if flag off
    return trimmedName
        .replace("Value Card Activate:", "GC Activation: ")   // ← INTENTIONAL replacement
        .replace("Value Card Reload:", "GC Reload: ")
}
```

**When flag is enabled:** Transforms "Value Card Activate: XXXX" → "GC Activation: XXXX" (item body only)
**When flag is disabled:** Returns original item name unchanged

### Constants Reference

```java
// FiPayConstants.java
GIFTCARD_RECEIPT_ACTIVATION_LABEL = "Value Card Activation"
GIFTCARD_RECEIPT_RELOAD_LABEL = "Value Card Reload"
GIFTCARD_ACTION_RELOAD = "reload"
GIFTCARD_ACTION_ACTIVATION = "activation"
```

### Fix Location

| Receipt Section | File | Fix |
|-----------------|------|-----|
| Payment lines (tranType) | `ReceiptPaymentsExtractor.kt` | Ensure `getGiftCardReceiptLabel()` returns "Value Card Activation"/"Value Card Reload" |
| Item body lines | `UniversalItemizedMainBodyLinesStepsBuilder.kt` | Remove or invert `transformGiftCardItemName()` replacement if "Value Card" label is desired |

### Key Files

| File | Path | Role |
|------|------|------|
| `ReceiptPaymentsExtractor.kt` | `AppetizeActivate/.../main/receipts/extractors/` | Builds payment section of receipt (authCode, tranType, maskedCard) |
| `UniversalItemizedMainBodyLinesStepsBuilder.kt` | `AppetizeActivate/.../main/receipts/builders/` | Builds item body section, transforms "Value Card Activate:" → "GC Activation:" |
| `FiPayConstants.java` | `swipers/.../terminal/fipay/` | Defines label constants and action strings |
| `Features.IsGiftCardReloadOrActivateEnabled` | Feature flags | Gates the receipt label logic |

### Feature Flag Dependency

`Features.IsGiftCardReloadOrActivateEnabled()` controls both:
1. Whether payment section shows "Value Card Activation" vs raw formatted action
2. Whether item body section transforms names

**If flag is OFF:** Receipt shows legacy labels (e.g., "GC activation", raw action)
**If flag is ON:** Receipt shows "Value Card Activation"/"Value Card Reload" in payment section, "GC Activation:"/"GC Reload:" in item body

---

## Subtask: OSR | FIN - Quarantine on Gift Card Activation (Missing expirationDate, cardToken, authCode, cardClass)

### Bug

CAP quarantines gift card activation/reload transactions due to missing fields in the `giftCards.externalData` payload:
- `expirationDate`
- `cardToken`
- `authCode` (field name: `authcode`)
- `cardClass`

### Data Flow: Where These Fields Are Populated

```
PAX Terminal Response (rawResponse)
  │
  ├── FiPayAXUtils.buildFiPayResponse(rawResponse) → FiPayResponse
  │
  ├── FiPayResponse.toTransactionResponse()
  │     └── parseFor101ExternalFiPayData(response101)
  │           ├── authcode = response101.get(AUTH_CODE)          ← from PAX
  │           ├── cardClass = response101.get(CARD_CLASS)        ← from PAX
  │           ├── cardToken = response101.get(CARD_TOKEN)        ← from PAX
  │           ├── expirationDate = response101.get(EXPIRY_DATE)  ← from PAX
  │           └── confirmationCode = Long.parse(response101.get(RRN))
  │
  ├── FiPayExternalDataGeneratorImpl.generate(response)
  │     └── transactionResponse.externalFiPayData
  │           (wraps with reqAmount, captureMethod)
  │
  ├── Stored in: FiPayGiftCardData.externalData (cart item extension)
  │
  ├── Checkout conversion:
  │     RetailCartItem → CheckoutItemFipayGiftcardData.externalData
  │       → CheckoutItemStoredValueDataJsonObject.externalData
  │         → CheckoutExternalFiPayDataJsonObject (sent to CAP)
  │
  └── AuditReporter.updateExpirationDates() reformats expirationDate to "MMyy"
```

### Root Cause Analysis

The fields are **null** in the CAP payload because:

1. **ExternalFiPayData never generated:** If `FiPayResponse.toTransactionResponse()` returns null (packet 101 missing from terminal response), `externalFiPayData` will be null → all nested fields null.

2. **ExternalData from balance inquiry vs activation:** Two points set `externalData`:
   - Step 5 (balance inquiry): `FiPayGiftCardUpdaterInteractor.execute()` → writes balance response data
   - Step 9 (activation/reload): `FiPayGiftCardActivationReloadFlow.handleActivationReloadSuccess()` → overwrites with activation response data

   If the **activation/reload response** doesn't contain these fields (different response format from balance check), the overwrite clears them.

3. **ExpirationDate specifically:** PAX may return `EXPIRY_DATE` as null for gift cards (they don't truly expire). `AuditReporter.getValidExpirationDate()` handles this by falling back to current date in "MMyy" format, but this only runs in the Audit flow, not in the main checkout payload path.

### Key Investigation Points

| Question | Where to Check |
|----------|----------------|
| Is packet 101 present in activation response? | Log `FiPayResponse.responsePackets` in `FiPayActivateInteractorImpl` |
| Does `toTransactionResponse()` return non-null? | `FiPayExternalDataGeneratorImpl.generate()` - check `transactionResponse` |
| Is `externalFiPayData` populated? | `FiPayResponse.parseFor101ExternalFiPayData()` - verify fields parsed |
| Is externalData overwritten at checkout? | `FiPayGiftCardActivationReloadFlow.handleActivationReloadSuccess()` line: `this.externalData = externalDataGenerator.generate(it.legacyResponse)` |
| Is expirationDate reformatted? | `AuditReporter.updateExpirationDates()` - only runs for audit, not main checkout |

### Key Files for This Issue

| File | Role in Quarantine Issue |
|------|--------------------------|
| `FiPayResponse.java` → `parseFor101ExternalFiPayData()` | Source of truth: parses authcode, cardToken, cardClass, expirationDate from PAX |
| `FiPayExternalDataGeneratorImpl.kt` | Wraps parsed data; if `transactionResponse?.externalFiPayData` is null → returns empty `ExternalFiPayData()` |
| `FiPayGiftCardActivationReloadFlow.kt` | Overwrites externalData at checkout with activation response |
| `CheckoutExternalFiPayDataConverter.kt` | Final serialization to JSON - maps all fields 1:1 (no field is filtered out here) |
| `CheckoutItemFipayGiftcardDataConverter.kt` | Wraps externalData into StoredValueData payload |
| `AuditReporter.kt` → `updateFiPayGiftCardExpirationDateFormat()` | Only handles expirationDate formatting for audit path |
| `ExternalFiPayData.java` | Builder pattern - if builder method not called, field stays null |

### CAP Payload Structure

```json
{
  "giftCards": {
    "action": "activation",
    "source": "FiPay",
    "amount": 50.00,
    "externalData": {
      "authcode": "123456",           ← MISSING → quarantine
      "cardClass": "STANDARD",        ← MISSING → quarantine
      "cardToken": "TOKEN123",        ← MISSING → quarantine
      "expirationDate": "1229",       ← MISSING → quarantine
      "confirmationCode": 789012,
      "cardStatusCode": "SUCCESS",
      "captureMethod": "SWIPED",
      "transactionType": "CARD_PRESENT",
      ...
    }
  }
}
```

### Fix Strategy

1. **Ensure activation/reload response from PAX contains packet 101** with the required fields
2. **If PAX doesn't return these fields for activation**, preserve them from the balance inquiry response instead of overwriting completely
3. **For expirationDate**: Apply the same fallback logic used in `AuditReporter.updateFiPayGiftCardExpirationDateFormat()` to the main checkout path

---

## Subtask: POS-1936 | FOH | Display Correct Label at Receipt ("Value Card Reload" & "Value Card Activation")

### Objective

Receipt item description must show "GC Activation" or "GC Reload" based on the balance inquiry result (not the CM's initial selection).

### Acceptance Criteria

| AC | CM Selects | Card Status | Receipt Item Description |
|----|-----------|-------------|--------------------------|
| AC1 | Value Card Activate | **Inactive** | **"GC Activation"** |
| AC2 | Value Card Activate | **Active** | **"GC Reload"** |
| AC3 | Value Card Reload | **Inactive** | **"GC Activation"** |
| AC4 | Value Card Reload | **Active** | **"GC Reload"** |

**Out of scope:** Value Card Cash Out flow

### Implementation: Two Receipt Sections

#### 1. Item Body Section — `UniversalItemizedMainBodyLinesStepsBuilder.kt`

The item body transforms the cart item name for receipt display:

```kotlin
// UniversalItemizedMainBodyLinesStepsBuilder.kt
private companion object {
    private const val VALUE_CARD_ACTIVATE_TEXT = "Value Card Activate:"
    private const val VALUE_CARD_ACTIVATE_TEXT_REPLACEMENT = "GC Activation: "
    private const val VALUE_CARD_RELOAD_TEXT = "Value Card Reload:"
    private const val VALUE_CARD_RELOAD_TEXT_REPLACEMENT = "GC Reload: "
}

private fun transformGiftCardItemName(itemLineName: String): String {
    if (!isGiftCardReloadOrActivateEnabled) return itemLineName  // Feature flag gate
    return trimmedName
        .replace(VALUE_CARD_ACTIVATE_TEXT, VALUE_CARD_ACTIVATE_TEXT_REPLACEMENT)
        .replace(VALUE_CARD_RELOAD_TEXT, VALUE_CARD_RELOAD_TEXT_REPLACEMENT)
}
```

**Logic:** Cart stores "Value Card Activate: XXXX" or "Value Card Reload: XXXX" → receipt transforms to "GC Activation: XXXX" or "GC Reload: XXXX"

**Dependency:** Cart must already have the correct SKU name (handled by `FiPayGiftCardMapperInteractorImpl`). If the cart has the wrong SKU, the receipt will have the wrong label.

#### 2. Payment Section — `ReceiptPaymentsExtractor.kt`

```kotlin
// ReceiptPaymentsExtractor.kt
private fun getGiftCardReceiptLabel(action: String?): String {
    if (!isGiftCardReloadOrActivateEnabled) return formatActionLabel(action)
    return when (action) {
        GIFTCARD_ACTION_ACTIVATION -> GIFTCARD_RECEIPT_ACTIVATION_LABEL  // "Value Card Activation"
        GIFTCARD_ACTION_RELOAD -> GIFTCARD_RECEIPT_RELOAD_LABEL          // "Value Card Reload"
        else -> formatActionLabel(action)
    }
}
```

**Note:** The payment section shows "Value Card Activation"/"Value Card Reload" (not "GC Activation"/"GC Reload"). This is correct per design — different sections have different labels.

### Traceability: How `action` Gets Set

The `action` field in `FiPayGiftCardData` (which flows to receipt) is set in:

```kotlin
// FiPayItemExt.kt
fun FiPayGiftCardData.updateSubpayment(subpayment: FiPaySubpayment) {
    this.subPayment = subpayment
    this.action = subpayment.mapToGiftCardAction()
}

fun FiPaySubpayment.mapToGiftCardAction(): String {
    return when(this.secondaryType) {
        SUBTYPE_GIFT_RELOAD -> GIFTCARD_ACTION_RELOAD          // "reload"
        SUBTYPE_GIFT_ACTIVATE -> GIFTCARD_ACTION_ACTIVATION    // "activation"
        SUBTYPE_GIFT_CASHOUT -> GIFTCARD_ACTION_CASHOUT        // "cash_out"
        else -> this.secondaryType
    }
}
```

This is called from `GiftCardAmountPresenter.updateGiftcardAmount()` which passes the `giftcardOptionType` based on the already-resolved status (Active→Reload, Inactive→Activate).

### Files to Modify (if fixing a bug here)

| Priority | File | What to Check |
|----------|------|---------------|
| 1 | `UniversalItemizedMainBodyLinesStepsBuilder.kt` | Is `transformGiftCardItemName()` being called? Is feature flag ON? |
| 2 | `FiPayGiftCardMapperInteractorImpl.kt` | Is the cart item name "Value Card Activate:" or "Value Card Reload:" before receipt? |
| 3 | `GiftCardAmountPresenter.kt` | Is `giftcardOptionType` correct when calling `updateGiftcardAmount()`? |
| 4 | `ReceiptPaymentsExtractor.kt` | Is `action` field "activation" or "reload"? |
| 5 | Feature flag `IsGiftCardReloadOrActivateEnabled` | Must be enabled for transformations to apply |

---

## Subtask: POS-1936 | PROD | CAP Validation

### Objective

Validate that:
1. `authCode` and `confirmationCode` are consistently present in CAP payloads for Value Card Activate/Reload
2. "Value Card Activate" and "Value Card Reload" SKUs are recognized as valid items in CAP
3. Feature flag `isGiftCardReloadOrActivateEnabled` is created and gates this epic

### Feature Flag

```kotlin
// Features.kt (line 64) — POS-17309
class IsGiftCardReloadOrActivateEnabled : Features("isGiftCardReloadOrActivateEnabled")
```

**Remote config key:** `isGiftCardReloadOrActivateEnabled`

**Used in:**
| File | Usage |
|------|-------|
| `UniversalItemizedMainBodyLinesStepsBuilder.kt` | Gates "Value Card Activate:" → "GC Activation:" transform on receipt body |
| `ReceiptPaymentsExtractor.kt` | Gates "Value Card Activation"/"Value Card Reload" labels on receipt payment section |

**Behavior when OFF:** Legacy labels shown, no SKU-based name transformation
**Behavior when ON:** Full POS-1936 logic active (correct SKU swap, receipt labels, CAP fields)

### CAP Validation Checklist

#### authCode and confirmationCode

| Field | Source | JSON path in payload |
|-------|--------|---------------------|
| `authcode` | `ExternalFiPayData.authcode` → `CheckoutExternalFiPayDataJsonObject.authcode` | `giftCards.externalData.authcode` |
| `confirmationCode` | `ExternalFiPayData.confirmationCode` (Long) → `CheckoutExternalFiPayDataJsonObject.confirmationCode` | `giftCards.externalData.confirmationCode` |

**Source parsing:** Both come from `FiPayResponse.parseFor101ExternalFiPayData()`:
- `authcode` = `response101.get(AUTH_CODE)`
- `confirmationCode` = `Long.parseLong(response101.get(RRN))`

#### SKU Validation in CAP

The item ID sent to CAP must match a configured item. The POS maps to correct SKU via:

```kotlin
// FiPayGiftCardMapperInteractorImpl.kt
ItemTable.getItemByName("VALUE CARD ACTIVATE", venueId, vendorId)  // Activate SKU
ItemTable.getItemByName("VALUE CARD RELOAD", venueId, vendorId)    // Reload SKU
```

**CAP requirement:** These item names/IDs must exist in the CAP item catalog for the venue. If not configured, transactions will quarantine even with valid auth data.

### Environment Contact

For CAP connection/environment questions: **@Facundo**

---

## Bug Fixed: GLB | POS-1936 - Activate Value Card SKU Incorrectly Displayed in Cart

### Bug

- **Actual:** Cart displays "GC activation" (legacy format)
- **Expected:** Cart displays "Value Card Activate"

### Root Cause

The cart item name is built by `FiPayTxnHelperExternal.buildItemNameFromGcData()` which is **feature-flag gated**:

```java
// FiPayTxnHelperExternal.java (line ~1202)
static String buildItemNameFromGcData(FiPayGiftCardData giftCardData, boolean isGiftCardReloadOrActivateEnabled) {
    String action = giftCardData.getAction();
    String title = isGiftCardReloadOrActivateEnabled
            ? getCardLabel(action)                                          // "Value Card Activate:" or "Value Card Reload:"
            : String.format(LEGACY_GC_TITLE_FORMAT, LEGACY_GC_PREFIX, action, LEGACY_GC_SUFFIX);  // "GC activation: "
    title += giftCardData.getAppMaskAcct() != null ? giftCardData.getAppMaskAcct() : giftCardData.getMaskedGcNum();
    return title;
}

public static String getCardLabel(String action) {
    return switch (action) {
        case GIFTCARD_ACTION_RELOAD -> "Value Card Reload:";      // FiPayConstants.GIFTCARD_RELOAD_LABEL
        case GIFTCARD_ACTION_ACTIVATION -> "Value Card Activate:"; // FiPayConstants.GIFTCARD_ACTIVATE_LABEL
        default -> String.format("GC %s:", action);                // GIFTCARD_DEFAULT_ACTION_LABEL
    };
}
```

### Constants

```java
// FiPayConstants.java
GIFTCARD_RELOAD_LABEL = "Value Card Reload:"
GIFTCARD_ACTIVATE_LABEL = "Value Card Activate:"
GIFTCARD_DEFAULT_ACTION_LABEL = "GC %s:"

// FiPayTxnHelperExternal.java
LEGACY_GC_PREFIX = "GC "
LEGACY_GC_SUFFIX = ": "
LEGACY_GC_TITLE_FORMAT = "%s%s%s"   // → "GC activation: "
```

### Where Cart Name Is Set

| Caller | File | Context |
|--------|------|---------|
| `GiftCardAmountPresenter.updateGiftcardAmount()` | `GiftCardAmountPresenter.kt` line 64 | After CM enters amount in dialog |
| `CartProxy` | `CartProxy.kt` line 2121 | When updating existing cart item |
| `FiPayTxnHelperExternal.populateRetailCartItemWithGcData()` | `FiPayTxnHelperExternal.java` line 1236 | Direct population from GC data |

### Fix

**Ensure feature flag `isGiftCardReloadOrActivateEnabled` is ON** — this switches from "GC activation:" (legacy) to "Value Card Activate:" (new).

If flag is already ON but still showing "GC activation:", check:
1. `giftCardData.getAction()` — must be `"activation"` (matches `GIFTCARD_ACTION_ACTIVATION`)
2. `getCardLabel()` switch statement — `"activation"` maps to `GIFTCARD_ACTIVATE_LABEL`
3. `FeatureFlagRepositoryProvider.INSTANCE.isInitialized()` — if not initialized, defaults to `false` (legacy)

### Also Built In: `FiPayGiftCardItemGeneratorImpl.getNameFromGiftCardData()`

```kotlin
// FiPayGiftCardItemGeneratorImpl.kt (line 134) — LEGACY path, used for initial item creation
title.append("GC ${giftcardData.action} : ")  // Always "GC activation : " or "GC reload : "
```

This is the **initial** name before `buildItemNameFromGcData()` overwrites it. If the overwrite doesn't happen (e.g., flow skips `GiftCardAmountPresenter`), the legacy name persists.

---

## Bug Fixed: GLB | POS-1936 | Cart SKU Displays Incorrect Text When Activating from Reload Option

### Bug

- **Scenario:** CM selects "VALUE CARD RELOAD" → inactive card detected → item added to cart
- **Actual:** Cart shows "Value Card Activate"
- **Expected:** Cart should show "GC Activation" (matching receipt body format)

### Context

This contradicts the earlier subtask that expected "Value Card Activate" in cart. The **updated requirement** (from POS-8688) is:
- **Cart** should display "GC Activation" / "GC Reload" (same as receipt body)
- **Receipt body** displays "GC Activation" / "GC Reload" ✅ (already working)
- **Receipt payment section** displays "Value Card Activation" / "Value Card Reload" ✅ (already working)

### Root Cause

`FiPayTxnHelperExternal.buildItemNameFromGcData()` with flag ON returns **"Value Card Activate:"** via `getCardLabel()`. But the new AC requires the **cart** to show "GC Activation:" — the same format the receipt body uses.

```java
// Current behavior (flag ON):
getCardLabel("activation") → "Value Card Activate:"   // ← This goes to cart

// Expected behavior (per updated AC):
// Cart should show "GC Activation:" (like receipt body)
```

### The Inconsistency

| Location | Current (flag ON) | Expected (updated AC) |
|----------|-------------------|----------------------|
| Cart item name | "Value Card Activate: XXXX" | "GC Activation: XXXX" |
| Receipt body | "GC Activation: XXXX" | "GC Activation: XXXX" ✅ |
| Receipt payment | "Value Card Activation" | "Value Card Activation" ✅ |

The receipt body **transforms** the cart name (`"Value Card Activate:" → "GC Activation:"` in `UniversalItemizedMainBodyLinesStepsBuilder`). The updated AC wants the **cart itself** to show the transformed format.

### Fix Options

1. **Change `buildItemNameFromGcData()`** to use the "GC Activation:"/"GC Reload:" format directly:
   ```java
   // In getCardLabel():
   case GIFTCARD_ACTION_ACTIVATION -> "GC Activation:";  // was "Value Card Activate:"
   case GIFTCARD_ACTION_RELOAD -> "GC Reload:";          // was "Value Card Reload:"
   ```
   **Impact:** Receipt body `transformGiftCardItemName()` would no longer need to do the replacement (it already matches). The DB lookup in `FiPayGiftCardMapperInteractorImpl` is **not affected** — it uses its own constant `GIFT_CARD_ACTIVATION = "VALUE CARD ACTIVATE"` (different from the display label).

2. **Apply transformation at cart display layer** — Keep internal item name as "Value Card Activate:" for DB/CAP purposes, but apply the same `transformGiftCardItemName()` logic when rendering in cart UI.

### Files Involved

| File | Role |
|------|------|
| `FiPayTxnHelperExternal.java` → `buildItemNameFromGcData()` | Builds cart item display name |
| `FiPayConstants.java` → `GIFTCARD_ACTIVATE_LABEL` / `GIFTCARD_RELOAD_LABEL` | Label constants |
| `UniversalItemizedMainBodyLinesStepsBuilder.kt` → `transformGiftCardItemName()` | Receipt body transform (already does "Value Card Activate:" → "GC Activation:") |
| `GiftCardAmountPresenter.kt` | Calls `buildItemNameFromGcData()` to set cart name |
| `CartProxy.kt` | Also calls `buildItemNameFromGcData()` |

---

## Bug Fixed: GLB | POS-1936 | Cart SKU Displays Incorrect Text When Reloading an Active Gift Card

### Bug

- **Scenario:** CM selects "VALUE CARD RELOAD" → active card confirmed → item added to cart
- **Actual:** Cart shows "Value Card Reload"
- **Expected:** Cart should show "GC Reload"

### Same Root Cause as Activation Bug

This is the **Reload counterpart** of the previous bug. Same fix applies:

`buildItemNameFromGcData()` with flag ON returns "Value Card Reload:" via `getCardLabel()`, but the updated AC (POS-8688) requires "GC Reload:" in cart.

```java
// Current:
getCardLabel("reload") → "Value Card Reload:"   // ← goes to cart ❌

// Expected:
// Cart should show "GC Reload:" (matching receipt body)
```

### Updated Full Requirements Table (POS-8688)

| Location | Inactive Card | Active Card |
|----------|---------------|-------------|
| **Cart** | "GC Activation: XXXX" | "GC Reload: XXXX" |
| **Receipt body** | "GC Activation: XXXX" | "GC Reload: XXXX" |
| **Receipt payment section** | "Value Card Activation" | "Value Card Reload" |

### Single Fix Point

Both cart bugs (activation + reload) are fixed in the same place:

```java
// FiPayTxnHelperExternal.java → getCardLabel()
// Change from:
case GIFTCARD_ACTION_RELOAD -> FiPayConstants.GIFTCARD_RELOAD_LABEL;        // "Value Card Reload:"
case GIFTCARD_ACTION_ACTIVATION -> FiPayConstants.GIFTCARD_ACTIVATE_LABEL;  // "Value Card Activate:"

// To:
case GIFTCARD_ACTION_RELOAD -> "GC Reload: ";          // matches receipt body
case GIFTCARD_ACTION_ACTIVATION -> "GC Activation: ";  // matches receipt body
```

**OR** use the existing constants from `UniversalItemizedMainBodyLinesStepsBuilder`:
- `VALUE_CARD_ACTIVATE_TEXT_REPLACEMENT = "GC Activation: "`
- `VALUE_CARD_RELOAD_TEXT_REPLACEMENT = "GC Reload: "`

**Caution:** Changing `getCardLabel()` means the receipt body transform in `transformGiftCardItemName()` won't find "Value Card Activate:"/"Value Card Reload:" to replace anymore. The transform should be updated to be a no-op (or removed) since cart already has the correct format.

---

## Bug Fixed: GLB | POS-1936 | Cart SKU Displays Incorrect Text When Activating an Already Active Gift Card

### Bug

- **Scenario:** CM selects "VALUE CARD ACTIVATE" → card is **active** → system correctly routes to Reload → item added to cart
- **Actual:** Cart shows "Value Card Reload"
- **Expected:** Cart should show "GC Reload"

### Same Root Cause

Identical to the previous two cart bugs. This confirms the SKU swap logic **works correctly** (active card → Reload action), but the **display format** is wrong ("Value Card Reload:" instead of "GC Reload:").

### All Cart Display Bugs Summary (Same Single Fix)

| Bug | CM Selects | Card Status | Actual | Expected |
|-----|-----------|-------------|--------|----------|
| Activation from Reload option | Reload | Inactive | "Value Card Activate" | "GC Activation" |
| Reload of active card | Reload | Active | "Value Card Reload" | "GC Reload" |
| **Activate of already active** | **Activate** | **Active** | "Value Card Reload" | "GC Reload" |

All three are fixed by changing `FiPayTxnHelperExternal.getCardLabel()` to return "GC Activation:"/"GC Reload:" format.

---

## Testing Checklist

- [ ] Inactive card → Activate SKU used regardless of CM selection (AC1, AC2)
- [ ] Active card → Reload SKU used regardless of CM selection (AC3)
- [ ] Cart displays "Value Card Activate" for inactive cards
- [ ] Cart displays "Value Card Reload" for active cards
- [ ] authCode present in CAP payload after successful activation
- [ ] authCode present in CAP payload after successful reload
- [ ] confirmationCode (RRN) present and non-zero
- [ ] cardClass present and non-empty
- [ ] Value Card Cash Out flow unaffected (out of scope but regression check)
