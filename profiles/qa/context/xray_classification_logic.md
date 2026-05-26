# XRay Test Case Classification

## Inputs Required

- **Automation Status** field from Jira (normalize: "Automated"/"Done" → AUTOMATED, "Cannot Automate" → CANNOT, else → OTHER)
- **Automation Candidate** field from Jira (normalize: "No"/"N" → NO, "Yes"/"Y" → YES, empty/null → MISSING)
- **inRepo** — whether the TC key exists as a `@{PROJECT}-XXXXX` tag in any `.feature` file in the repo

## Decision Tree

```
if inRepo:
    status == AUTOMATED → "✅ Automated & in repo"
    else               → "⚠️ In repo but Jira not synced"
else:
    status == AUTOMATED → "⚠️ Automated in Jira but not in repo"
    status == CANNOT    → "Cannot Automate"
    candidate == NO     → "Not a Candidate"
    candidate == MISSING→ "⚠️ Missing Candidate field"
    else                → "🎯 Candidate"
```

## Detecting inRepo

1. `grep` for `@{PROJECT}-\d+` in `*.feature` files at the repo path
2. Build a set of keys found → those are "inRepo"

## Validation

Sum of all categories MUST equal total fetched. If it doesn't, re-examine classifications before presenting.

## Output: Summary Table

| # | Category | Count | Meaning |
|---|----------|-------|---------|
| 1 | Total fetched | {A} | All TCs in XRay path |
| 2 | ✅ Automated & in repo | {B} | Fully synced |
| 3 | ⚠️ In repo but Jira not synced | {C} | Update Jira to Automated |
| 4 | ⚠️ Automated in Jira but not in repo | {D} | May be stale |
| 5 | Cannot Automate | {E} | Excluded by status |
| 6 | Not a Candidate | {F} | Excluded by Candidate=No |
| 7 | ⚠️ Missing Candidate field | {G} | Needs triage |
| 8 | **🎯 Candidates** | **{H}** | **Ready to automate** |

> ✅ Validation: {B}+{C}+{D}+{E}+{F}+{G}+{H} = {A}

## Output: Candidates Table

| # | Key | Summary |
|---|-----|---------|
| 1 | COM-12345 | ... |
