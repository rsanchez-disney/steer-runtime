# Readiness Assessment

## Inputs Required

- **Candidate steps** — from `xray_get_test_steps` for each 🎯 candidate
- **Repo step catalog** — from scanning `*.py` files (see `repo_scanning_instructions.md`)

## Step Matching

For each candidate step, check if a matching pattern exists in the repo:

- **Exact match** — step text matches a decorator pattern verbatim
- **Parametric match** — step text fits a parameterized pattern (e.g., `"I click on {element}"`)
- **Keyword equivalence** — `@step` matches Given/When/Then interchangeably

## Status Assignment

For each candidate, count how many of its steps are missing from the repo:

- 🟢 **Ready** — All steps found in repo
- 🟡 **Partial** — 1-2 steps missing
- 🔴 **Not ready** — 3+ steps missing

## Output: Readiness Table

| # | Key | Summary | Status | Missing Steps |
|---|-----|---------|--------|---------------|
| 1 | COM-12345 | ... | 🟢 | — |
| 2 | COM-12346 | ... | 🟡 | Given X |
| 3 | COM-12347 | ... | 🔴 | Given A, When B, Then C |

## Output: Summary Counts

```
🟢 Ready: {count}
🟡 Partial: {count}
🔴 Not ready: {count}
```

## Edge Case: No Steps in XRay

If `xray_get_test_steps` returns empty for a candidate:

- Mark as 🟡 **Partial** with note: "No steps defined in XRay — cannot assess"
- Do NOT mark as 🟢 (no steps ≠ all steps found)
- Do NOT fabricate steps
