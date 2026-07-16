---
title: POS framework references
type: runbooks-and-references
updated: 2026-07-08
---

# POS framework references

---

## Add a new test

### Workflow (Jira → code)

1. **Fetch Jira ticket** — get summary, description, acceptance criteria
2. **Get test steps** — if XRay test case, use `jira_xray_get_test_steps`; otherwise parse AC for scenarios
3. **Map to Gherkin** — follow feature file conventions (tags, indentation, naming)
4. **Search existing steps** — check `DSP.js`, `when.js`, `then.js` first
5. **Search existing page objects and selectors** — check for matching elements
6. **Create .feature file** — in `src/features/components/{component}/` directory
7. **Add new step definitions** — only if no existing step covers the action
8. **Add validation functions** — to `printerHelper.js` for receipt checks
9. **Add selectors** — only if new screens/elements are involved
10. **Validate** — run `gherkin-lint` on feature files, `eslint` on JS files

### Code quality rules

- Functions max 30 lines (skip blanks/comments)
- Cyclomatic complexity max 10
- All WebDriverIO wrapper commands must use `async/await`
- ESLint enforces via custom rule `local/require-await-wdio`

### Checklist

- [ ] Feature file has required tags (@TC, @TASK, suite tag)
- [ ] Scenario name follows `[Park] | [Component] | [Descriptive name]` pattern
- [ ] Steps reuse existing definitions where possible
- [ ] New selectors follow naming convention (camelCase + Btn/Txt/Lbl/Icn suffix)
- [ ] `gherkin-lint` passes
- [ ] `eslint` passes on modified JS files

---

## Add a new selector

### Steps

1. Identify the element (use Appium Inspector or Chrome DevTools)
2. Choose the selector file: `src/selectors/{context}/{page}.page.selectors.js`
3. Add the selector to the dictionary inside `getSelector(locator)`
4. Follow naming convention: `{descriptiveName}{Suffix}` where suffix is `Btn`, `Txt`, `Lbl`, or `Icn`

### Mobile selector format

```javascript
selectorName: 'android=new UiSelector().resourceIdMatches(".*resource_id_pattern")'
```

### Web selector format

```javascript
selectorName: '//xpath[@attr="value"]'
// or
selectorName: '#css-id'
```

### Checklist

- [ ] No duplicate of existing selector (check other selector files)
- [ ] Uses resource-id regex for mobile (preferred over text-based)
- [ ] Follows naming suffix convention (Btn, Txt, Lbl, Icn)
- [ ] Only one `new` keyword (avoid the double-new bug)
- [ ] Selector file name follows `{context}.page.selectors.js` format

---

## Add a new venue field

### Steps

1. Add the field to the appropriate nested group in `data/config/menu_profile_latest.json`:
   - `items` — menu items
   - `modifiers` — item modifiers
   - `fees` — fees and gratuities
   - Top-level — venue metadata (type, location, etc.)

2. Add the legacy key mapping in the corresponding resolver function in `src/support/helpers.js`:
   - `resolveItemField` — for item fields
   - `resolveModifierField` — for modifier fields
   - `resolveVenueField` — for top-level/fee/discount fields

3. ESLint will show complexity warnings on resolvers — acceptable for mapping functions.

### Example

Adding a new item field `with_allergen`:

```json
// In menu_profile_latest.json, under venue.items:
"with_allergen": "Peanut Butter Cookie"
```

```javascript
// In helpers.js resolveItemField:
case 'with_allergen': return venueData.items.with_allergen;
```

### Resolution order

`resolveVenueField(venueData, key)` checks in this order:

1. Top-level scalar (type, location, name, id, address)
2. Fees (`openGratuity`, `customFeeName`, `openTip`)
3. Discounts (regex `discount\d+` → `discounts[index]`)
4. Items (delegates to `resolveItemField`)
5. Modifiers (delegates to `resolveModifierField`)

### Data formats

- Items with SKU: `{ "name": "Tea Genmaicha", "sku": "10057061" }`
- Items without SKU: `"Cappuccino Decaf"` (plain string)
- Discounts: array, accessed by 1-based index (`discount1` → `discounts[0]`)
- Modifiers: arrays (`first_priced_modifier` → `modifiers.priced[0]`)

---

## Debug receipt validation

### Common failures

#### 1. Receipt data incomplete (missing copies)

**Symptom**: `validatePrintAmount()` fails — expected 6 copies, got 4.

**Cause**: Virtual printer listener returned before all data was captured.

**Fix**: Add `And I pause in mobile for 5000ms` before asserting.

#### 2. Credit card validation fails on split tender

**Symptom**: `validateCreditCard()` assertion error — values not equal.

**Cause**: `allEqualValues()` assumes single card type. Fails for multi-card because VIS, AMX, MAS lines differ.

**Workaround**: Use `I validate the total values of the receipts` instead.

#### 3. DDP validation function not found

**Symptom**: `SyntaxError: does not provide an export named 'X'`

**Cause**: Function imported in DSP.js but not defined/exported in printerHelper.js.

**Fix**: Remove the non-existent import. Don't add stubs.

#### 4. Receipt field not matching regex

**Symptom**: Validation returns null/empty for a field.

**Debug steps**:

1. Check `data/regex/regex.js` for the pattern being used
2. Capture raw printer output (check `adb logcat` directly)
3. Test regex against raw output manually
4. Verify the `receiptField` parameter type maps to the correct validation function

### Virtual printer flow

```text
configure virtual printer
  → connect printer
  → do transaction
  → click print
  → "I start listening for virtual printer"
  → validate fields
```

### Key files

- `src/support/printerHelper.js` — receipt validation engine
- `data/regex/regex.js` — all regex patterns
- `src/support/parameterType.js` — receiptField parameter mappings

---

## Parallel execution on multiple emulators

### Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                  parallel-runner.sh                       │
│  Launches N wdio processes, each with WORKER_INDEX=0..N  │
└───────┬──────────────────┬──────────────────┬───────────┘
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │Worker 0 │       │Worker 1 │       │Worker 2 │
   │port 4723│       │port 4725│       │port 4727│
   │emu-5554 │       │emu-5556 │       │emu-5558 │
   └────┬────┘       └────┬────┘       └────┬────┘
        │                  │                  │
   allure-results-    allure-results-    allure-results-
   worker-0/          worker-1/          worker-2/
        └──────────────────┼──────────────────┘
                           │ merge
                    allure-results/ → allure-report/
```

### Usage

```bash
# 2 emulators — checks suite
npm run checks:parallel

# 3 emulators — checks suite
npm run checks:parallel3

# Custom: ./parallel-runner.sh <workers> <suite> <tag> <env>
./parallel-runner.sh 2 payments DSP_GO_regression latest
./parallel-runner.sh 3 components DSP_GO_smoke latest
```

### Prerequisites

```bash
# Start emulators on separate ports
emulator -avd Nexus_10_API_30 -port 5554 &
emulator -avd Nexus_10_API_30_2 -port 5556 &
emulator -avd Nexus_10_API_30_3 -port 5558 &

# Verify all online
adb devices
```

### Key design decisions

1. **Round-robin spec sharding** — `spec[i]` assigned to `worker i % N`
2. **Separate Appium ports** — Worker 0 = 4723, Worker 1 = 4725, Worker 2 = 4727
3. **`appium:systemPort`** — Unique per device (8200 + workerIndex)
4. **Per-worker Allure output** — Merged into single report after all workers finish
5. **`global.udid` compatibility** — ADB commands target correct emulator automatically

### Limitations

- **Venue conflicts**: Two workers using same venue may interfere. Assign different venues per worker for TSR flows.
- **Hardware**: Each emulator needs ~4GB RAM. With 3 emulators + Chrome = ~16GB minimum.
- **initial.config.feature**: Only ONE worker should run config reset. Exclude from parallel batch.

---

## Refactoring progress

### Completed refactors

| Domain                | Before                                | After                                                             | Date       |
|-----------------------|---------------------------------------|-------------------------------------------------------------------|:----------:|
| Menu profile          | Flat venue objects                    | Nested domain-grouped + resolver functions                        | 2026-05-22 |
| Dynamic steps         | Hardcoded item/discount names         | Profile-driven via `resolveVenueField`                            | 2026-05-21 |
| Checks page object    | 220-line monolith                     | 4 focused managers (split, combine, transfer, navigation)         | 2026-06-23 |
| Checks feature folder | Confusing hybrid with scattered dirs  | Domain-first structure (split/, combine/, transfer/, lifecycle/)   | 2026-06-23 |
| Node.js compat        | Broken on Node 24                     | `brace-expansion` override to `^2.0.2`                           | 2026-05-20 |

### In progress / planned

| Domain                | Problem                           | Status  | Priority |
|-----------------------|-----------------------------------|:-------:|:--------:|
| DSP.js split          | 714+ lines, 126 steps (monolith) | Planned |   High   |
| mobile.dashboard.page | 802 lines (monolith)             | Planned |   High   |
| printerHelper.js      | 500+ lines, monolithic validators | Planned |  Medium  |
| cart.page.js          | Mixed cart + discount + fee logic | Partial |  Medium  |
| Jenkins configs       | Stale appium v2.0.0-beta.44      | Open    |   Low    |

### DSP.js proposed split

| File                       | Responsibility                    | Est. steps |
|----------------------------|-----------------------------------|:----------:|
| `dsp.cart.steps.js`        | Cart actions, fees, discounts     |    ~50     |
| `dsp.navigation.steps.js`  | Login, dashboard, menu navigation |    ~40     |
| `dsp.checkout.steps.js`    | Tenders, payments, refunds        |    ~30     |

### Step definitions merge candidates (7 total)

- Only 1 requires feature file changes: `I select items for the order` → `I choose "2" items for the order`
- GC/RC payment steps (`payWithCards` vs `payWithSVC`) need page object consolidation before merge
- Refactored copy available: `src/step-definitions/DSP.refactored.js`
