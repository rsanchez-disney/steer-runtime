# Dory Breaking Change Detection

When reviewing PRs for `standalone_tickets` or `jenkins-config`, check for changes that could break existing tests, jobs, or CI pipeline execution.

**Severity:** All breaking change findings are ⚠️ WARNING — they flag risk and require author acknowledgment, but do NOT block the PR.

## When This Rule Activates

- Any PR that modifies step definition files (`@step(...)`, `@given(...)`, `@when(...)`, `@then(...)`)
- Any PR that modifies shared helpers (`common/utils.py`, `common/guest_helper.py`, `brand/*_pages.py`, `frontend/`, `api/`)
- Any PR that modifies Jenkins helper classes or job parameters
- Any PR that modifies `behave_config.py`, `settings.ini`, or executor scripts

---

## Dimension 1: Step Regex Changes (standalone_tickets)

### What to Detect

When a `@step('...')`, `@given('...')`, `@when('...')`, or `@then('...')` decorator regex pattern is **modified** or **removed**:

1. Extract the OLD regex pattern from the diff (lines starting with `-`)
2. Extract the NEW regex pattern from the diff (lines starting with `+`)
3. Scan ALL `.feature` files in the repository for steps that matched the OLD pattern
4. Report which features are affected

### How to Scan

```bash
# Get all modified step decorators from the diff
git diff main...HEAD -- '*.py' | grep -E '^[-+].*@(step|given|when|then)\(' 

# For each OLD pattern, search feature files
grep -rn "<step text pattern>" *_features/ dlp_features/ services_features/ --include="*.feature"
```

### Detection Patterns

| Change Type | Breaking? | Detection |
|-------------|-----------|-----------|
| Step regex pattern modified | ⚠️ Yes | Old regex no longer matches existing feature steps |
| Step regex removed entirely | ⚠️ Yes | Features using that step will get "undefined step" |
| Step regex made more restrictive | ⚠️ Yes | Some existing matches may stop working |
| Step regex made more permissive | ✅ Usually safe | But check for new ambiguity with other steps |
| New step added | ✅ Safe | Unless it creates ambiguity with existing steps |

### Output Format

```
### ⚠️ Breaking Change: Step Regex Modified

**File:** `common/general_common_steps/login_steps.py` line 45
**Dimension:** Step Definition
**Old regex:** `@step('I log in as "(?P<user_type>.+)" user')`
**New regex:** `@step('I log in as "(?P<user_type>[^"]+)" in "(?P<brand>[^"]+)"')`
**Affected features:** 23 scenarios across 8 feature files

| Feature File | Line | Step Text |
|---|---|---|
| `dlr_features/features/checkout.feature` | 12 | `Given I log in as "std_user" user` |
| `wdw_features/features/cart.feature` | 8 | `Given I log in as "fl_user" user` |
| ... | ... | ... |

**Action required:** Update all 23 affected scenarios to match the new regex pattern, or keep backward compatibility by adding a second step decorator.
```

---

## Dimension 2: Shared Helper Changes (standalone_tickets)

### Critical Modules

These modules are imported by many step files. Changes here have broad impact:

| Module | Dependents | Risk |
|--------|-----------|------|
| `common/utils.py` | ~80+ files | CRITICAL — universal utility |
| `common/guest_helper.py` | ~30+ files | HIGH — guest management |
| `common/authentication.py` | ~25+ files | HIGH — all auth flows |
| `common/booking_tickets.py` | ~20+ files | HIGH — booking orchestration |
| `common/date_formatter.py` | ~15+ files | MEDIUM — date handling |
| `common/offers_helper.py` | ~10+ files | MEDIUM — promotions |
| `behave_config.py` | ALL features | CRITICAL — Behave hooks |
| `brand/*_pages.py` | All brand features | MEDIUM — UI page objects |
| `frontend/pages/*` | Cross-brand features | MEDIUM — shared pages |
| `frontend/modals/*` | Cross-brand features | MEDIUM — shared modals |
| `api/service/*` | Service test features | MEDIUM — API clients |
| `api/workflow/*` | Service test features | MEDIUM — API workflows |

### How to Detect

```bash
# Find all files that import the changed module
grep -rn "from common.utils import\|import common.utils" common/ *_features/ --include="*.py"

# For page objects
grep -rn "from brand.wdw_pages import\|from frontend.pages" common/ *_features/ --include="*.py"
```

### What to Flag

| Change Type | Breaking? | Risk |
|-------------|-----------|------|
| Function signature changed (params added/removed) | ⚠️ Yes | All callers using old signature will break |
| Function renamed | ⚠️ Yes | All import statements will fail |
| Function removed | ⚠️ Yes | ImportError at runtime |
| Return type changed | ⚠️ Yes | Callers expecting old type will fail |
| Class method moved to different module | ⚠️ Yes | Import paths break |
| New optional parameter with default | ✅ Safe | Existing callers unaffected |
| Bug fix (same interface) | ✅ Safe | Behavior improvement |
| New function added | ✅ Safe | No existing references |

### Output Format

```
### ⚠️ Breaking Change: Shared Helper Modified

**File:** `common/guest_helper.py` line 78
**Dimension:** Shared Helper
**What changed:** Function `create_guest()` signature — added required parameter `brand`
**Old signature:** `def create_guest(context, user_type)`
**New signature:** `def create_guest(context, user_type, brand)`
**Dependents:** 32 step files import this function

| Dependent File | Import Line | Calls `create_guest()` |
|---|---|---|
| `common/general_common_steps/login_steps.py` | L3 | L45, L67 |
| `common/general_common_steps/unified_checkout_steps.py` | L12 | L234 |
| ... | ... | ... |

**Action required:** Update all 32 callers to pass the new `brand` parameter, or make `brand` optional with a default value.
```

---

## Dimension 3: Jenkins Job Parameter Changes (jenkins-config)

### What to Detect

When a groovy job file modifies parameters:

1. Parameter added (INFO — safe, but document)
2. Parameter removed (WARNING — scripts referencing it will fail)
3. Parameter renamed (WARNING — triggers using old name will fail)
4. Default value changed (INFO — may change test behavior)
5. Choice options modified (WARNING — existing triggers may use removed option)
6. Helper method changed (CRITICAL — affects ALL jobs using that helper)

### How to Detect

```bash
# Find parameter changes in diff
git diff main...HEAD -- '*.groovy' | grep -E '^[-+].*(Param|parameter|choiceParam|stringParam|booleanParam)'

# Check if JobHelper methods changed
git diff main...HEAD -- 'helpers/*.groovy'

# Find executor script reference changes
git diff main...HEAD -- '*.groovy' | grep -E '^[-+].*readFileFromWorkspace'
```

### Helper Impact Matrix

| Changed Helper | Impact |
|----------------|--------|
| `JobHelper.getWebJobParameters()` | ALL web jobs (~400+) |
| `JobHelperMobile.*` | ALL mobile jobs (~70+) |
| `MobileConstants.*` | ALL mobile jobs |
| `ParameterDescriptions.*` | All jobs using shared descriptions |

### Output Format

```
### ⚠️ Breaking Change: Jenkins Parameter Removed

**File:** `commerce-automation/presales/studio-kaos/mods/web/mods_dlr_latest.groovy` line 12
**Dimension:** Jenkins Job Parameter
**What changed:** Parameter `MAGNIFAI` removed from job `mods-dlr-latest`
**Impact:** Any pipeline or scheduled trigger passing `MAGNIFAI=true` will fail
**Severity:** ⚠️ WARNING

**Action required:** Verify no upstream pipelines or cron triggers pass this parameter before merging.
```

---

## Summary Table Format

When breaking changes are found, present a consolidated summary:

```
## ⚠️ Breaking Changes Detected

| # | Dimension | File | What Changed | Affected | Risk |
|---|-----------|------|--------------|----------|------|
| 1 | Step Regex | `login_steps.py` L45 | Login step regex modified | 23 features | ⚠️ HIGH |
| 2 | Shared Helper | `guest_helper.py` L78 | `create_guest()` signature | 32 step files | ⚠️ HIGH |
| 3 | Jenkins Param | `mods_dlr_latest.groovy` L12 | `MAGNIFAI` param removed | 1 job | ⚠️ MEDIUM |

**Total:** 3 breaking changes — author must acknowledge before merge.
```

## Language

Always write breaking change analysis in English.
