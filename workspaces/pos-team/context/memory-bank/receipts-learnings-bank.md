# Learnings Bank — Receipts Refactor (POS-18300)

> **Branch:** `receipts_feature_branch`
> **MR:** !4029
> **Feature Flag:** `IsReceiptDecisionsEnabled`
> **Last Updated:** 2026-06-30

---

## 1. Architecture & Design Patterns

### 1.1 Context → UseCase → Decision Pattern

- All receipt decisions follow: immutable `Context` data class → pure `UseCase` (fun interface) → immutable `Decision` data class
- UseCases are **flag-agnostic** — gating happens at the call site (builders/presenters), not inside the UseCase
- Fallback: if UseCase is null (not injected), builders fall back to legacy path automatically
- Pattern applies identically to all 6 UseCases: Tip, CopyCount, Tax, Total, ContentSections, DDP
- All new code is **additive** — no existing methods deleted, only deprecated

### 1.2 Feature Flag Strategy (`IsReceiptDecisionsEnabled`)

The flag controls **two separate concerns**:

**Concern 1 — Print Orchestration (Presenter/Delegate):**
| Aspect | Flag OFF | Flag ON |
|--------|----------|---------|
| Who decides what to print? | `buildInitReceiptObservables()` | `ResolveReceiptCopyDecisionUseCase` → `ReceiptJob` list |
| Who executes prints? | Direct gateway calls | `ReceiptCopyDecisionExecutor` iterates jobs |
| Copy count logic? | Inline in presenter | `ReceiptCopyDecision.jobs` determines everything |
| Voucher gating? | `createVoucherReceiptConfig()` | `addVoucherJobsFromTenderConfigs()` with `resolveStoreSlipType()` |

**Concern 2 — Content Rendering (StepsBuilder):**
| Section | Flag OFF | Flag ON |
|---------|----------|---------|
| Cash fields | Always shown if has cash payment | `ContentSectionsDecision.showCashFields` |
| Signature | `isMerchant && signatureRequired` | `ContentSectionsDecision.showSignature` |
| Transaction records | Always shown if list non-empty | `ContentSectionsDecision.showTransactionRecords` |
| Tips/Suggested tips | Direct logic in `getTipsSignatureSection` | `ResolveTipPrintDecisionUseCase` via `TipsLinesStepsBuilder` |
| DDP balance | Shows if `couponBalanceList` is non-empty | `DDPDecision.showBalance` |
| Tax | Calculated inline | `ResolveReceiptTaxUseCase` (stored vs calculated) |
| Total | Calculated inline | `ResolveReceiptTotalUseCase` (guest total excludes DDP amounts) |

**Graceful fallback pattern:**
```kotlin
private fun printInitReceipts() {
    if (isReceiptDecisionsEnabled()) {
        printInitReceiptsFromDecision()
    } else {
        printInitReceiptsLegacy()
    }
}

private fun printInitReceiptsFromDecision() {
    val useCase = resolveReceiptCopyDecisionUseCase ?: return printInitReceiptsLegacy()
    val executor = receiptCopyDecisionExecutor ?: return printInitReceiptsLegacy()
    // ... new path
}
```

### 1.3 Separation of Concerns

- **Phase 1 (WHAT to print):** `ResolveReceiptCopyDecisionUseCase` — operates BEFORE building receipt content
- **Phase 2 (HOW to render):** `ResolveTipPrintDecisionUseCase` — operates DURING receipt content building
- **Only coupling point:** `ReceiptJob.isFinalCopy`/`isMerchantCopy` flows into `TipPrintContext.isFinalCopy`/`isMerchantCopy`
- `ReceiptCopyDecisionExecutor` has ZERO decision logic — only maps jobs to gateway calls

### 1.4 Single Execution Authority (PRIORITY #1 Enforcement)

**Problem POS-11228 exposed:** Copy count decision layer was modeled but not enforced. Rules exist in UseCase (58 tests), but `ReceiptConfigGenerator` still ran the actual show. Anyone could modify `buildVouchers()`, `canPrintMerchantCopy()`, etc. without triggering any guard.

**Solution:** `ReceiptCopyDecisionExecutor` becomes the ONLY path to print receipts:
```kotlin
val context = receiptCopyContextFactory.build(order, trigger, userManager)
val decision = resolveReceiptCopyDecisionUseCase(context)
receiptCopyDecisionExecutor.execute(decision, order, gateway)
```

**Vulnerability map (before enforcement):**
```
UNPROTECTED (POS-11228 broke these):
  ReceiptPresenter.canPrintMerchantCopy()     → decides IF merchant copy prints
  ReceiptConfigGenerator.buildVouchers()      → decides WHICH payments get store copies
  ReceiptConfigGenerator.convertToReceipts…() → decides per-tender guest splitting
  MerchantStoreCopyHelper.storeSlipType()     → decides slip type per payment

PROTECTED (our refactor covers):
  ResolveTipPrintDecisionUseCase              → tip line rendering
  ResolveReceiptTaxUseCase                    → tax amounts
  ResolveReceiptTotalUseCase                  → total amounts
  ResolveReceiptContentSectionsUseCase        → cash/card/signature visibility
```

### 1.5 Single Source of Truth Prevents Cascading Regressions

- Tip line regressions (7-bug chain: POS-13763 → POS-15712 → POS-16919 → POS-17783 → POS-18063 → POS-18239 → POS-18401) caused by multiple `printSuggestedTips` overloads with conflicting defaults across 3 builders
- Copy count regressions (7-bug cycle) caused by `Repo.numberOfReceiptsToPrint` global mutable state + logic in 5+ files
- Solution: one UseCase = one decision = one place to change

### 1.6 ReceiptDecisionSectionRenderer Pattern

Static `object` with `renderXxxIfEnabled` methods — bridges between builders and Phase 3 use cases:
```kotlin
object ReceiptDecisionSectionRenderer {
    fun isEnabled(featureFlagRepo: FeatureFlagRepository?): Boolean
    fun renderTaxIfEnabled(...)
    fun renderTotalIfEnabled(...)
    fun renderContentSectionsIfEnabled(...)
    fun renderDDPIfEnabled(...)
}
```

### 1.7 executeJobAsObservable Bridge

RxJava-compatible bridge for callers still using Observable chains:
```kotlin
// In ReceiptCopyDecisionExecutor:
fun executeJobAsObservable(job, order, gateway): Observable<ReceiptStatus>
```
Used by `ReceiptPresenter` which feeds into existing `subscribeToPrinting()` chain.


---

## 2. Receipt Copy Count Rules

### 2.1 PrintTrigger → Job Behavior

| Trigger | Behavior |
|---------|----------|
| `CHECKOUT_INITIAL` | Guest + Merchant + Vouchers + Balance (if DDP) |
| `CLOSE_CHECK + isDining` | Exactly 1 ITEMIZED_FINAL job |
| `CLOSE_CHECK + !isDining` | ITEMIZED_FINAL + voucher jobs |
| `PENDING_CLOSE` | Never increments print counter |
| `ORDER_COMPLETION` | Never increments print counter |
| `BALANCE_PRINT` | Single BALANCE job, never increments counter |
| `REPRINT_*` + counter ≥ limit | Requires manager approval |
| `guestReceiptPerTender = true` | Splits guest copies by tender name |
| `SPLIT_CHECK` | `copyCount = splitPaymentCount` |

### 2.2 MerchantStoreCopyHelper / POS-11228 Lesson

- POS-11228 introduced `MerchantStoreCopyHelper.storeSlipType()` which gated merchant copies per-payment — broke 12 QA scenarios ("2 Guest + 0 Store" pattern)
- Root cause: logic scattered in `ReceiptConfigGenerator.buildVouchers()`, `canPrintMerchantCopy()`, `convertToReceiptsByTenderAsPerUserConfiguration()` — no centralized guard
- Fix: reverted POS-11228, absorbed the logic into `resolveStoreSlipType()` in our UseCase behind the feature flag
- `MerchantStoreCopyHelper` is now dead code (deletable)

### 2.3 PaymentTenderConfig & resolveStoreSlipType

```kotlin
data class PaymentTenderConfig(
    val paymentId: String,
    val tenderName: String,
    val allowsTips: Boolean,        // from Connect "Allow Tips" flag
    val requiresSignature: Boolean, // from Connect "Require Signature" flag
    val isDiningPlan: Boolean,
    val isRoomCharge: Boolean,
)

enum class MerchantStoreSlipType { TIP_SLIP, SIGNATURE_ONLY, NONE }
```

**resolveStoreSlipType priority rules (4 rules):**
```kotlin
private fun resolveStoreSlipType(config: PaymentTenderConfig): MerchantStoreSlipType = when {
    config.allowsTips -> TIP_SLIP
    config.requiresSignature -> SIGNATURE_ONLY
    config.isRoomCharge && config.allowsTips && hasDdpPaymentWithoutTips(config) -> TIP_SLIP
    else -> NONE
}
```

**Voucher job generation from configs:**
```kotlin
private fun addVoucherJobsFromTenderConfigs(context: ReceiptCopyContext): List<ReceiptJob> {
    return context.paymentTenderConfigs.flatMap { config ->
        val guestJob = ReceiptJob(type = VOUCHER_GUEST, tenderName = config.tenderName)
        val storeSlipType = resolveStoreSlipType(config)
        val storeJob = when (storeSlipType) {
            TIP_SLIP -> ReceiptJob(type = VOUCHER_MERCHANT, slipType = TIP_SLIP, ...)
            SIGNATURE_ONLY -> ReceiptJob(type = VOUCHER_MERCHANT, slipType = SIGNATURE_ONLY, ...)
            NONE -> null
        }
        listOfNotNull(guestJob, storeJob)
    }
}
```

Falls back to legacy `voucherCopiesPerPayment` when configs are empty.

### 2.4 Guard Conditions

- `isPrintInProgress = true` → reject with reason, empty jobs (prevents duplicates)
- `isOffline = true` → force `shouldIncrementPrintCounter = false` + `isReprint = false` on reprint jobs

### 2.5 ReceiptCopyContext (22 fields total)

```kotlin
data class ReceiptCopyContext(
    val trigger: PrintTrigger,
    val splitPaymentCount: Int,
    val guestReceiptPerTender: Boolean,
    val printMerchantCopy: Boolean,
    val isSignatureRequired: Boolean,
    val reprintLimit: Int,
    val currentPrintCounter: Int,
    val currentLocalPrintCounter: Int,
    val isDining: Boolean,
    val isPrintInProgress: Boolean,
    val isItemizedAutoPrintEnabled: Boolean,
    val isVouchersAutoPrintEnabled: Boolean,
    val shippingReceiptCopies: Int,
    val voucherCopiesPerPayment: List<Int>,
    val tenderNames: List<String>,
    val isDDPPayment: Boolean = false,
    val ddpBalance: String? = null,
    val isOffline: Boolean = false,
    val hasGiftCardPayment: Boolean = false,
    val paymentTenderConfigs: List<PaymentTenderConfig> = emptyList(),
    // ... remaining fields
)
```


---

## 3. Tip Print Decision Rules

### 3.1 Suppression Priority (ordered)

1. `isNonTippableTransaction` → suppress ALL (gift card activations, shipping-only)
2. `!isTipEnabled || !printTipsSignatureSection` → suppress ALL
3. `isRefund` → suppress ALL
4. `isFinalCopy` → suppress ALL suggestions
5. `isChitCheckReceipt` → only blank tip line (never suggested tips)
6. `isCloseCheckClick = true` → suppress suggestions AND tip line
7. `checkStatus = STATUS_SENT_TO_SERVER` → suppress suggestions AND tip line
8. `hasGratuity` → suppress suggested tips
9. `hasManuallyEnteredTip` (in standard flow) → suppress suggested tips
10. `!isTSR` → suppress suggested tips

### 3.2 Additional Tip Line

- Shows when `hasTipFee = true` AND status is eligible (not closed/sent)
- DDP-covered gratuity: hidden from Guest copy, shown on Merchant copy (`isGratuityDDPCovered`)
  - Guest: `isGratuityDDPCovered = true, isMerchantCopy = false` → `showAdditionalTipLine = false`
  - Store: `isGratuityDDPCovered = true, isMerchantCopy = true` → `showAdditionalTipLine = true`

### 3.3 Suggested Tips Calculation Base

- Standard: use `getEligibleItemPriceSubtotal` (only tip-eligible items)
- Partial payment: use `(eligibleSubtotal - paidAmount).coerceAtLeast(ZERO)` — tips on REMAINING balance
- Fallback: when `cartList` produces 0 (TSR partial payments where items live on the check), fall back to `checkoutOrder.subTotal`

### 3.4 TipPrintContext (23 fields total)

```kotlin
data class TipPrintContext(
    val isFinalCopy: Boolean,
    val isMerchantCopy: Boolean,
    val isRefund: Boolean,
    val isChitCheckReceipt: Boolean,
    val hasGratuity: Boolean,
    val hasManuallyEnteredTip: Boolean,
    val hasTipFee: Boolean,
    val hasTipFeeSuggestedTips: Boolean,
    val isPartialPaymentWithCredit: Boolean,
    val isDiningWithoutRoomCharge: Boolean,
    val isSignatureRequired: Boolean,
    val isTSR: Boolean,
    val hasCustomTips: Boolean,
    val isTipEnabled: Boolean,
    val printTipsSignatureSection: Boolean,
    val isCloseCheckClick: Boolean,
    val checkStatus: String?,
    val hideTotal: Boolean,
    val totalBeforeTip: BigDecimal,
    val suggestedTipLines: List<SuggestedTipLine>,
    val isNonTippableTransaction: Boolean = false,
    val isGratuityDDPCovered: Boolean = false,
    // ... remaining fields
)
```


---

## 4. Phase 3 Use Cases (Content Sections, DDP, Tax, Total)

### 4.1 ResolveReceiptContentSectionsUseCase

Decides cash fields, transaction records, and signature visibility:
```kotlin
data class ContentSectionsContext(...)
data class ContentSectionsDecision(
    val showCashFields: Boolean,
    val showSignature: Boolean,
    val showTransactionRecords: Boolean,
)
```

Wired in `DisneyItemizedMainReceiptStepsBuilder`:
| Section | Decision field |
|---------|---------------|
| `buildPaymentSection` | `showCashFields` |
| `getSignatureSection` | `showSignature` |
| `getTransactionRecordsSection` | `showTransactionRecords` |

### 4.2 ResolveDDPReceiptDataUseCase

Decides DDP display name, balance, and offline constraints:
```kotlin
data class DDPContext(...)
data class DDPDecision(
    val showBalance: Boolean,
    val displayName: String?,
    // ... balance fields
)
```

Wired in `getCouponBalanceSection()`.

### 4.3 ResolveReceiptTaxUseCase

Decides stored vs. calculated tax (important for refunds):
```kotlin
data class TaxContext(...)
data class TaxDecision(...)
```

### 4.4 ResolveReceiptTotalUseCase

Decides total calculation — guest total excludes DDP-covered amounts:
```kotlin
data class TotalContext(...)
data class TotalDecision(...)
```

### 4.5 Wiring Pattern

All Phase 3 use cases are accessed via `ReceiptDecisionSectionRenderer` (static object):
```kotlin
// In DisneyItemizedMainReceiptStepsBuilder:
if (ReceiptDecisionSectionRenderer.isEnabled(featureFlagRepo)) {
    ReceiptDecisionSectionRenderer.renderTaxIfEnabled(...)
} else {
    // legacy inline rendering
}
```

---

## 5. Bug Root Causes & Fixes

### 5.1 POS-19566 — PRINT CHECK button doubles tip in receipt

- **Root cause:** Tip amount added twice — once during receipt building and once during print-check-specific path
- First fix (MR !4441) was incomplete — only worked for some venues
- CQE failed validation on store WDW TSR 0835 (tip still doubled)
- Second fix (MR !4528) resolved the issue — CQE passed on build 46861
- **Lesson:** Always validate CQE on multiple store configs before marking done

### 5.2 Scenario 1.1 — Close Check not printing final receipt

- `CloseCheckInteractor` → `CloseOrderInteractor` → `PrintItemizedMerchantCheckInteractor.determineReceiptActions` returned empty for TSR orders
- `PrintUpdatedMerchantReceiptInteractor` is only called from `AddTipBaseDelegate.finalizeAndCloseCheck()`, NOT from the checks screen path
- **Root cause of finalization bug:** After `finalizeAndCloseCheck`, the order status hasn't been updated in the DB yet (async sync), so it still reads as `ORDER_STATUS_DELAYED_CHARGE` → takes merchant copy branch instead of guest
- Fix: added `isFinalization: Boolean = false` param; when `true`, forces `isDelayedCharge = false`
- `AddTipBaseDelegate.finalizeAndCloseCheck()` passes `isFinalization = true` and `incrementPrintCounter = false`

### 5.3 Scenario 1.10 — Partial payment suggested tips missing

- **Two bugs:**
  1. `CheckoutOrder.cartList` is empty for TSR partial payments (items live on the check) → `getEligibleItemPriceSubtotal = 0` → `getSuggestedTips(0)` returns empty
  2. Tips calculated on full subtotal instead of remaining balance
- Fix: fall back to `checkoutOrder.subTotal` when `cartList` produces 0; calculate tips base as `(eligibleSubtotal - paidAmount).coerceAtLeast(ZERO)`
- `paidAmount` is null after `injectPartialPaymentsIfNeeded()` → fall back to summing `payment.subtotalAmount`
- **Important:** Per POS-2098, when gratuity/open tip IS on a check, suggested tips should be hidden (prevents double-tipping). Fix only applies when there's NO gratuity.

### 5.4 Scenario 8.22 — Offline DDP + partial payment print button hidden

- Cart state becomes `CartState.EmptyCheck` (empty cart + check selected + `retailCart.total == 0`)
- `EmptyCheck` was NOT in `checkAllowPrinting()` allowed list
- Fix: Added `EmptyCheck + isPartialPayment` condition
- **NOT behind feature flag** — direct bug fix that ships immediately

### 5.5 Scenario 6.4 — Offline balance prints "Final Copy"

- `PrintChecksDelegateImpl` used wrong gateway method
- Fix: use `printBalanceItems()` instead

### 5.6 POS-2098 Rule

- When gratuity/open tip IS on a check, suggested tips MUST be hidden (prevents double-tipping)

### 5.7 POS-11228 — QA Failure Attribution

- 21 of 24 automation scenarios failing in QA retest
- **12 failures attributed to POS-11228** (the "2 Guest + 0 Store" pattern)
- Our refactor NOT the cause — operates at different layer
- Dominant failure mechanism: `storeSlipType()` returns `NONE` for payments in QA test environment → merchant voucher NOT built → 2 guest copies, 0 store copies
- Reverted via MR !4306 — all POS-11228 artifacts surgically removed from our branch


---

## 6. Receipt Converters & Configuration

### 6.1 ItemizedReceiptConverter

- **Order-based converter:** `convert(checkoutOrder, ...)` — uses `cartList` for item subtotal
- **Check-based converter:** `convert(check, retailCart, updatedOrders)` — uses updatedOrders for `totalPaid`
- `isChitCheckReceipt` = `totalPaid == 0` — balance prints WITH payments are NOT chit checks
- `paidAmount` on `CheckoutOrder` can be null after `injectPartialPaymentsIfNeeded()` — always handle null
- Fallback: when `paidAmount` is null/zero, sum `payment.subtotalAmount` from actual payments

### 6.2 ReceiptConfigGenerator

- `buildVouchers()` — builds voucher receipt content per payment
- `convertToReceiptsByTenderAsPerUserConfiguration()` — splits guest receipt by tender
- `createVoucherReceiptConfig()` — decides IF voucher has printable content
- After POS-11228 revert: always produces merchant voucher copies, no slip-type gating in legacy path
- POS-11228 artifacts fully removed: no `MerchantStoreCopyHelper`, no `MerchantStoreSlipType`, no `paymentMatchesTenderLine()`

---

## 7. Key Integration Points

### 7.1 ReceiptPresenter (checkout flow)

- Flag ON: `printInitReceiptsFromDecision()` → ContextFactory → UseCase → Executor (`executeJobAsObservable`)
- Flag OFF: `printInitReceiptsLegacy()` → `buildInitReceiptObservables()`
- Nullable constructor params: `ReceiptCopyDecisionExecutor?`, `ResolveReceiptCopyDecisionUseCase?`, `FeatureFlagRepository?`

### 7.2 PrintChecksDelegateImpl (checks screen)

- Flag ON: `printCheckoutOrderFromDecision()` — determines trigger from order status
- Flag OFF: `printCheckoutOrderLegacy()`
- Uses `PrintTrigger.BALANCE_PRINT` when "Print Balance" button is pressed

### 7.3 DisneyItemizedMainReceiptStepsBuilder (content rendering)

- Flag ON: delegates to `ReceiptDecisionSectionRenderer` which calls Tax/Total/Content/DDP UseCases
- Flag OFF: inline legacy rendering
- Universal builder deferred — Disney/Enterprise validated first

### 7.4 CartPresenter (print button visibility)

- `checkAllowPrinting()` — allows `EmptyCheck` when `isPartialPayment` or `NON_CLEARABLE_STATUSES`
- Not behind feature flag — direct bug fix

### 7.5 AddTipBaseDelegate (tip finalization)

- `finalizeAndCloseCheck()` passes `isFinalization = true` to `PrintUpdatedMerchantReceiptInteractor`
- Executor wired as param

---

## 8. Testing

### 8.1 Key Test Commands

```bash
# All receipts decision tests (Phase 1-3)
./gradlew :AppetizeActivate:testDisneyDebugUnitTest --tests "com.appetizeactivate.android.main.receipts.decisions.*"

# All receipts tests
./gradlew :AppetizeActivate:testDisneyDebugUnitTest --tests "com.appetizeactivate.android.main.receipts.*"

# Cart presenter tests
./gradlew :AppetizeActivate:testDisneyDebugUnitTest --tests "com.appetizeactivate.android.main.components.cart.CartPresenterTest"

# Checks delegate tests
./gradlew :AppetizeActivate:testDisneyDebugUnitTest --tests "com.appetizeactivate.android.checks.delegates.print.*"

# Tips interactor tests
./gradlew :AppetizeActivate:testDisneyDebugUnitTest --tests "com.appetizeactivate.android.main.interactor.tips.*"

# Payment delegate tests
./gradlew :AppetizeActivate:testDisneyDebugUnitTest --tests "com.appetizeactivate.android.retail.ui.mvp.presenter.payment.base.*"

# Build APK
./gradlew :AppetizeActivateApp:assembleDisneyDebug
```

### 8.2 Test Stats

- Total new decision tests: 162+ (58 copy, 27 tip, 12 factory, 15 executor, 8 tax, 10 total, 17 content, 15 DDP)
- Total receipts tests passing: 839+
- Total project tests passing: 1,410+
- Coverage: ≥90% on all new UseCases

### 8.3 Test Patterns for Receipt Decisions

- All decision tests use: build Context with specific values → invoke UseCase → assert Decision fields
- Use file-level constants (not companion object) in test files
- Use `GeneralConstantToTest.kt` for reusable test constants (tender names, prices)
- Named constants: `SINGLE_COPY`, `COUNTER_ZERO`, `ZERO_VOUCHER_COPIES`, `TOTAL_TEXT`, `PRICE_10`
- Tender constants: `TENDER_NAME_VISA`, `TENDER_NAME_CASH`, `TENDER_NAME_GIFT` in `// region tenders`
- `tearDown()` with `unmockkAll()` is mandatory per conventions for flaky test prevention
- Negative verify: `verify(exactly = 0) { gateway.method(any()) }`

### 8.4 Smoke Test Checklist (10 Critical Scenarios)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Merchandise checkout — single credit card | 1 Guest + 1 Store copy, voucher per payment |
| 2 | Merchandise checkout — cash payment | 1 Guest (with Cash Entered/Change lines) |
| 3 | TSR checkout — open check, add items, submit, close | Final copy prints with tip/total |
| 4 | TSR partial payment — split check with DDP | Balance receipt shows suggested tips |
| 5 | Offline DDP + partial payment (8.22) | Print button visible and functional |
| 6 | Reprint from Thank You screen | Reprint label shows, correct copy count |
| 7 | Reprint from checks screen (PCWT) | Balance or reprint depending on status |
| 8 | Close check from pending close | Final copy prints |
| 9 | DDP balance section on receipt | "Disney Dining Plan Balance" + balance lines |
| 10 | Multi-tender checkout (credit + cash) | Per-tender splitting works correctly |


---

## 9. Extension Coverage Analysis

### 9.1 Coverage Growth

- 6 optional fields extended coverage from 16 → 32 of 38 scenarios (42% → 84%)
- All extensions use default values — zero breaking changes

| Extension | Effort | Scenarios Unlocked |
|-----------|--------|-------------------|
| `isDDPPayment` | Small | 8 scenarios |
| `isGratuityDDPCovered` | Small | 2 scenarios |
| `PrintTrigger.BALANCE_PRINT` | Small | 3 scenarios |
| `isOffline` | Small | 2 scenarios |
| `isNonTippableTransaction` | Trivial | 1 scenario |
| `hasGiftCardPayment` | Small | 1 scenario |

### 9.2 Remaining Coverage Gaps (Out of Scope)

| Layer | Scenarios | Needed |
|-------|-----------|--------|
| Tax calculation/rendering | 1.1–1.6, 7.6, 7.7 | `ResolveReceiptTaxUseCase` |
| Receipt content builder | 2.4, 2.5, 3.1 | Template conditional sections |
| Offline infrastructure | 3.2, 3.4, 7.12, 7.18 | `OfflinePrintQueueManager` + sync |
| DDP template/nomenclature | 3.5, 3.7, 4.3, 4.7, 4.8 | `DDPReceiptTemplateResolver` |
| Total calculation | 4.6, 7.3 | `ResolveReceiptTotalUseCase` |
| UI state | 5.3, 5.4 | ViewModel layer |

---

## 10. Git & CI Lessons

### 10.1 Don't rebase -i HEAD~N when branch depends on another PR's commit

- `git rebase -i HEAD~2` squashed our commit with the dependency PR's commit — created 50-file monster commit
- Fix: `git reset --soft <parent-commit-sha>` then `git commit` to re-create only our delta
- Rule: only squash commits that are YOURS. Use `git rebase -i <your-first-commit>~1`

### 10.2 Don't fix SonarQube issues on files modified by other in-flight PRs

- Check `git log --all -- <file>` before touching files for pre-existing issues
- Example: fixing SonarQube in `PrintUpdatedMerchantReceiptInteractor.kt` conflicted with POS-17536

### 10.3 MR Conflicts from POS-11228

- After POS-11228 revert merged to main, we merged into our branch and resolved conflicts
- Kept ours for builder files (our Phase 1/2 wiring)
- Surgically removed all POS-11228 artifacts from `ReceiptConfigGenerator`:
  - Removed `MerchantStoreCopyHelper` import and all usages
  - Removed `MerchantStoreSlipType` references
  - Removed `paymentMatchesTenderLine()` helper
  - Restored `convertToReceiptsByTenderAsPerUserConfiguration()` to pre-POS-11228 version
  - Restored `buildVouchers()` to always produce merchant copies
  - Removed `merchantSlipType` from `VoucherReceiptBuildParams`

### 10.4 Commit Strategy

- Single commit before push (`--amend` when adding fixes to existing commit)
- Only push after smoke test confirms fixes
- Use `--force-with-lease` (not `--force`) when amending

### 10.5 Conventions

- **Branch naming:** `receipts_feature_branch` (for this refactor), `refactor/{jiraTicketId}` (general pattern)
- **Commit format:** `fix: approach to solve common pain points on receipts [POS-18300]`
- **Feature flag pattern:**
  ```kotlin
  if (featureFlagRepository?.isFeatureEnabled(Features.IsReceiptDecisionsEnabled()) == true) {
      // new decision path
  } else {
      // legacy path (unchanged)
  }
  ```
- **Hilt module pattern:**
  ```kotlin
  @Module
  @InstallIn(SingletonComponent::class)
  abstract class ReceiptDecisionsModule {
      @Binds
      abstract fun bindResolveXxxUseCase(impl: ResolveXxxUseCaseImpl): ResolveXxxUseCase
  }
  ```

---

## 11. File Structure Reference

```
gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/receipts/
├── decisions/
│   ├── di/ReceiptDecisionsModule.kt
│   ├── copycount/
│   │   ├── model/ (ReceiptCopyContext, PrintTrigger, ReceiptCopyDecision, ReceiptJob, ReceiptJobType, PaymentTenderConfig, MerchantStoreSlipType)
│   │   ├── ResolveReceiptCopyDecisionUseCase.kt (fun interface)
│   │   ├── ResolveReceiptCopyDecisionUseCaseImpl.kt
│   │   ├── ReceiptCopyContextFactory.kt
│   │   └── ReceiptCopyDecisionExecutor.kt
│   ├── tipprint/
│   │   ├── model/ (TipPrintContext, TipPrintDecision, SuggestedTipLine)
│   │   ├── ResolveTipPrintDecisionUseCase.kt
│   │   └── ResolveTipPrintDecisionUseCaseImpl.kt
│   ├── tax/
│   │   ├── model/ (TaxContext, TaxDecision)
│   │   └── ResolveReceiptTaxUseCase[Impl].kt
│   ├── total/
│   │   ├── model/ (TotalContext, TotalDecision)
│   │   └── ResolveReceiptTotalUseCase[Impl].kt
│   ├── contentsections/
│   │   ├── model/ (ContentSectionsContext, ContentSectionsDecision)
│   │   └── ResolveReceiptContentSectionsUseCase[Impl].kt
│   └── ddp/
│       ├── model/ (DDPContext, DDPDecision)
│       └── ResolveDDPReceiptDataUseCase[Impl].kt
├── builders/
│   ├── DisneyItemizedMainReceiptStepsBuilder.kt
│   ├── UniversalVoucherReceiptStepsBuilder.kt
│   ├── TipsLinesStepsBuilder.kt
│   └── ReceiptDecisionSectionRenderer.kt (object)
└── converters/
    ├── ItemizedReceiptConverter.kt
    └── BuildItemsLinesReceiptDataInteractor.kt
```

### Test files mirror source:
```
gc/AppetizeActivate/src/test/java/com/appetizeactivate/android/main/receipts/decisions/
├── copycount/
│   ├── ResolveReceiptCopyDecisionUseCaseImplTest.kt (58 tests)
│   ├── ReceiptCopyContextFactoryTest.kt (12 tests)
│   └── ReceiptCopyDecisionExecutorTest.kt (15 tests)
├── tipprint/
│   └── ResolveTipPrintDecisionUseCaseImplTest.kt (27 tests)
├── tax/...
├── total/...
├── contentsections/...
└── ddp/...
```


---

## 12. Compatibility Notes

### 12.1 POS-18545 (UniversalVoucherReceiptStepsBuilder totals/subtotal section)

- Their change: adds `isMerchantCopy` condition to show/hide totals block
- Our change: tip/signature section below totals
- **Fully compatible** — different sections, no overlapping lines, no merge conflict expected
- NOTE: Their original proposal drops the `else` branch (regression). Correct fix must keep `else`.

### 12.2 POS-11228 Revert

- 12 of 21 QA failures attributed to POS-11228 (the "2 Guest + 0 Store" pattern)
- Our refactor NOT the cause — operates at different layer:
  - POS-11228 operates at: `ReceiptConfigGenerator.buildVouchers()` → should I BUILD this copy?
  - Our refactor operates at: `ResolveReceiptCopyDecisionUseCase` → HOW MANY copies / WHAT to render
- Once reverted, our decision layer produces correct results on top of correctly-built receipts

### 12.3 Architecture Layer Separation

```
POS-11228 operates here (BUILD layer):
  ReceiptConfigGenerator.buildVouchers() → should I BUILD this copy?
  ReceiptPresenter.canPrintMerchantCopy() → should I PRINT at all?

Our refactor operates here (DECISION layer):
  ResolveTipPrintDecisionUseCase → WHAT to render on an already-built copy
  ResolveReceiptCopyDecisionUseCase → HOW MANY copies (models the rules)
  ResolveReceiptTaxUseCase → tax calculation
  ResolveReceiptTotalUseCase → total calculation
```

---

## 13. How to Add a New Receipt Rule

1. Add field to relevant Context data class (with default value for backward compatibility)
2. Add logic to UseCase Impl (new branch in `when` or new private helper)
3. Add field to Decision data class (with default value)
4. Use decision field in builder (guarded by `isReceiptDecisionsEnabled()`)
5. Write tests: `given <field value> when <invoked> then <decision field value>`
6. Populate field at call site (ContextFactory or ReceiptDecisionSectionRenderer)

**All existing tests must pass without modification.** New tests are additive only.

---

## 14. Thumper Review — Resolved Patterns

### 14.1 Valid Feedback Applied

| # | File | Change |
|---|------|--------|
| 1 | `ResolveReceiptCopyDecisionUseCaseImplTest.kt` | Removed 2 duplicate regression tests, added ticket refs to originals |
| 2 | `ReceiptCopyDecisionExecutor.kt` | Added comment explaining shared VOUCHER_MERCHANT/GUEST routing |
| 3 | `UniversalVoucherReceiptStepsBuilder.kt` | Added inline comments on hardcoded `false` values in `buildTipPrintContext` |
| 4 | `TipsLinesStepsBuilderTest.kt` | Replaced hardcoded `"Total:"` with `TOTAL_TEXT` constant |
| 5 | `ReceiptCopyDecisionExecutorTest.kt` | Added `verify(exactly = 0) { gateway.printBalanceItems(any()) }` |
| 6 | `ResolveReceiptCopyDecisionUseCaseImpl.kt` | Moved `guestCopyCount` inside the `else` block |

### 14.2 Rejected Feedback (with justification)

| Feedback | Justification |
|----------|--------------|
| "Extract guest copy logic from `resolveCheckoutInitial`" | 25 lines with clear sequential blocks, extraction adds indirection without benefit |
| "Split multi-assertion mapping test" | Single-behavior test (field mapping), JUnit 4 has no `assertAll` |
| "Empty tearDown" | `unmockkAll()` is mandatory per conventions for flaky test prevention |
| "Nested when redundancy" | Guards against misconfiguration edge case, reads correctly top-to-bottom |
| "Reorder when branches" | Would change semantics (different branch priority) |
| "Extract mock setup helper" | Hides which fields are relevant to each test, harder to diagnose failures |
| "SINGLE_COPY in resolveSplitCheck" | Already addressed — code uses `coerceAtLeast(SINGLE_COPY)` |
| "Duplicate tip/total line logic" | Already addressed — `buildTipLineWithTotal()` private helper exists |

---

## 15. Remaining Work & Task Status

### 15.1 Completed Phases

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Extensions (6 fields) | ✅ DONE |
| Phase 2 | Tax & Total Use Cases | ✅ DONE |
| Phase 3 (partial) | Content Sections + DDP Use Cases | ✅ DONE (Disney builder) |
| Executor wiring | ReceiptPresenter, PrintChecksDelegateImpl, CartPresenter | ✅ DONE |
| POS-11228 cleanup | Revert merged, artifacts removed | ✅ DONE |
| Bug fixes | 1.1, 1.10, 8.22, 6.4 | ✅ DONE |


### 15.2 AC Corrections Needed (Documentation Only)

| Scenario | Issue | Correction |
|----------|-------|-----------|
| 8.6 | Contradiction: "full refund" + "credit portion only" | Rewrite: test partial refund OR remove "credit portion only" |
| 8.8 | Contradiction: "1 Guest + 1 Store" on split tender | Rewrite: assert per-tender behavior (2+1) or specify flag precondition |
| 2.7 | Incorrect: expects "Balance copy" label | Fix: assert "Guest Copy" label (confirmed with Mariano) |
| 7.6 | Ambiguous: "coverage label" undefined | Clarify: replace with expected text ("Gratuity" line with total amount) |
| 8.9 | Modified mid-test for POS-2098 | Restore original AC + create separate gratuity + Additional Tip scenario |

---

## 16. Code Review Changes Applied in Code Review (Session Summary)

1. Merged `VOUCHER_MERCHANT` + `VOUCHER_GUEST` branches in executor (same gateway call)
2. Simplified `resolveSuggestedTips` with `with(tipPrintInput)` and merged `hasGratuity || hasManuallyEnteredTip`
3. Simplified `resolveShowTipLine` with `with(tipPrintInput)` + named `isStatusEligible`/`shouldShowByConfig`
4. Extracted `FILL_LINE` constant in `TipsLinesStepsBuilder`, used `label.get(Label.Key.TOTAL)` instead of hardcoded "Total:"
5. Moved test constants from `companion object` to file-level in all 3 test files
6. Replaced `copyCount = 1` magic numbers with `SINGLE_COPY` constant
7. Extracted `TENDER_NAME_VISA/CASH/GIFT` to `GeneralConstantToTest.kt` (new `// region tenders`)
8. Added `COUNTER_ZERO` and `ZERO_VOUCHER_COPIES` constants
9. Replaced hardcoded `"10.00"` with `PRICE_10` in voucher builder test
10. Converted `ReceiptCopyDecisionExecutor` from `Observable` to `Flow` (both `execute()` and `executeJob()`)

