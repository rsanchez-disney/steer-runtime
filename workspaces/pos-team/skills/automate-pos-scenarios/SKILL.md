---
name: automate-pos-scenarios
description: Comprehensive knowledge base about the POS test automation framework architecture, conventions, patterns, step definitions, and workflows. Use when working on any automation task — writing features, step definitions, selectors, page objects, or debugging test failures.
---

# POS Test Automation Framework — SDET Knowledge Base

## Architecture

- **Stack**: WebDriverIO v9 + Cucumber + Appium (UiAutomator2) + JavaScript ES Modules
- **Pattern**: Page Object Model (composition, NOT inheritance). Pages are plain ES6 classes. `base.page.js` is a utility module, not a base class.
- **Selector separation**: Selectors fully decoupled in `src/selectors/` with `getSelector(locator)` dictionary lookup pattern.
- **Dynamic resolution**: `helpers.js` resolves selectors and page objects by name at runtime via `findSelector(selectorId, specificPage)` and `findPage()`.
- **Multi-remote**: Supports simultaneous mobile + web via `automationSource` parameter ('mobile' or 'web').
- **Shared package**: `common-actions` npm package provides low-level WebDriverIO wrappers (clickElement, waitForDisplayed, getSelectorText, etc.).
- **Data sharing**: Global mutable `dataHelperDictionary` object shares state between steps.

## Project structure

```text
src/features/          → Gherkin .feature files by domain
src/pageobjects/       → Page Object classes (commons/, dsp/, connect/, services/, tools/)
src/selectors/         → Selector dictionaries (commons/, dsp/, connect/, tools/)
src/step-definitions/  → Cucumber steps (DSP.js, connect.js, when.js, then.js, given.js, services.js, tools.js)
src/support/           → Helpers (helpers.js, printerHelper.js, parameterType.js, popUpObserver.js, etc.)
data/config/           → Menu profiles, payment configs
data/regex/regex.js    → All regex patterns for receipt validation
environments/          → Appium/browser capabilities (Android/, web/, multiremote/)
```

## Feature file conventions

- Always start with `Feature: DSP_GO`
- Tags: `@US:POS-XXXX` (user story), `@TC:POS-XXXX` (test case), `@TASK:POS-XXXX` (task)
- Suite tags: `@DSP_GO_regression`, `@DSP_GO_smoke`, `@QA_regression`, `@multiremote`, `@connect_regression`
- Indentation: Feature:0, Scenario:2, Steps:4
- Scenario name max: 150 chars, Step max: 160 chars, Max steps per scenario: 74
- Feature files go in `src/features/components/{component}/` or `src/features/components/{component}/regression/`

## Step definition patterns

### Generic steps (when.js, then.js) — used across 327+ feature files

```gherkin
When I click on the button "{selectorId}" in {pages} page
When I click on the option "{selectorId}" named "{text}" in {pages} page
Then I expect that element "{selectorId}" in {pages} page becomes {displayStatus}
When I pause in mobile for {number}ms
```

### DSP-specific steps (DSP.js)

```gherkin
Given I launch DSP GO app and accept permissions
When I login into a first WDW {venueType} Venue
And I log in to the page with {userType} user
And I start a Check
And I fill out receipt fields
And I select items for the order
And I choose first item "{count}" times for the order
And I proceed to checkout
And I pay with Visual Id {visualIdType}
And I apply coupons for all items in Emma
And I apply coupons for one item in Emma
And I pay with Cash and exit the order
And I configure virtual printer
And I navigate to printers option in drawer
And I start listening for virtual printer
And I save the DDP balance
Then I validate the {receiptField} values of the receipts
Then I validate the DDP balance {field} value(s) of the receipt
Then I validate the DDP receipt balance is not empty
Then I validate the DDP gratuity is not on guest copy
Then I validate the DDP receipt nomenclature label
```

### Connect steps (connect.js)

```gherkin
Given I launch and login to connect webpage
And I click on the "{venue}" venue role in the web terminal roles page
And I validate the receipt settings for "{preset}"
And I (enable|disable) {toggleName} toggle for receipt
```

## Receipt validation system

- **Virtual printer**: Uses `adb logcat` to capture printer output → parsed via regex in `printerHelper.js`
- **Flow**: configure virtual printer → connect printer → do transaction → click print → `start listening for virtual printer` → validate fields
- **Regex patterns**: All in `data/regex/regex.js` (getDDPBalanceMasking, getAllDDPTitle, getStoreCopyDDPBalance, getGuestCopyDDPBalance, etc.)
- **receiptField parameter type** supports: total, subtotal, tax, venue, order, items, cash payment, credit card payment, DDP, DDP with gratuities, DDP tips, DDP signature receipt, room charge payment, gratuities, GC, DRC, modifiers, order discounts, item discounts, tips, balance payment, credit card balance, original cash payment, cash change
- **Two listens needed** for store + guest copy: call `And I start listening for virtual printer` twice

## DDP (Disney Dining Plan) flow

1. Start check → fill receipt fields → select items → proceed to checkout
2. Pay with Visual Id RCCPS (triggers DDP payment via Emma app)
3. Apply coupons (all items or partial) in Emma
4. For split payment: after partial DDP, use cashBtn + totalKeypadBtn for remaining
5. Print receipt → validate DDP values (items, coupons, title, balance on both copies)

## Payment flows

- **Cash**: `I pay with Cash and exit the order` OR click cashBtn + totalKeypadBtn
- **DDP Full**: `I pay with Visual Id RCCPS` + `I apply coupons for all items in Emma`
- **DDP Partial + Cash**: pay Visual Id → apply coupons for one item → cashBtn + totalKeypadBtn
- **DDP Partial + Credit**: pay Visual Id → apply coupons for one item → credit card flow
- **Room charge**: Similar to DDP but uses KTTW card
- **Gift card**: Uses SVC number

## Selector strategies

- **Mobile (dsp/)**: `'android=new UiSelector().resourceIdMatches(".*pattern.*")'`
- **Web (connect/)**: XPath (`'//element[@attr="value"]'`) or CSS (`'#id'`, `'.class'`)
- **Pattern**: Each selector file exports `getSelector(locator)` function returning dictionary lookup
- **Fixed bug**: `cart.page.selectors.js` line 16 had `android=new new UiSelector()` (double new) — corrected to single `new`
- **Naming convention**: Files use `{context}.page.selectors.js` format
- **Naming suffixes**: Btn, Txt, Lbl, Icn (preferred over full words)

## Configuration

- **Environment selection**: test-runner.sh sets `APPIUM_ENV` (format: `environment:platform`)
- **wdio.conf.mjs**: Uses `configMap` to select environment config, deep-merges with lodash
- **Env files**: `.env.latest`, `.env.stage` contain venue codes, credentials, URLs, API keys
- **Venue types**: WDW TSR, WDW QSR, WDW MERCH, DLR
- **User types**: Manager, Server, Cashier
- **Receipt presets**: "TSR DDP", "TSR Cash", etc. (validated via Connect web portal)

## Key files to read first

- `src/step-definitions/DSP.js` — All DSP mobile steps (largest file, 714+ lines)
- `src/support/helpers.js` — Core helper (findSelector, dataHelperDictionary, findPage)
- `src/support/printerHelper.js` — Receipt validation engine
- `src/support/parameterType.js` — All Cucumber parameter types
- `data/regex/regex.js` — All regex patterns for receipt parsing
- `src/pageobjects/commons/base.page.js` — Shared utility functions
- `.gherkin-lintrc` — Gherkin lint rules
- `eslint.config.js` — ESLint flat config

## Code quality rules

- Functions max 30 lines (skip blanks/comments)
- Cyclomatic complexity max 10
- All WebDriverIO wrapper commands must use async/await (enforced by custom eslint rule `local/require-await-wdio`)
- Monitored commands: clickElement, waitForDisplayed, pause, waitForClickable, scrollIntoView, checkContainsText, setInputField, hideKeyboard, browser, multipleClicks, getSelectorText, getSelectorAttribute, scrollWithCoordinates, waitForDisplayedAndClick
- ESLint: `eslint.config.js` (flat config, ESLint 9)
- Gherkin lint: `.gherkin-lintrc` (gherkin-lint 4.2.4)
- Allowed tags: @DSP_GO_regression, @DSP_GO_smoke, @multiremote, @connect_regression, @services, @QA_regression + patterns @US:*, @TC:*, @BUG*, @TASK*

## Known technical debt

- `DSP.js` is monolithic (714+ lines) — should be split by domain
- `mobile.dashboard.page.js` is 802 lines — should be split by feature area
- Jenkins configs are stale (old appium version 2.0.0-beta.44, hardcoded paths)
- `baseUrl` and `API_ENV` hardcoded in wdio.conf.mjs
- Hardcoded scroll coordinates in when.js (device-specific)
- Only 9 accessibility ID selectors — heavy reliance on resource-id regex
- `components.to.organize/` has 13 legacy files needing migration
- `kitchen` component has only 1 test scenario
- `returns_exchanges` has only 2 scenarios
- Duplicate selectors across files (enterpriseLink, searchBtn, login fields)
- Step timeout 600s (10 min) — too high, masks hanging tests

## Automation workflow (Jira → code)

1. Fetch Jira ticket (get summary, description, acceptance criteria)
2. If XRay test case → get test steps; otherwise parse AC for scenarios
3. Map to Gherkin following project conventions (tags, indentation, naming)
4. Search existing step-definitions for reusable steps (check DSP.js, when.js, then.js first)
5. Search existing page objects and selectors for matching elements
6. Create .feature file in appropriate `src/features/components/{component}/` directory
7. Add new step definitions only if no existing step covers the action
8. Add new validation functions to printerHelper.js for receipt checks
9. Add selectors only if new screens/elements are involved
10. Validate: run gherkin-lint on feature files, eslint on JS files

## Glossary

| Term  | Meaning                                                |
|-------|--------------------------------------------------------|
| DSP   | Dining and Shopping Point-of-Sale                      |
| TSR   | Table Service Restaurant                               |
| QSR   | Quick Service Restaurant                               |
| MERCH | Merchandise Venues                                     |
| DDP   | Disney Dining Plan                                     |
| TDOD  | Test Data on Demand                                    |
| HE    | Hotel Experience                                       |
| RCCPS | Room Charge Card Payment System (Visual ID type)       |
| Emma  | External app for coupon/DDP management                 |
| FiPay | Payment processing app                                 |
| Connect | Web admin portal for venue configuration             |
| KTTW  | Key To The World (Disney hotel room key card)          |
| SVC   | Stored Value Card (Gift Card)                          |
| DRC   | Disney Rewards Card                                    |
| GC    | Gift Card                                              |
| SNS   | Alternative nomenclature for dining plan               |
| WDW   | Walt Disney World                                      |
| DLR   | Disneyland Resort                                      |

## Lessons learned

### Node.js compatibility

- **Required version**: Node.js 20.9.0 (per README), but project can work with v22+ with dependency fixes
- **Node 24 issue**: `brace-expansion@5.x` breaks `minimatch@9.x` in `@wdio/config` because v5 uses named exports while minimatch expects a default export
- **Fix**: Override `brace-expansion` to `^2.0.2` in `package.json` overrides section
- **Root cause**: The `overrides` field had `"brace-expansion": "^5.0.6"` which forced an incompatible major version

### Import errors pattern

- `printerHelper.js` exports are defined at the bottom of the file in a single `export {}` block
- If a step definition imports a function that doesn't exist in the export block, Node ESM will throw `SyntaxError: does not provide an export named 'X'`
- **Fix**: Remove non-existent imports from the import statement (don't add stubs)
- **Example**: `validateDDPGratuityNotOnGuestCopy`, `validateDDPReceiptBalanceNotEmpty`, `validateDDPReceiptNomenclature` were imported in DSP.js but never defined in printerHelper.js

### Receipt validation limitations

- `validateCreditCard()` in `printerHelper.js` assumes a **single card type** per order
- It uses `allEqualValues(fieldValue)` which asserts ALL credit card lines on the receipt are identical
- **Fails for split tender** (multiple different card types on one order) because VIS, AMX, MAS lines differ
- **Workaround**: Use `I validate the total values of the receipts` instead for multi-card scenarios
- `allEqualValues()` checks `array.every(value => value.includes(array[0]))` — fragile for heterogeneous data

### Split tender vs split check

- **Split check**: Divides one order into multiple checks (each paid separately) — uses `splitBtn`, `cartSplitBtn`, `split check in two checks`
- **Split tender**: Pays a single order with multiple payment methods — uses `I click the Credit option` (partial) + `I provide a $X payment` + `I select the Credit option` (remaining balance)
- Key difference in steps:
  - `I click the {paymentType} option` → clicks payment button only (for entering partial amount)
  - `I select the {paymentType} option` → clicks AND enters full remaining amount
  - `I provide a $X payment in tenders page` → types specific dollar amount via keypad

### Virtual printer timing

- Multi-card receipts (3 CC) generate more print data (6 copies: 3 guest + 3 store)
- `I start listening for virtual printer` may return before all data is captured
- **Fix**: Add `And I pause in mobile for 5000ms` before asserting copy counts
- The `validatePrintAmount()` method splits receipt by "Cut." delimiter and counts "GUEST COPY" / "STORE COPY" occurrences

### Payment method selectors (all orders page)

- `visaPaymentMethodLbl`: textContains("VIS")
- `amexPaymentMethodLbl`: textContains("AMX")
- `mcPaymentMethodLbl`: textContains("MAS") — added in session 2026-05-20
- `gcPaymentMethodLbl`: textContains("GC")
- `cashPaymentMethodLbl`: textContains("Cash")
- Pattern: `android=new UiSelector().resourceIdMatches(".*order_detail_entry_payment_name").textContains("{ACRONYM}")`

### Card type acronyms (from payments.json)

| Card       | Acronym |
|------------|:-------:|
| Visa       |   VIS   |
| MasterCard |   MAS   |
| Amex       |   AMX   |
| Discover   |   DIS   |
| Diners     |   DIN   |
| CUP        |   CUP   |

### DSP.js refactoring opportunities

- **7 step definitions** can be merged without breaking behavior (see DSP-refactor-analysis.md)
- Only 1 merge requires feature file changes: `I select items for the order` → `I choose "2" items for the order`
- GC/RC payment steps (`payWithCards` vs `payWithSVC`) need page object consolidation before step merge
- Refactored copy available at: `src/step-definitions/DSP.refactored.js`

### Vendor roles page (Connect)

- Selectors for `receiptReprintLimitEditBtn`, `enableReceiptReprintLimitBtn`, `disableReceiptReprintLimitBtn` exist but are **unused** in any feature file
- The `toggleSelection()` method in `web.vendor.roles.page.js` maps toggle names to selector triplets [editBtn, enableBtn, disableBtn]
- Toggle pattern: click edit → click Yes/No → wait for success message → dismiss

## Menu profile refactoring

### New nested structure (`data/config/menu_profile_latest.json`)

The flat venue objects were refactored into a nested domain-grouped structure:

```json
{
  "0816T": {
    "id": "0816",
    "dsp_id": "0816T",
    "name": "California Grill TSR",
    "type": "TSR",
    "location": "WDW",
    "address": "...",
    "terminal_role": "...",
    "permission_set": "...",
    "items": {
      "first": { "name": "Tea Genmaicha", "sku": "10057061" },
      "second": { "name": "Sushi Trio", "sku": "10094217" },
      "third": "Cappuccino Decaf",
      "zero_dollars": "KM Infant",
      "with_instruction": "Item 8 Modifier Both",
      "with_open_price": "...",
      "with_priced_modifiers": "...",
      "with_non_priced_modifiers": "...",
      "with_modifiers": "...",
      "sent_to_kitchen": "...",
      "donation": "DONATE",
      "with_promo": { "first": "Darjeeling", "second": "Honey Citrus" }
    },
    "modifiers": {
      "instruction": "ADD",
      "open_priced": ["***DECLINE CONSULT***", "**NO EGGS**"],
      "priced": ["***DECLINE CONSULT***", "**NO EGGS**"],
      "non_priced": ["Modifier 1", "Modifier 5 Open Price"]
    },
    "fees": {
      "customFeeName": "AUT-AV",
      "openGratuity": "AUT-Gratuity",
      "openTip": "Open Tip"
    },
    "discounts": ["10% DVC Food", "20% Golden Oak Food", "10% Golden Oak Food", "100% GLB Food", "10% DVC Food 2"]
  }
}
```

### Resolver pattern (`resolveVenueField` in helpers.js)

- Three functions: `resolveItemField`, `resolveModifierField`, `resolveVenueField`
- `resolveVenueField(venueData, key)` maps legacy flat keys to nested paths
- Resolution order: top-level scalar → fees → discounts (regex `discount\d+`) → items → modifiers
- Items with SKU stored as `{ name, sku }` objects; without SKU as plain strings
- Discounts stored as array, accessed by index (`discount1` → `discounts[0]`)
- Modifiers stored as arrays (`first_priced_modifier` → `modifiers.priced[0]`)
- Exported from `helpers.js` and imported in all files that access venue profile data

### Access pattern (after refactoring)

```javascript
// Dynamic key access (step definitions with regex-captured field names)
const value = resolveVenueField(menuContent[venueId], field);

// Top-level fields still work with direct access (type, location, name, id, address)
menuContent[venueId].type  // still valid — resolveVenueField checks top-level first
```

### Files updated (16 total)

- `data/config/menu_profile_latest.json` — all 16 venues restructured
- `src/support/helpers.js` — resolver functions added, `getAccountValueFromProfile` updated
- `src/support/printerHelper.js` — 14 accesses updated
- `src/step-definitions/DSP.js` — 6 accesses updated
- `src/step-definitions/connect.js` — 1 access updated
- `src/pageobjects/dsp/search.items.page.js` — 3 item maps updated
- `src/pageobjects/dsp/mobile.dashboard.page.js` — 4 accesses updated
- `src/pageobjects/dsp/modifiers.details.page.js` — 4 methods updated
- `src/pageobjects/dsp/menu.page.js` — 1 item map updated
- `src/pageobjects/dsp/tenders.page.js` — 2 accesses updated
- `src/pageobjects/dsp/login.page.js` — 2 accesses + fixed missing `getMenuProfile` import
- `src/pageobjects/connect/web.items.page.js` — 1 item map updated
- `src/pageobjects/connect/web.dashboard.page.js` — 2 accesses updated
- `src/pageobjects/connect/web.order.details.page.js` — 1 access updated
- `src/pageobjects/commons/base.page.js` — 1 access updated
- `src/pageobjects/services/ddp.page.js` — 6 accesses updated

### Adding new venue fields

To add a new field to the profile:

1. Add it to the appropriate nested group in the JSON (`items`, `modifiers`, `fees`, or top-level)
2. Add the legacy key mapping in the corresponding resolver function (`resolveItemField` or `resolveModifierField`)
3. ESLint will show complexity warnings on resolvers — acceptable for mapping functions

## Checks manager refactoring

### Problem

`mobile.checks.page.js` was a 220-line monolithic class handling 4 distinct domains:

- **Split** operations (split check, search split, split display validation)
- **Combine** operations (create orders for combine, combine process, confirm combine)
- **Transfer** operations (transfer order, validate transferred)
- **Check navigation/lookup** (select order, save check number, get check details)

### Solution (same pattern as DDP/folio/item-quantity refactors)

Split into 4 focused domain managers:

| File                       | Responsibility                   | Lines |
|----------------------------|----------------------------------|:-----:|
| `mobile.checks.page.js`   | Navigation + delegation          |  115  |
| `mobile.split.page.js`    | Split check operations           |   44  |
| `mobile.combine.page.js`  | Combine check operations         |  144  |
| `mobile.transfer.page.js` | Transfer check operations        |   36  |

### Delegation pattern

- `mobile.checks.page.js` imports all 3 managers and delegates via spread methods
- Split/combine/transfer managers receive `selectOrderOption` as a callback (bound from checksManager) to avoid circular imports
- `mobile.dashboard.page.js` unchanged — still delegates to `checksManager` which now chains to sub-managers
- Step definitions (`dsp-order.js`) unchanged — API surface preserved via delegation

### Key design decisions

1. **Callback injection for `selectOrderOption`**: Split/combine need to call `selectOrderOption` (which lives in checksManager). Instead of circular imports, we pass it as a bound callback: `this.selectOrderOption.bind(this)`
2. **Unused parameter prefix**: `_selectOrderOption` in `deselectOrder` since the method uses hardcoded selectors internally but receives the callback for interface consistency
3. **No step definition changes needed**: The delegation chain is: `step → dashboardPage → checksManager → {splitManager|combineManager|transferManager}`

### Files created

- `src/pageobjects/dsp/mobile.split.page.js` — splitCheck, searchSplitOrder, splitOrderDisplayed, selectSplitCheck
- `src/pageobjects/dsp/mobile.combine.page.js` — createOrderForCombine, combineChecks, createBaseOrder, applyProcessModifiers, applyDiscount, applyTip, applyGratuity, saveAndSubmitOrder, deselectOrder, initiateCombineProcess, selectChecksForCombine, selectCheckByNumber, confirmCombineOperation, handleBarTabCombine, handleRegularCombine
- `src/pageobjects/dsp/mobile.transfer.page.js` — transferOrder, validateTransferredOrder

### Files modified

- `src/pageobjects/dsp/mobile.checks.page.js` — reduced from 220→115 lines, removed all split/combine/transfer implementations, kept navigation + delegation

### Backward compatibility

Zero breaking changes. All existing feature files, step definitions, and the dashboard facade continue to work identically.

## Checks feature folder refactoring

### Problem

The `src/features/components/checks/` folder had a confusing hybrid structure:

1. **Scattered regression tests** — A top-level `regression/` folder contained sub-domains (split/, combine/, transfer/, check.details/, check.payments/) that duplicated the domain folders already at root level
2. **Misplaced features** — `tsr.combine.check.auto.remove.*` files lived at `regression/` root instead of `regression/combine/`
3. **Orphaned check.payments** — Payment close-transaction tests lived in a `regression/check.payments/` subfolder with no parent domain folder
4. **No lifecycle grouping** — Cancel, recall, payment-close, and gratuity tests were scattered without a cohesive domain
5. **Hard to navigate** — 36 feature files across 8+ directories with inconsistent depth

### Solution: domain-first folder structure

Each check domain owns ALL its scenarios in one top-level folder with an optional `/regression` subfolder:

```text
src/features/components/checks/
├── split/                    ← Smoke/core split scenarios
│   ├── regression/           ← Complex split with Connect config
│   ├── tsr.split.check.feature
│   ├── tsr.split.check.with.gratuities.feature
│   ├── tsr.split.check.with.tip.feature
│   ├── tsr.split.check.with.discounts.feature
│   └── tsr.cancel.a.split.check.feature
├── combine/                  ← Smoke/core combine scenarios
│   ├── regression/           ← Complex combine with Connect config
│   ├── tsr.combine.check.feature
│   ├── tsr.combine.check.with.tip.feature
│   ├── tsr.combine.check.with.open.gratuity.feature
│   └── tsr.cancel.a.combine.check.feature
├── transfer/                 ← Smoke/core transfer scenarios
│   ├── regression/           ← Complex transfer edge cases
│   ├── tsr.transfer.check.with.open.tip.feature
│   ├── tsr.transfer.check.with.discounts.feature
│   ├── tsr.transfer.check.with.open.gratuity.feature
│   ├── tsr.transfer.check.and.add.tip.afterwards.feature
│   └── tsr.cancel.transfer.check.feature
├── check.details/            ← (currently empty at root, all in regression)
│   └── regression/           ← Table number, guest count, submit options, check size
├── check.lifecycle/          ← Cancel, recall, payment close, reprints, gratuity prevention
│   ├── tsr.cancel.order.feature
│   ├── tsr.recall.button.functionality.feature
│   ├── prevent.multiple.gratuities.added.to.a.check.feature
│   ├── tsr.cash.close.transaction.payment.feature
│   ├── tsr.credit.card.close.transaction.payment.feature
│   ├── tsr.ddp.close.transaction.payment.feature
│   ├── tsr.gc.close.transaction.payment.feature
│   ├── tsr.rc.close.transaction.payment.feature
│   ├── tsr.room.charge.close.transaction.payment.feature
│   └── tsr.reprint.full.tender.check.splitter.3cc.feature
```

### Key design decisions

1. **Domain-first, not tier-first** — Instead of `regression/split/`, we use `split/regression/`. When you work on "split check" bugs, everything is in ONE domain folder.
2. **check.lifecycle** — New grouping for tests that verify the check status machine (open → closed, cancel, recall, reprint). Previously scattered.
3. **Glob-safe** — All wdio suite configs use `checks/**/*.feature` pattern so restructure is transparent.
4. **Zero feature file edits** — Only file moves; no content changes needed.

### Impact

- Suite configs (`wdio.test.suite.definitions.js`): **No changes** (uses `**/*.feature` glob)
- Step definitions: **No changes** (features reference steps, not paths)
- Gherkin lint: **All 36 files pass**
- Old `regression/` root directory: **Removed** (was empty after all moves)
