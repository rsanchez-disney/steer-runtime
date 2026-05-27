# Readiness Assessment

## Inputs Required

- **Candidate steps** — from `xray_get_test_steps` for each 🎯 candidate
- **Repo step catalog** — from scanning `*.py` files (see `repo_scanning_instructions.md`)

## Step Matching

For each candidate step, try matching in this order:

1. **Exact match** — step text matches a decorator pattern verbatim
2. **Parametric match** — step text fits a parameterized pattern (e.g., `"I click on {element}"`)
3. **Keyword equivalence** — `@step` matches Given/When/Then interchangeably
4. **Semantic match** — no exact pattern exists, but a step with similar intent/description exists in the repo. Look for:
   - Same action on same element (e.g., "click add to cart" ≈ "I click on the add to cart button")
   - Same validation with different wording (e.g., "verify calendar displayed" ≈ "the calendar page is visible")
   - Steps used in similar scenarios (same feature area, same page, same flow)

## Match Classification

- ✅ **Found** — exact or parametric match
- 🔄 **Suggested** — semantic match found, step exists but wording differs. Include the suggested step.
- ❌ **Missing** — no match of any kind

## Readiness Calculation

Count ✅ and 🔄 as "covered" for the percentage. Only ❌ counts as missing.

## Suggestions

When a 🔄 semantic match is found, show the suggestion:

| Candidate Step | Suggested Repo Step | File |
|---------------|--------------------:|------|
| Verify calendar is displayed | Then Admission Calendar Page web component is displayed | sales_admission_calendar_page_steps.py |

Look for suggestions by:
- Searching `.feature` files in the same area for similar scenarios
- Checking step files that handle the same page/component
- Matching by action verb + target element

## Status Assignment

For each candidate, calculate: `readiness % = (steps found / total steps) * 100`

- 🟢 **Ready** — 100% steps found
- 🟡 **Partial** — 50-99% steps found
- 🔴 **Not ready** — <50% steps found

## Output: Readiness Table

| # | Key | Summary | Readiness | Status | Missing Steps |
|---|-----|---------|-----------|--------|---------------|
| 1 | COM-12345 | ... | 100% | 🟢 | — |
| 2 | COM-12346 | ... | 75% | 🟡 | Given X |
| 3 | COM-12347 | ... | 20% | 🔴 | Given A, When B, Then C |

## Output: Summary Counts

```
🟢 Ready (100%): {count}
🟡 Partial (50-99%): {count}
🔴 Not ready (<50%): {count}
```

## Edge Case: No Steps in XRay

If `xray_get_test_steps` returns empty for a candidate:

- Mark as 🟡 **Partial** with note: "No steps defined in XRay — cannot assess"
- Do NOT mark as 🟢 (no steps ≠ all steps found)
- Do NOT fabricate steps
