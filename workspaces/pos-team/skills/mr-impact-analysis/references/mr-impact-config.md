# MR Impact Analysis — configuration

Feature flag registry, epic mapping, and owned code paths for the MR Impact Analysis agent.

---

## Epic 2.1.1 — Unguarded code (NO feature flags — highest risk)

These features are live on main with **no feature flag protection**. If a Disney 2.0.X merge breaks them, there is no off-switch. Treat conflicts as **Critical by default**.

### Domains and epics

| Domain              | Jira     | Summary                                                           | Team             |
|---------------------|----------|-------------------------------------------------------------------|------------------|
| Checks / Split      | POS-1026 | Split Check — warning when navigating away                        | Studio Galactus  |
| Checks / Split      | POS-1052 | Split Check — update table number and guest count                 | Studio Galactus  |
| Checks / Split      | POS-2048 | Split Check — move items by seat number                           | Studio Galactus  |
| Checks / Split      | POS-2049 | Split Check — update display and default split types              | Studio Galactus  |
| Checks / Split      | POS-2052 | Split Check — notify fees/gratuities on split                     | Studio Galactus  |
| Checks / Split      | POS-2054 | Split Check — notify discounts on split                           | Studio Galactus  |
| Checks / Split      | POS-2056 | Split Check — connect admin discount configuration                | Studio Galactus  |
| Checks / Split      | POS-2059 | Split Check — confirm & print prompt                              | Studio Galactus  |
| Checks / Split      | POS-2078 | Split Check — connect admin fee configuration                     | Studio Galactus  |
| Checks / Combine    | POS-2061 | Combine Check — connect admin discounts/fees/tips/gratuities      | Studio Galactus  |
| Checks / Combine    | POS-2062 | Combine Check — auto-remove logic                                 | Studio Galactus  |
| Checks / Combine    | POS-2063 | Combine Check — cancel/confirm/confirm & print prompt             | Studio Galactus  |
| Checks / Combine    | POS-1907 | Combine Check — update table number and guest count               | Studio Galactus  |
| Checks / Menu       | POS-1891 | Checks Menu — update check card design                            | Studio Galactus  |
| Checks / Menu       | POS-1920 | Checks Menu — reduce transition latency                           | Studio Galactus  |
| Checks / Menu       | POS-2060 | Checks Menu — compact size option                                 | Studio Galactus  |
| Checks / Menu       | POS-1370 | Checks Menu — manager override on table number edit               | Studio Galactus  |
| Checks / Menu       | POS-2069 | Checks Status — update names                                      | Studio WALL-E    |
| Checks / Transfer   | POS-1815 | Transfer Check — transfer after applied tender                    | Studio Galactus  |
| Checks / Submit     | POS-1293 | Submit Check — submit & print button                              | Studio Galactus  |
| Gratuities / Tips   | POS-1056 | Prevent multiple gratuities on check                              | Studio Galactus  |
| Gratuities / Tips   | POS-788  | Auto-apply gratuity fee improvements                              | Studio Mini Max  |
| Gratuities / Tips   | POS-1599 | Suggested tip calculation improvements                            | Studio Galactus  |
| Gratuities / Tips   | POS-1722 | Block tips on certain tenders                                     | Studio Galactus  |
| Gratuities / Tips   | POS-2098 | Update tipping receipt logic                                      | Studio Galactus  |
| Gratuities / Tips   | POS-7803 | Package plan covered gratuities (sale only)                       | Studio Hiro      |
| Receipts            | POS-1782 | Receipt — show cash entered and change due                        | Studio Tadashi   |
| Receipts            | POS-1383 | TSR Receipts — optimized guest and store receipts                 | Studio Galactus  |
| Receipts            | POS-1251 | Print option — print all guest and store copies                   | Studio Galactus  |
| Discounts           | POS-1865 | System should not auto-apply item level discounts on new items    | Studio Loki      |
| Cart / Items        | POS-2304 | Allowable modifier with instruction                               | Studio Mini Max  |
| Cart / Items        | POS-1335 | Items — support open price AND item set assigned                  | Studio Hiro      |
| Cart / Items        | POS-1515 | Item restrictions with validations                                | Studio Hiro      |
| Item Countdown      | POS-2286 | Item Countdown — adjust quantity from terminal                    | Studio Hiro      |
| Item Countdown      | POS-2220 | Item Countdown — offline handling                                 | Studio Hiro      |
| Item Countdown      | POS-2219 | Item Countdown — check quantity at checkout                       | Studio Hiro      |
| Item Countdown      | POS-1966 | Item Countdown — configuration UI in back office                  | Studio WALL-E    |
| Hold and Fire       | POS-2081 | Hold and Fire — edit unfired items without manager                | Studio Galactus  |
| Login / Auth        | POS-1050 | Auto sign off additional scenarios in TSR                         | Studio Galactus  |
| Login / Auth        | POS-1049 | TSR signoff — delayed auto sign off                               | Studio Galactus  |
| Login / Auth        | POS-1262 | Application lock — 2nd inactivity timer for 3rd party apps       | Studio Galactus  |
| Login / Auth        | POS-1365 | Prevent overrides on locked employee account                      | Studio Hiro      |
| Tabs                | POS-6945 | Tabs — update historical tabs code                                | Studio Mini Max  |
| Tabs                | POS-6625 | Tabs — general configuration                                      | Studio Mini Max  |
| Tabs                | POS-6624 | Tabs — create and close                                           | Studio Mini Max  |
| Gift Card           | POS-1646 | Gift card masking enhancements                                    | Studio Mini Max  |
| Gift Card           | POS-1091 | Cart actions — disable gift card options config                   | Studio WALL-E    |
| Categories          | POS-6543 | POS categories — default category based on day part               | Studio Mini Max  |
| Electronic Journal  | POS-3665 | Electronic Journal — PRINT activity                               | Studio Mini Max  |
| Electronic Journal  | POS-2323 | Electronic Journal — update/fix keystroke activities              | Studio Hiro      |
| Electronic Journal  | POS-2322 | Electronic Journal — enhance MVP tool                             | Studio Tadashi   |
| Electronic Journal  | POS-1939 | Electronic Journal — seat/course numbers on item activities       | Studio Mini Max  |
| Reports             | POS-5301 | Reports — cash responsibility calculation                         | Studio Mini Max  |
| Reports             | POS-1297 | Tax configuration report                                          | Studio WALL-E    |
| Reports             | POS-1373 | Analytical report — package plan report                           | Studio WALL-E    |
| CoreAPI             | POS-4178 | Store CoreAPI item updates in history tab                         | Studio Mini Max  |
| Refund              | POS-2475 | Close 0.00 balance check without tender menu                     | Studio Hiro      |
| Refund              | POS-2093 | Disable exchanges in TSR store group                              | Studio Mini Max  |
| Refund              | POS-1257 | Offline order limit for non-receipted refunds                    | Studio Tadashi   |
| Orders              | POS-1330 | Order types in DSP and QSRA                                       | Studio Hiro      |
| Proxy Server        | POS-2066 | Proxy server — configure roles and status                         | Studio Hiro      |
| Security            | POS-1552 | Connect configuration security options                            | Studio WALL-E    |
| Security            | POS-1550 | Back office — restricted configurations consistency               | Studio WALL-E    |
| SailPoint           | POS-6710 | Enable DSP to receive SailPoint user access data                  | Studio Mini Max  |
| SailPoint           | POS-6709 | Create SailPoint-DSP integrated connection                        | Studio Mini Max  |
| Logs                | POS-1291 | Increase on-device app log lifespan to 30 days                    | Studio WALL-E    |
| Logs                | POS-2489 | Enhance connect logs for administrative actions                   | Studio Tadashi   |
| Alerting            | POS-2014 | Alerting of non-quarantine orders not sent to CAP                 | Studio Hiro      |
| Alerting            | POS-1957 | Automated alerts for stuck orders                                 | Studio Tadashi   |
| OP / Migration      | POS-7748 | OP continuity of service account migration                        | Studio Tadashi   |
| Cash Drawer         | POS-1387 | Persistent cash drawer assignments                                | Studio Galactus  |
| Cached Account      | POS-949  | Cached account — folio/dining plan visual indicator               | Studio Mini Max  |
| Search              | POS-1961 | Back office — search by RRN on all split payments                 | Studio WALL-E    |
| Bugs                | POS-11121| Bugs from M1 epics                                                | Studio Baymax    |

### Key 2.1.1 code areas (unguarded — no FF off-switch)

These code areas run unconditionally. Any change from a 2.0.X merge here is **immediately live**:

- `checks/` — split, combine, transfer, menu, submit (Studio Galactus)
- `payment/` — gratuities, tips, tenders, bar tabs (Studio Galactus/Mini Max)
- `receipts/` — receipt data, TSR receipts, printing
- `retail/` — discounts (auto-apply logic), item restrictions
- `cart/` — modifiers, item countdown, hold and fire
- `login/` — auth, signoff, application lock, proxy server
- `kds/` — order types, QSRA
- `reports/` — flash reports, electronic journal
- `cashdrawer/` — persistent assignments

---

## Feature flag registry

### Epic 2.1.3 — Feature-flagged enhancements (guarded by FF)

| Flag class                                       | Remote config key                              | Jira      | Summary                                                  | Team            |
|--------------------------------------------------|------------------------------------------------|-----------|----------------------------------------------------------|-----------------|
| IsDiscountTypeEnabled                            | isDiscountTypeEnabled                          | POS-1086  | Discount type logic with item discount flags             | Studio Loki     |
| IsPrintUpdatedOfflineReceiptsFeatureFlag         | isPrintUpdatedOfflineReceiptsFeatureFlag       | POS-6290  | DDP offline — update DDP offline receipts                | Studio Loki     |
| ConsolidateToggleFeatureFlag                     | ConsolidateToggleFeatureFlag                   | POS-2472  | Consolidate toggle — icon to consolidate items           | Studio Loki     |
| IsCartItemLimitEnabledFeatureFlag                | isCartItemLimitEnabledFeatureFlag              | POS-1426  | Cart limit — max items/modifiers per transaction         | Studio Loki     |
| IsDiscountScreenRedesignEnabled                  | isDiscountScreenRedesignEnabled                | POS-2642  | Discount list redesign — update flow                     | Studio Loki     |
| IsGroupDiscountsEnabled                          | isGroupDiscountsEnabled                        | POS-14751 | Group discounts — linked/group enhance                   | Studio Loki     |
| IsDiscountsTabEnabled                            | isDiscountsTabEnabled                          | POS-2566  | Discounts tab enabled                                    | Studio Loki     |
| IsRemoveDinningPlanGratuityEnabled               | isRemoveDinningPlanGratuityEnabled             | POS-14929 | Remove dining plan gratuity                              | Studio Loki     |
| IsConfigurationExceptionsEnabled                 | isGetConfigurationEnabled                      | POS-9715  | Configuration exceptions — vendor config                 | Studio Tadashi  |
| IsReOrderFeatureFlagEnabled                      | isReOrderFeatureFlagEnabled                    | POS-15444 | Reorder — item sends in same course                      | Studio Galactus |
| ShouldNotPrintLinesOnRefundReceiptsEnabled       | shouldNotPrintLinesOnRefundReceipts            | POS-16794 | No tip lines on check refunds                            | Studio Loki     |
| IsGiftCardReloadOrActivateEnabled                | isGiftCardReloadOrActivateEnabled              | POS-17309 | Gift card reload/activate logic update                   | Studio Hiro     |
| IsBarTabsOfflineEnabled                          | isBarTabsOfflineEnabled                        | POS-17096 | Tabs — offline mode                                      | Studio Mini Max |
| IsInclusiveGratuitiesEnabled                     | isInclusiveGratuitiesEnabled                   | POS-1429  | Inclusive gratuities — items inclusive of gratuities      | Studio Tadashi  |
| IsProductivityReportsReviewEnable                | IsProductivityReportsReviewEnable              | POS-18279 | Productivity reports review                              | N/A             |
| IsReceiptDecisionsEnabled                        | isReceiptDecisionsEnabled                      | N/A       | Receipt decisions refactoring                            | N/A             |
| IsChangeStockApiEnabled                          | IsChangeStockApiEnabled                        | POS-19347 | Change stock API enabled                                 | N/A             |
| IsPrintOnReceiptEnabled                          | IsPrintOnReceiptEnabled                        | POS-19389 | Print on receipt enabled                                 | N/A             |
| ShowQuickCheckout                                | showQuickCheckout                              | POS-12652 | Quick checkout (2.1.1 but FF-guarded)                    | N/A             |

### Additional 2.1.3 epics without explicit FF (may be partially guarded)

| Jira      | Summary                                                       | Team            |
|-----------|---------------------------------------------------------------|-----------------|
| POS-6725  | Cast API delete integration placement and naming              | Studio Hiro     |
| POS-2569  | Enhance linked/group discounts and fees                       | Studio Loki     |
| POS-3473  | Configuration hierarchy — vendor configuration exception      | Studio Tadashi  |
| POS-2435  | CoreAPI sync to deactivate items on full sync                 | Studio Baymax   |
| POS-6003  | EJ — taxable catchall should not trigger marked out of stock  | Studio Hiro     |
| POS-2270  | Entitlement (DDP/digital coupon) receipted refunds            | Studio Hiro     |
| POS-1936  | Gift card — update reload/activate logic for CAP              | Studio Hiro     |
| POS-1693  | Post sale shipping — charge not calculating on overridden     | Studio Hiro     |
| POS-1478  | Promotions — bundling by item sets template                   | Studio Hiro     |
| POS-1305  | Items & modifiers with CoreAPI POS categories                 | Studio Baymax   |
| POS-1272  | No tip lines on check refunds                                 | Studio Loki     |
| POS-1271  | Reorder — item sends in same course                           | Studio Galactus |
| POS-1253  | Back office data — item sales with venue details              | Studio Hiro     |
| POS-1154  | Item sets — sort order logic for CoreAPI                      | Studio Baymax   |
| POS-1111  | CoreAPI — modifier print mode options                         | Studio Mini Max |
| POS-1083  | DDP receipt — fix amounts on refund template                  | Studio Hiro     |
| POS-1057  | Core API — item age import restrictions                       | Studio Galactus |
| POS-2067  | Operating participants data sovereignty                       | Studio Tadashi  |

---

## Owned code paths

Files within these paths are directly owned or guarded by our feature flags. Any MR touching them is a direct hit.

### Discounts

- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/retail/ui/fragments/DiscountsFragment.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/modswizard/main/discounts/DiscountsDetailsFragment.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/retail/ui/customdialogs/UserSelectionDiscountDialogFragment.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/discountFeeGroups/GetReductionFeeGroupsInteractor.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/checks/discounts/` (entire package)

### Receipts

- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/receipts/builders/` (entire package)
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/receipts/decisions/` (entire package)
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/receipts/extractors/` (entire package)
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/receipts/factory/` (entire package)
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/receipts/interactor/ReceiptConfigGenerator.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/retail/ui/mvp/presenter/ReceiptPresenter.kt`

### Cart

- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/components/cart/CartPresenter.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/components/cart/CartComponent.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/components/cart/CartController.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/cart/item/CartItemPresenter.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/cart/item/GetCartItemPagerDataInteractor.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/cartItemLimit/` (entire package)

### Checkout and gratuities

- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/checkout/interactor/CheckoutGratuityInteractor.kt`

### Refund

- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/refund_order/UniversalRefundOrderPresenter.kt`

### Checks and printing

- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/checks/delegates/print/PrintChecksDelegateImpl.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/checks/ChecksPresenter.kt`

### Login and background refresh

- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/login/backgroundrefresher/BackgroundRefreshersProviderImpl.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/login/main/LoginItemsDownloadInteractor.kt`

### Search

- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/search/SearchPresenter.kt`

### Retail reduction

- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/retail/reduction/CheckReductionCanChancePriceImpl.kt`

### CFD

- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/cfd/controller/FiPayCfdController.kt`

### Feature flags infrastructure (always critical)

- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/featureflags/Features.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/featureflags/FeatureFlagRepositoryImpl.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/featureflags/FeatureFlagRepository.kt`
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/featureflags/di/FeatureFlagModule.kt`

---

## Shared dependencies to watch

These are not directly FF-guarded but are imported by our code. Changes here have transitive risk.

### Data models

- `gc/dataModel/` — entity classes used across the app
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/retail/datamodel/` — retail data models

### Base classes and interfaces

- Any `Base*Presenter`, `Base*Fragment`, `Base*Interactor` that our classes extend
- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/main/UniversalMainPresenter.kt`

### DI

- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/di/` — Dagger modules/components
- Any `@Module` or `@Component` file that provides dependencies our code injects

### Utilities

- `gc/AppetizeActivate/src/main/java/com/appetizeactivate/android/util/` — shared utility classes

---

## Historical breakage patterns

Track MRs that previously caused issues to detect recurring patterns:

| MR     | Source branch | What broke                           | Root cause                                          |
|--------|---------------|--------------------------------------|-----------------------------------------------------|
| (add)  | (add)         | (add)                                | (add)                                               |

Update this table each time a Disney MR causes a break to build pattern recognition.
