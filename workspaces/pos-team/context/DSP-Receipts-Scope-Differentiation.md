# DSP Receipts — Detailed Scope Differentiation

---

## GLOBANT SCOPE (158 tickets: 10 Epics + 148 Bugs)

Globant owns the **receipt template engine**, including all layout logic, amount calculations, copy routing, print triggers, and offline receipt handling.

---

### 1. Receipt Template Layout & Formatting (25 bugs)

Globant controls how content is arranged on printed and electronic receipts — section ordering, alignment, data positioning, and conditional display rules.

- Terminal/check/table number formatting (POS-16315)
- Subtotal printed twice on store copy (POS-11246)
- Store Copy misplaced print data blurb (POS-14965)
- Items reverse sort order after tender applied (POS-11592)
- All orders printed as order #1 (POS-14278)
- Cardholder message misalignment (POS-17147)
- Open Gratuity value not positioned correctly (POS-16703)
- Tip and total lines misaligned in back office view (POS-11013)
- Double space in venue address (POS-18424)
- Mismatch between guest/store copies with mock-up alignments (POS-14108)
- "Card holder will pay" wording present with Cash payment (POS-13022)
- Different timestamps on Guest vs Store copies (POS-13016, POS-13364)
- Store copy prints in local time, not store time (POS-17884)
- Offline sales not printing with *** indicator (POS-9556)
- Receipt won't print full content with large qty items (POS-1336)
- Scrolling Receipt not shown on Pax device (POS-14246)
- Activate prints wrong Operator on Manager role receipt (POS-1255)
- Revenue Report receipt lists Users as "All" (POS-11061)
- Display name shown instead of actual name (POS-11027)
- Guest Signature Receipt (EDC) missing table number (POS-11540)
- Signature line on final receipt copy (POS-15469)
- Priced modifiers not listed in receipt (POS-16838)
- TSR/QSR modifier not shown in receipt (POS-17026)
- Split check printed without items or not at all (POS-16789)
- Discount shows under each modifier not rolled up (POS-1925)

---

### 2. Tips & Gratuities Receipt Logic (31 bugs)

Full ownership of how tips, gratuities (open/fixed/inclusive), and suggested tip calculations appear on all receipt types.

**Suggested Tip Calculations:**
- Wrong suggested tip calculations on first guest copy (POS-14505)
- Wrong total on suggested tips for partial payment balance (POS-17783)
- Suggested tip amounts not displayed (POS-13217 — re-test POS-1599)
- Suggest Tip printed on receipt with Tip in split scenario (POS-18239)
- Suggested Tips displayed when they shouldn't be (POS-18063 — re-test POS-2098)
- Tip Suggestion section printed when Tip already added (POS-16919)

**Tip Display on Receipts:**
- Balance Print doesn't display tip when open tip added (POS-18401)
- Printed receipt missing Open Tips tendered to Master Acct (POS-14610)
- Tip OR Gratuity not displayed on Balance Print (POS-18070)
- Print balance with open tip doesn't show tip (POS-17386)
- Open tip amount showing under subtotal when fee present (POS-10664)
- DLR Folio Opera not displaying tip in download view (POS-9575)
- Receipted refund tip percentage incorrectly displayed (POS-9540)

**Gratuity Logic:**
- Incorrect total for open gratuity sale from Pending Closed (POS-14936)
- Unexpected gratuity added to receipt (POS-14605)
- Gratuity appearing on receipt when not added (POS-10018)
- Gratuity value displaying as positive on non-receipted refund (POS-16695)
- Inclusive Gratuity config not honoring vendor assignments (POS-17176)
- Guest Copy displays Fee/Gratuity covered by DDP (POS-17474 — re-test POS-7803)
- Printed Receipts not displaying Fee amounts correctly (POS-13151 — POS-7803)
- Gratuity not displayed on receipt for offline orders (POS-18484 — POS-1383)

**Tip Lines Conditional Display:**
- Discount transactions with tip showing tip/total on final copy (POS-13763)
- Tip and Total lines still displayed on receipt (POS-12701 — POS-2098)
- Missing tip while refunding an order (POS-14551)
- Deleting tip generates auth code/RRN on receipt (POS-14609)
- Subtotal lines for Open Tip/Gratuity with no items incorrect (POS-11633)
- Receipts prompt for additional tip with service charge but no tip/grat (POS-15712)
- Subtotal different on electronic vs physical with Open Tip/Grat (POS-14495)
- Adding $0.00 Tip adds new Fipay payment details line (POS-11486)
- Split payment prints store signature receipts after applying tips (POS-11139, POS-16177)

---

### 3. Reprint Logic & Print Count Tracking (10 bugs)

Complete ownership of print count tracking, reprint triggers, and exponential duplication prevention.

- Print count not shown on reprint — Critical (POS-11111)
- Reprint from Thank You screen doesn't show reprint count (POS-9554)
- Reprint count at TSR increasing when it shouldn't (POS-15639)
- Reprint closed check prints exponentially 1→2→4→8… (POS-17436)
- Reprint from Check screen prints extra receipt (POS-17800)
- Reprint from Order Completion intermittently prints wrong amount (POS-17559)
- Reprint from Thank You prints based on number of tenders (POS-11381)
- Reprint count is 3 for offline sale after going back online (POS-10190)
- Offline+Online sale prints first receipt as REPRINTS: 1 (POS-17938)
- Manager override prompts for print when count under config (POS-11109)

---

### 4. Print Triggers & Failures (14 bugs)

Ownership of when receipt print is triggered, error handling around print failures, and offline print queue behavior.

- Receipt not printed with cash payment (POS-16411)
- "Print was unsuccessful" error after cash payment (POS-16412)
- "Print was unsuccessful" on checkout (POS-16561)
- Receipt doesn't print with Gift Card in WDW Merch (POS-14937)
- Receipts don't print for split tender with three CC (POS-9640)
- Confirm and Print button doesn't print combined check (POS-10115)
- Print & Submit button doesn't print items (POS-10196)
- Offline balance print fails intermittently (POS-14743)
- Checks don't combine on "confirm and print" offline (POS-12333)
- Receipt prints only after going back online with guest ID (POS-11911)
- Close Check prints two store receipt copies (POS-9989)
- Order Receipt not loading for refund in DSP Go (POS-10535)
- Print balance button disabled with partial payment DLR (POS-18413)
- Receipted refund scanning doesn't load refund screen (POS-10693)

---

### 5. Copy Routing (Guest/Store) & Duplicate Prevention (17 bugs)

Determining how many copies print, which type (Guest vs Store), and preventing unwanted duplicates.

- Doubling items on printed receipt (POS-9966)
- Duplicated items on receipt (POS-15983, POS-16489)
- DSP printing two Store Copy receipts (POS-15865)
- Double Guest Receipts on Split Credit/Cash (POS-17553)
- DSP Go incorrect number of Guest/Store prints (POS-13254 — POS-1251)
- Guest copy printed only once with CC (POS-14815)
- DLR TSR prints only Guest Copy with CC (POS-16316)
- Guest and Store copy printing for final copy (POS-15471)
- Pending Close prints Final Copy from All Orders (POS-18345)
- Final receipt printing after auto-close from Pending Close W/Tip (POS-11731)
- Receipts printed continuously from Pax in QSR store (POS-13437)
- Offline tip prints receipt before finalizing + two after (POS-9853)
- Merch receipt not printed correctly with Cash/GC (POS-16734)
- Open tab + reauth shows two payment providers on receipt (POS-10644)
- Tender to open tab keeps showing balance due (POS-12445)
- Receipted refund of just a tip not prompting Manager Override (POS-11009)
- Receipts prompt for print when reprint count under BO config (POS-11109)

---

### 6. Tax Amount Calculations on Receipts (5 bugs)

Tax calculation and display logic across refund copies, original receipts, and guest vs store copies.

- Tax incorrect on refund copy and guest copy (POS-14869, POS-16376)
- Tax incorrect and doesn't match between refund copy and original (POS-14103)
- Receipt shows tax $0.00 for TSR & QSR (POS-15081)
- Disney Rewards Card guest copy shows tax $0.00 (POS-15015)

---

### 7. Balance & DDP Receipt Logic (16 bugs)

Ownership of DDP (Disney Dining Plan) balance display, remaining balance receipts, gift card/rewards balance, and offline DDP templates.

- DDP Balance printed as empty in transaction records (POS-17077)
- Remaining balance receipt missing total/subtotal (POS-15451)
- Balance receipt doesn't reflect partial payments in Pending Close (POS-15131)
- Print button prints balance $0.00 for combined check (POS-15835)
- Print balance doesn't work with partial payment (POS-15985)
- Incorrect title for Remaining Balance (POS-17445 — POS-6290)
- Offline DDP receipt: "Remaining Balance" layout issue (POS-17426)
- DDP balance outdated after guest redeemed points (POS-17661)
- Rewards balance shows $0.00 after refund (POS-17763)
- Gift card balance check missing balance amount (POS-13303)
- Disney Rewards card balance check missing balance (POS-12613)
- Multiple Gift Card Activation incorrect balance (POS-10227)
- Finalized receipt after tip doesn't display updated SVC balance (POS-15701)
- "Balance Not Avail" legend printed using diff payments (POS-17073)
- GC receipt shows failed GC number instead of successful after New Scan (POS-18342)

---

### 8. Refund Receipt Content (10 bugs)

What content appears on refund receipts — items, tenders, tax, fees, and tip data.

- Refund store copies include tipping/signature lines (POS-18300 — POS-1272)
- Store receipts from receipted refund missing tip amount (POS-12612)
- TSR Store Copy refund receipts don't display refunded items (POS-9560)
- Multiple receipt refund not displaying all original tenders (POS-14409)
- CC tender printed twice on receipted refund copy (POS-14724)
- Fee type not displayed on refund receipt (POS-12370)
- Non-receipted refunds with discount stuck in offline tab (POS-14404)
- Amount mismatch in receipted refund under saved tender (POS-18481)
- Refund in TSR showing incorrect amount (POS-13822)
- Exchange doesn't show tender on guest receipt (POS-14581)

---

### 9. Connect/Electronic Receipt Rendering (5 bugs)

Electronic receipt rendering in DSP Connect and download receipt functionality.

- Download Receipt doesn't display properly in Connect (POS-16563)
- Receipt downloaded as PDF in Connect (POS-16314)
- Download Receipt for orders not working (POS-16259)
- Discount not shown in Connect/physical while offline (POS-14482)
- Connect receipt doesn't match physical (offline→online) (POS-14481)

---

### 10. Guest vs Store Copy Data Consistency (8 bugs)

Ensuring both receipt copies show matching data.

- Physical differs from Connect on receipted refund with tips/fees (POS-11284)
- Total/subtotal order differs on Store vs Guest copy (POS-14834)
- Reprints don't match when printing from PCWT (POS-15640)
- Reprint receipt doesn't match final receipt DSP Go (POS-17799)
- Subtotal mismatch on Store vs Guest with open tab (POS-9936, POS-10278)
- Guest Copy missing tender info for exchange in TSR (POS-14445)
- Cash entered line not shown on reprints from All Orders (POS-15550)

---

### 11. Fees & Totals Logic (5 bugs)

How fees, custom fees, and totals are calculated and rendered.

- Receipt Totals not matching subtotal, fees, grat, tax (POS-15051)
- Custom Fee added to receipt but not to total (POS-15152)
- Fees not reflected in Total during Open Tab Check (POS-13744)
- Tip taken from GC in receipt but not from actual balance (POS-16473)
- Open Gratuity with fixed amount adds hidden amounts to total with DDP (POS-16198)

---

### 12. Tax Exempt & CAP Export (1 bug)

- Tax Exempt details missing on receipted refund with gratuity + not sending to CAP (POS-1717)

---

## Globant Feature Epics Summary

| # | Ticket | Feature | Status |
|---|--------|---------|--------|
| 1 | POS-1383 | **TSR Receipts Optimization** — More optimized TSR Guest and Store receipts | Done |
| 2 | POS-2274 | **DDP vs SNS Nomenclature Updates** — Update naming conventions on receipts | Ready for Dev |
| 3 | POS-1272 | **No Tip Lines on Check Refunds** — Remove tip/signature lines from refund receipts | In Progress |
| 4 | POS-2098 | **Apply T/G — Tipping Receipt Logic** — Include/exclude additional tip on receipt | In Progress |
| 5 | POS-1083 | **DDP Refund Receipt Fix** — Correct amounts on DDP refund template | In Progress |
| 6 | POS-1782 | **Cash Entered & Change Due** — Show cash entered and change due on receipts | Done |
| 7 | POS-6290 | **DDP Offline Receipts** — Update DDP offline receipt templates | In QA |
| 8 | POS-1599 | **Suggested Tip Calculation Improvements** — Improve tip suggestion logic | Done |
| 9 | POS-7803 | **Package Plan Covered Gratuities** — Handle covered gratuities for sale receipts | In Progress |
| 10 | POS-1251 | **DSP Go Print All Copies** — Print all Guest and Store copies | Technical Analysis |

---

## DISNEY SCOPE (32 tickets: 28 Bugs + 4 Stories)

Disney focuses on **refund flow business logic**, **hardware-specific issues**, **security**, **kitchen printing**, and **architectural refactoring** of the receipt system.

---

### 1. Receipted Refund Flow Logic (9 bugs)

Business logic governing the refund checkout flow — button states, validation, discount handling, and cart behavior.

- **Add to check button enabled in receipted refunds** (POS-19042) — button state should be disabled during refund flow
- **"Unsubmitted modification" popup after payment in receipted refund flow** (POS-16385) — validation incorrectly triggered
- **Discounts cannot be applied during non-receipted refund** (POS-15011) — discount engine not invoked
- **Unable to do receipted refund for MMC sale with shipping fee** (POS-11280) — shipping fee blocks refund
- **Scanning gift card during receipted return creates over-limit error** (POS-9537) — validation math wrong
- **Discount name missing in Receipted refund** (POS-16180) — data not mapped to refund context
- **Discount percentage not displayed per item in cart during refund** (POS-17656) — cart presenter issue
- **Printed check after deleting tip shows balance due** (POS-14613) — tip deletion doesn't recalculate
- **Receipt prints incorrect tender amount when tip is deleted** (POS-18629) — tender recalculation after tip removal

---

### 2. Receipt Print Correctness — Disney-Specific Scenarios (8 bugs)

Scenarios that Disney owns due to business logic ownership (tip flow, tender routing, check lifecycle).

- **Guest receipt missing tip/total lines when gratuity applied (correct on store copy)** (POS-17512) — conditional logic for guest template
- **"Print Receipt" button shows reprint number when no reprint was done** (POS-17092) — reprint counter incremented at wrong lifecycle point
- **"Print was unsuccessful" on cash refund in TSR** (POS-16626) — print trigger timing in refund flow
- **Extra guest copies with different formats on TSR venues** (POS-15133) — venue config dispatching wrong template
- **Tendering to DDP + room charge prints 5 receipts** (POS-14952) — copy count logic for dual-plan tenders
- **Prints two guest copies when check is checked out** (POS-13019) — double-trigger on check finalization
- **No guest receipt when closing from Pending Closed tab** (POS-12447) — lifecycle transition missing print event
- **Store Copy with signature line prints with cash-only tender** (POS-14212) — conditional signature logic

---

### 3. Kitchen Receipt / Order Flow (2 bugs)

Kitchen print routing and re-order logic — distinct from guest/store receipt templates.

- **Reordered items not getting Kitchen Receipt** (POS-16757) — re-order doesn't trigger kitchen chit
- **Guest Receipt shows removed modifiers on Repeat item** (POS-14068) — item clone doesn't clear deleted mods

---

### 4. Hardware-Specific Issues (3 bugs)

Epson USB printer integration and hardware-specific rendering limits.

- **Epson USB printer truncates discount name** (POS-10531) — line width calculation
- **Epson printer truncates last 3 digits of local order ID** (POS-10202) — field width overflow
- **Reprinting after paper runs out doesn't print** (POS-10695) — recovery after hardware error

---

### 5. Security (1 bug)

- **downloadDynamicReceipt URL allows receipt view by Local Order ID** (POS-18547) — unauthenticated access to receipt data via predictable URL

---

### 6. Data Integrity on Receipts (4 bugs)

Correctness of business data shown on receipts — names, seat numbers, employee identity.

- **Receipt retains proxied user as employee on check** (POS-10980) — operator identity not updated after proxy
- **Seat numbers not printing when item has modifier** (POS-9694) — seat data dropped during modifier expansion
- **DDP Receipt uses Display Name instead of Item Name** (POS-11403) — wrong field reference
- **$0.00 targeted modifiers don't display price under Non Plan in DDP** (POS-8539) — price suppression logic too aggressive

---

### 7. Tip Lines Lifecycle (1 bug)

- **Check closed from Pending Closed No Tip prints with Tip Lines** (POS-8794) — check state not propagated to template

---

### 8. Architectural Refactoring & New Features (4 stories)

Structural changes and new capabilities in the receipt system.

- **Receipt print refactor — unify item entity business object** (POS-10086) — consolidate UI presenters to single item BO
- **Remove Package Plan balances on final receipts** (POS-9848) — cleanup of unnecessary data
- **Print Separate Receipt Lines for Each Custom Tender Usage** (POS-1834) — new feature for multi-tender display
- **Exclude Hold items from Itemize Receipts** (POS-13470) — business logic for held items

---

## Key Differentiation Matrix

| Area | Globant Owns | Disney Owns |
|------|-------------|-------------|
| **Receipt template engine** | ✅ All template logic, section ordering, conditional blocks, alignment | ❌ |
| **Tip/gratuity calculation & display** | ✅ Full: suggested tips, open tips, inclusive grat, covered grat, tip % | Only: tip deletion recalculation, guest-copy-specific tip line |
| **Print count/reprint tracking** | ✅ Full: count increment, exponential fix, offline count, Thank You reprint | Only: reprint counter state on button UI |
| **Copy routing (Guest/Store/how many)** | ✅ Full: which copies, how many, conditional signature lines | Only: venue-config-level copy overrides |
| **DDP/Balance receipts** | ✅ Full: balance layout, DDP nomenclature, remaining balance, offline DDP | Only: item name field reference, $0 modifier display |
| **Tax calculations on receipts** | ✅ Full ownership | ❌ |
| **Refund receipt content** | ✅ Template: items, tenders, fees, tax on refund copies | Only: refund flow state (buttons, validation, discount engine) |
| **Connect/electronic receipt** | ✅ Full: rendering, download, PDF vs HTML, offline sync | Only: security (URL access control) |
| **Offline receipt queue** | ✅ Full: offline print, sync, offline DDP, offline balance | ❌ |
| **Print trigger logic** | ✅ When/why print fires (cash, CC, split, combined, close, etc.) | Only: specific trigger timing in refund and Pending Close lifecycle |
| **Kitchen receipts** | ❌ | ✅ Kitchen chit routing, re-order triggers |
| **Hardware integration** | ❌ | ✅ Epson truncation, paper-out recovery |
| **Security** | ❌ | ✅ Receipt URL access control |
| **Architectural refactoring** | ❌ | ✅ Item entity BO unification, presenter refactor |
| **New receipt features** | ✅ Feature epics (DDP nomenclature, tip improvements, no-tip-on-refund, print all copies, covered grat, cash entered/change due) | ✅ Custom tender lines, hold item exclusion, package plan balance removal |

---

## Summary

**Globant** is the primary engineering owner of the **receipt subsystem** — from template rendering through print orchestration. Their scope covers:
- **What** prints (content, calculations, formatting)
- **When** it prints (triggers, conditions, errors)
- **How many** copies print (routing, count tracking)
- **Where** it renders (physical, Connect, DSP Go, offline)

**Disney** handles:
- **Why** it prints (business flow decisions in refund/checkout lifecycle)
- **Who** sees what (security, kitchen vs guest routing)
- **How** it physically outputs (hardware drivers, paper recovery)
- **What's next** (architectural evolution of the receipt codebase)
