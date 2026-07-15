# Dory Step Validation Rule

Validates that all steps in feature files have matching implementations, and that no step definitions create ambiguity or collisions.

**Severity:** Undefined and duplicated steps are 🔴 CRITICAL — they cause runtime failures.

## When This Rule Activates

- Any PR that adds or modifies `.feature` files
- Any PR that adds, modifies, or removes `@step(...)` decorators in Python files
- Any PR that modifies step file imports or `environment.py` (which controls step loading)

---

## Check 1: Undefined Step Detection

### Purpose

Catch steps that will fail at runtime with Behave's `UndefinedStepError`. This is the #1 cause of test failures in new feature PRs.

### Process

1. **Extract steps from changed feature files:**
   - Parse all `Given`, `When`, `Then`, `And`, `But` lines from `.feature` files in the diff
   - Strip Gherkin keywords to get raw step text
   - For `Scenario Outline`, substitute `<placeholder>` with a representative value from `Examples`

2. **Search for matching step definitions:**
   - Scan these directories for `@step(...)`, `@given(...)`, `@when(...)`, `@then(...)` decorators:
     - `common/general_common_steps/` (99 files, primary location)
     - `common/general_common_steps_mobile/` (mobile steps)
     - Feature-specific `steps/` directories (e.g., `services_features/steps/`)
   - Match step text against each decorator's regex/parse pattern
   - Account for Behave's matching modes: `parse` (default), `re` (regex), `cfparse`

3. **Report undefined steps:**

```
### 🔴 CRITICAL: Undefined Step

**Feature:** `dlr_features/features/special_events.feature` line 34
**Step:** `When I select the "Halloween Party" event from the list`
**Status:** No matching `@step(...)` found in any step file

**Searched locations:**
- common/general_common_steps/ (99 files)
- common/general_common_steps_mobile/ (16 files)
- dlr_features/steps/ (if exists)

**Closest matches (by similarity):**
1. `@step('I select the "{event_name}" from the events page')` → `common/general_common_steps/special_events_config_steps.py:23`
2. `@step('I select "{option}" from the list')` → `common/general_common_steps/general_common_steps.py:145`

**Fix:** Implement the step in the appropriate step file, or use an existing step that matches.
```

### Using the Step Catalog

The repository maintains `docs/ai/step_catalog.json` (400KB, full step index). When available, use this as a fast lookup instead of scanning all files:

```bash
# Check if step catalog exists and is recent
ls -la docs/ai/step_catalog.json

# Search for a step pattern in the catalog
grep -i "select.*event" docs/ai/step_catalog.json
```

If the catalog is stale (older than the branch), fall back to scanning source files directly.

---

## Check 2: Step Duplication / Collision Detection

### Purpose

Catch steps that will fail at runtime with Behave's `AmbiguousStep` error. This happens when a step text matches MORE THAN ONE `@step(...)` decorator.

### Process

1. **For each NEW or MODIFIED `@step(...)` in the diff:**
   - Extract the regex/parse pattern
   - Generate sample step texts that would match this pattern
   - Search ALL existing step files for other decorators that would also match those same texts

2. **Common collision scenarios:**

| Scenario | Example | Problem |
|----------|---------|---------|
| Broad regex overlaps narrow | `@step('I click on "{element}"')` vs `@step('I click on "submit"')` | Both match `I click on "submit"` |
| Greedy pattern overlaps | `@step('I see (.+)')` vs `@step('I see "(.+)" on the page')` | Both match `I see "hello" on the page` |
| Identical patterns in different files | Same `@step(...)` in two files | Behave loads both, ambiguity error |
| `@step` vs `@given`/`@when`/`@then` | `@step('I log in')` and `@given('I log in')` | `@step` matches all keywords — collision |

3. **Report duplications:**

```
### 🔴 CRITICAL: Step Duplication — AmbiguousStep Risk

**New step:** `common/general_common_steps/checkout_steps.py` line 89
**Pattern:** `@step('I select "{payment_method}" as payment method')`

**Conflicts with:**
- `common/general_common_steps/unified_checkout_steps.py` line 234
  `@step('I select "{option}" as payment method')`

**Sample text that matches BOTH:** `I select "Credit Card" as payment method`

**Impact:** Behave will raise `AmbiguousStep` at runtime for any scenario using this step text.

**Fix options:**
1. Remove the duplicate — use the existing step in `unified_checkout_steps.py`
2. Make patterns non-overlapping: add a distinguishing word or use a different step text
3. Consolidate into a single implementation
```

### Quick Scan Commands

```bash
# Find all step decorators and their patterns
grep -rn "@step\|@given\|@when\|@then" common/general_common_steps/ --include="*.py" | grep -oP "(?<=')[^']+(?=')"

# Search for potential collision with a new pattern
grep -rn "payment.method" common/general_common_steps/ --include="*.py"
```

---

## Check 3: Removed Step Detection

### Purpose

Catch when a step definition is removed from the codebase, leaving feature files with undefined steps that will fail at runtime.

### Process

1. **Identify removed step decorators from the diff:**
   - Lines starting with `-` that contain `@step(`, `@given(`, `@when(`, `@then(`
   - Extract the pattern text

2. **Search for feature files that depend on the removed step:**
   - Scan ALL `*_features/` directories for step text matching the removed pattern
   - Count affected scenarios

3. **Report:**

```
### 🔴 CRITICAL: Step Removed — Features Will Fail

**Removed from:** `common/general_common_steps/login_steps.py` line 23
**Pattern:** `@step('I log in as "{user_type}" user')`
**Status:** REMOVED in this PR

**Affected features:** 45 scenarios across 12 feature files

| Feature File | Scenarios Using This Step |
|---|---|
| `dlr_features/features/checkout.feature` | 8 scenarios |
| `wdw_features/features/cart.feature` | 6 scenarios |
| `wdw_features/features/tickets.feature` | 5 scenarios |
| ... | ... |

**Impact:** All 45 scenarios will fail with `UndefinedStepError` after this PR merges.

**Fix options:**
1. Keep the old step and add the new one alongside it (backward compatible)
2. Update all 45 affected scenarios to use the replacement step
3. Add a deprecated wrapper: `@step('I log in as "{user_type}" user')` that calls the new implementation
```

---

## Validation Summary Format

After running all three checks, produce a summary:

```
## Step Validation Summary

| Check | Status | Count |
|---|---|---|
| Undefined steps | 🔴 / ✅ | N undefined |
| Duplicated steps | 🔴 / ✅ | N collisions |
| Removed steps | 🔴 / ✅ | N removed (affecting M features) |

**Verdict:** Step validation {PASSED / FAILED}
```

---

## Important Notes

1. **Behave step matching is case-sensitive** — `"I Log In"` ≠ `"I log in"`
2. **`@step(...)` matches ALL keywords** (Given/When/Then) — it's the most common source of collisions
3. **`use_step_matcher("re")` changes matching behavior** — if a step file uses regex mode, patterns are interpreted differently
4. **Step imports matter** — only steps in directories configured in `environment.py`'s `before_all` are loaded
5. **The step catalog (`docs/ai/step_catalog.json`) is a fast lookup** but may be stale — verify against source files for critical decisions

## Language

Always write step validation findings in English.
