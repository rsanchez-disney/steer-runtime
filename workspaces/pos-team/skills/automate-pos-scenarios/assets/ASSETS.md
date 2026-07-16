---
title: POS framework assets
type: diagrams-and-quick-references
updated: 2026-07-08
---

# POS framework assets

---

## Architecture overview

### Technology stack

```text
┌────────────────────────────────────────────────────────────────┐
│                        Test Runner                              │
│   WebDriverIO v9  +  Cucumber BDD  +  Allure Reporting         │
├────────────────────┬───────────────────────────────────────────┤
│   Mobile (Appium)  │          Web (Chrome)                      │
│   UiAutomator2     │          CSS / XPath                       │
│   Android API 30   │          Headless or headed                │
├────────────────────┴───────────────────────────────────────────┤
│                     Multi-Remote Mode                           │
│        Simultaneous mobile + web via automationSource           │
├────────────────────────────────────────────────────────────────┤
│                     Page Object Layer                           │
│   Composition pattern (NO inheritance)                          │
│   base.page.js = utility module, not base class                 │
├────────────────────────────────────────────────────────────────┤
│                     Selector Layer                              │
│   Decoupled getSelector(locator) dictionaries                  │
│   Runtime resolution via findSelector() in helpers.js           │
├────────────────────────────────────────────────────────────────┤
│                     Support Layer                               │
│   helpers.js | printerHelper.js | parameterType.js             │
│   dataHelperDictionary (global state sharing)                   │
├────────────────────────────────────────────────────────────────┤
│                     Data Layer                                  │
│   menu_profile_latest.json | payments.json | regex.js          │
│   .env.latest / .env.stage (credentials)                        │
└────────────────────────────────────────────────────────────────┘
```

### Request flow

```text
Feature File (.feature)
    ↓ Cucumber
Step Definition (DSP.js / when.js / then.js)
    ↓ calls
Page Object (mobile.dashboard.page.js / web.items.page.js)
    ↓ uses
Selector Dictionary (getSelector → locator string)
    ↓ resolved by
helpers.js (findSelector / findPage)
    ↓ executes
WebDriverIO command (via common-actions)
    ↓ sends to
Appium Server → Android Emulator / Chrome Browser
```

### Multi-remote architecture

```text
┌─────────────────────────────────────────┐
│           wdio.conf.mjs                  │
│  capabilities: { mobile: {...}, web: {...} }  │
└───────────────┬─────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───▼───┐             ┌────▼────┐
│Mobile │             │  Web    │
│Appium │             │ Chrome  │
│:4723  │             │ :9515   │
└───────┘             └─────────┘
    │                       │
    │  automationSource     │  automationSource
    │  = 'mobile'           │  = 'web'
    ▼                       ▼
DSP GO App            Connect Portal
```

---

## Step definition catalog

### Generic steps — when.js (used in 327+ features)

```gherkin
When I click on the button "{selectorId}" in {pages} page
When I click on the option "{selectorId}" named "{text}" in {pages} page
When I set "{text}" to the inputfield "{selectorId}" in {pages} page
When I pause in {web|mobile} for {int}ms
When I scroll down in {web|mobile}
```

### Generic steps — then.js

```gherkin
Then I expect that element "{selectorId}" in {pages} page becomes {displayStatus}
Then I expect that element "{selectorId}" in {pages} page {containsStatus} "{text}" text
```

### DSP mobile — DSP.js

#### Setup and login

```gherkin
Given I launch DSP GO app and accept permissions
When I login into a first WDW {venueType} Venue
And I log in to the page with {userType} user
```

#### Order flow

```gherkin
And I start a Check
And I fill out receipt fields
And I select items for the order
And I choose first item "{count}" times for the order
And I proceed to checkout
```

#### Payments

```gherkin
And I pay with Cash and exit the order
And I pay with Visual Id {visualIdType}
And I apply coupons for all items in Emma
And I apply coupons for one item in Emma
And I click the {paymentType} option
And I select the {paymentType} option
And I provide a ${amount} payment in tenders page
```

#### Receipts

```gherkin
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

### Connect web — connect.js

```gherkin
Given I launch and login to connect webpage
And I click on the "{venue}" venue role in the web terminal roles page
And I validate the receipt settings for "{preset}"
And I (enable|disable) {toggleName} toggle for receipt
```

### Key parameter types (parameterType.js)

| Parameter          | Values                                                     |
|--------------------|------------------------------------------------------------|
| `{venueType}`      | TSR, QSR, MERCH                                            |
| `{userType}`       | Manager, Server, Cashier                                   |
| `{pages}`          | mobile dashboard, cart, tenders, web items, web dashboard.. |
| `{displayStatus}`  | displayed, not displayed                                   |
| `{containsStatus}` | contains, does not contain                                |
| `{receiptField}`   | total, subtotal, tax, items, DDP, credit card payment...   |
| `{visualIdType}`   | RCCPS, KTTW                                                |
| `{paymentType}`    | Credit, Cash, Room Charge, Gift Card                       |

### Step distinction: click vs select (payments)

| Step                                         | Behavior                                     |
|----------------------------------------------|----------------------------------------------|
| `I click the {type} option`                  | Clicks payment button only (partial payment) |
| `I select the {type} option`                 | Clicks AND enters full remaining amount      |
| `I provide a $X payment in tenders page`     | Types specific dollar amount via keypad      |

---

## Payment flows

### Cash (full payment)

```gherkin
And I pay with Cash and exit the order
```

Or manually:

```gherkin
And I click on the button "cashBtn" in tenders page
And I click on the button "totalKeypadBtn" in tenders page
```

### Credit card (full payment)

```gherkin
And I select the Credit option
# → FiPay processes the card
```

### DDP full payment

```gherkin
And I pay with Visual Id RCCPS
And I apply coupons for all items in Emma
```

### DDP partial + cash

```gherkin
And I pay with Visual Id RCCPS
And I apply coupons for one item in Emma
And I click on the button "cashBtn" in tenders page
And I click on the button "totalKeypadBtn" in tenders page
```

### DDP partial + credit

```gherkin
And I pay with Visual Id RCCPS
And I apply coupons for one item in Emma
And I select the Credit option
```

### Split tender (multiple credit cards)

```gherkin
And I click the Credit option
And I provide a $25 payment in tenders page
# → First card processed
And I select the Credit option
# → Second card processes remaining balance
```

### Room charge

```gherkin
And I pay with Visual Id KTTW
# Similar to DDP but uses KTTW card
```

### Gift card

```gherkin
# Uses SVC number from payments.json
And I pay with Gift Card
```

### Card type acronyms

| Card       | Acronym | Receipt label |
|------------|:-------:|:-------------:|
| Visa       |   VIS   |      VIS      |
| MasterCard |   MAS   |      MAS      |
| Amex       |   AMX   |      AMX      |
| Discover   |   DIS   |      DIS      |
| Diners     |   DIN   |      DIN      |
| CUP        |   CUP   |      CUP      |

---

## DDP (Disney Dining Plan) flow

### Full DDP payment

```text
Start Check
    ↓
Fill Receipt Fields
    ↓
Select Items
    ↓
Proceed to Checkout
    ↓
Pay with Visual Id RCCPS ──→ Emma App opens
    ↓                              ↓
    │                        Apply Coupons (all items)
    │                              ↓
    │                        Confirm in Emma
    ↓                              ↓
Order Complete ←───────────────────┘
    ↓
Print Receipt
    ↓
Validate DDP values (both copies)
```

### Partial DDP + cash

```text
Pay with Visual Id RCCPS ──→ Emma App
    ↓                              ↓
    │                        Apply Coupons (one item only)
    │                              ↓
    │                        Confirm partial
    ↓                              ↓
Tenders Page ←─────────────────────┘
    ↓
Click cashBtn + totalKeypadBtn
    ↓
Order Complete
```

### Receipt validation fields

```text
Store Copy:
  - DDP items (covered items list)
  - DDP coupons applied
  - DDP title/nomenclature
  - DDP balance (masked)
  - Subtotal, Tax, Total

Guest Copy:
  - DDP items
  - DDP coupons applied
  - DDP title/nomenclature
  - DDP balance (masked)
  - NO gratuity line (must validate absence)
```

### DDP balance validation

```gherkin
# Save balance before payment
And I save the DDP balance

# After payment, validate balance decreased
Then I validate the DDP balance {field} value(s) of the receipt
# field = "remaining" | "used" | "total"

# Ensure balance is printed (not empty)
Then I validate the DDP receipt balance is not empty

# Ensure gratuity is NOT on guest copy
Then I validate the DDP gratuity is not on guest copy

# Validate plan name label
Then I validate the DDP receipt nomenclature label
```

### Visual ID types

| Type  | Use case            | App triggered |
|-------|:--------------------|:-------------:|
| RCCPS | Disney Dining Plan  |     Emma      |
| KTTW  | Room Charge (hotel) |     FiPay     |

---

## Coverage gaps and optimization strategy

### Current state

| Metric             | Count |
|--------------------|:-----:|
| Feature files      |  435  |
| Scenarios          |  462  |
| Smoke tagged       |  190  |
| Regression tagged  |  454  |
| Connect regression |  178  |
| Step def files     |   12  |
| Page objects       |   55  |
| Selector files     |   46  |

### Risk-based component coverage

| Component       | Scenarios | Risk level | Notes                               |
|-----------------|:---------:|:----------:|-------------------------------------|
| reporting       |    89     |     🟡     | Low defect rate, web-only, stable   |
| receipts        |    74     |     🔴     | High complexity, fragile            |
| checks          |    45     |     🔴     | Core flow, high defect exposure     |
| items           |    35     |     🟡     | Moderate                            |
| refunds         |    24     |     🟡     | Moderate                            |
| discounts       |    19     |     🟡     | Complex rules, moderate breakage    |
| cart            |    19     |     🟡     | Moderate                            |
| bar.tabs        |    17     |     🟡     | Moderate                            |
| menu            |    15     |     🟢     | Stable                              |
| **payments**    |  **14**   |   **🔴**   | **Revenue-critical, UNDER-COVERED** |
| tips.gratuities |    12     |     🟡     | Moderate                            |
| gift.card       |     9     |     🟡     | Moderate                            |
| offline         |     8     |     🟡     | Moderate                            |
| dining.plan     |     7     |     🟡     | Moderate                            |
| modifiers       |     6     |     🟢     | Stable                              |

### Tiered execution strategy

| Suite                 | Scenarios | Purpose              | When to run            | Est. time |
|-----------------------|:---------:|----------------------|------------------------|:---------:|
| `@critical_path`     |    ~50    | Catches showstoppers | Every PR, every build  |  ~15 min  |
| `@DSP_GO_smoke`      |    190    | Core flows           | Nightly                |  ~1.5 hrs |
| `@DSP_GO_regression` |    454    | Full coverage        | Weekly / release       |  ~4+ hrs  |

### Quick win actions

| #  | Action                                 | Effort  | Impact                         |
|:--:|:---------------------------------------|:-------:|:-------------------------------|
| 1  | Create `@critical_path` tag (50 tests) | 2 hours | Daily confidence, fast PR gate |
| 2  | Fix top 5 flaky tests                  | 1 day   | Removes noise, builds trust    |
| 3  | Add 5 payment scenarios                | 1 day   | Covers biggest coverage gap    |
