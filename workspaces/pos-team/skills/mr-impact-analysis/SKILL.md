# MR Impact Analysis skill

Analyze a Disney 2.0.X → main merge request for risks to Globant's epics 2.1.1 and 2.1.3.

## Trigger

Manual. User provides an MR IID number (e.g., `!4700`).

## Inputs

| Input  | Required | Description                              |
|--------|:--------:|------------------------------------------|
| MR IID | Yes      | The merge request internal ID to analyze |

## Workflow

### Step 1 — Fetch MR metadata

```text
Action: gitlab_get_mr
Project: wdpr-point-of-sale/dsp-engineering/activatex
MR IID: {provided by user}
```

Extract: title, source branch, target branch, author, description, changed file list.

### Step 2 — Get the diff (changed files)

Read the MR's changed files list. For each changed file, determine if it falls within our owned code paths defined in `.kiro/steering/mr-impact-config.md`.

Categories to check:

- **Direct hit**: file is in our owned paths list
- **Shared dependency**: file is an interface, base class, or data model imported by our owned code
- **DI/config**: file is a Dagger module, component, or configuration provider
- **Test collision**: file is a test for code we also test

### Step 3 — Blast-radius analysis

For each file with a direct hit or shared dependency match:

1. Use `graphify_explore` or `graphify_impact` to find all callers/dependents
2. Cross-reference dependents against our feature-flag-guarded code AND our unguarded 2.1.1 code
3. Identify if the change alters: method signatures, return types, parameter types, control flow, data model fields
4. For **unguarded 2.1.1 paths**: flag as Critical immediately — there is no FF to disable these

### Step 3.5 — Unguarded 2.1.1 impact detection

For each changed file, check if it touches code areas related to these 2.1.1 domains (see full list in `mr-impact-config.md`):

- **Checks**: split, combine, transfer, menu, submit, status
- **Gratuities/Tips**: prevent multiple, auto-apply, tip calculation, block tips
- **Receipts**: cash entered, TSR receipts, print all copies
- **Tabs**: create/close, configuration, historical
- **Item countdown**: quantity adjust, offline, checkout check
- **Login/Auth**: auto signoff, app lock, proxy server, locked accounts
- **Cart/Items**: modifiers, item restrictions, hold and fire
- **Electronic Journal**: print activity, keystroke, seat/course numbers
- **Reports**: cash responsibility, tax config

If the MR touches any of these domains, the risk is **Critical** because there's no feature flag to disable the broken code.

### Step 4 — Feature flag interaction check

For each changed file, search for:

- Direct usage of any flag from our registry (imports of `Features.*`)
- Changes inside `if (featureFlagRepository.isFeatureEnabled(...))` blocks
- Changes to methods called from within feature-flag-guarded branches
- Removal or renaming of methods/classes our FF code calls

### Step 5 — Score and classify

Assign severity per the agent's risk scoring criteria:

| Severity | Symbol |
|----------|:------:|
| Critical |   🔴   |
| High     |   🟠   |
| Medium   |   🟡   |
| Low      |   🟢   |

### Step 6 — Generate report

Produce the output as a single markdown file saved to `docs/mr-impact-reports/MR-{iid}-impact-analysis.md` with these sections:

---

#### Template

```markdown
# MR Impact Analysis: !{iid}

**MR title**: {title}
**Source branch**: {source_branch}
**Author**: {author}
**Analysis date**: {date}
**Overall risk**: {Critical|High|Medium|Low}

## Executive summary

{One paragraph describing the overall risk to our epics}

## Risk matrix

| # | File                          | Severity | Impact                              | Affected epic | Feature flag         |
|---|-------------------------------|:--------:|-------------------------------------|---------------|----------------------|
| 1 | path/to/File.kt              |    🔴    | Description of what could break     | 2.1.3         | IsDiscountsTabEnabled |
| 2 | path/to/OtherFile.kt         |    🟡    | Description of medium-risk change   | 2.1.3         | N/A (shared dep)     |

## Detailed findings

### Finding 1: {File.kt} — 🔴 Critical

**What changed**: {describe the diff}

**Why it matters**: {explain the connection to our code}

**Affected code paths**:
- `OurClass.kt:42` — calls `changedMethod()` inside FF guard
- `AnotherClass.kt:88` — implements `ChangedInterface`

**Evidence**:
\```kotlin
// Their change (in the MR)
fun changedMethod(): NewReturnType { ... }

// Our code that depends on it
if (featureFlagRepo.isFeatureEnabled(Features.IsDiscountsTabEnabled())) {
    val result = changedMethod() // <-- breaks here
}
\```

---

## Ready-to-paste MR comments

### Comment 1: {File.kt}

> **⚠️ Impact on Epic 2.1.3 — {Feature Flag Name}**
>
> This change modifies `{method/class}` which is called from within a feature-flag-guarded path (`{flag name}`).
>
> Specifically:
> - `{OurFile.kt:line}` calls `{changedSymbol}` inside the `{flagName}` branch
> - The change from `{old behavior}` to `{new behavior}` will cause `{specific issue}`
>
> **Suggested action**: {what they should do}
>
> cc @jorge.reyes

---

## Recommended actions

- [ ] {Action item 1}
- [ ] {Action item 2}
- [ ] {Action item 3}
```

---

### Step 7 — Present results

Display:

1. The overall risk level
2. The risk matrix table
3. The ready-to-paste comments (so user can immediately copy them)
4. Confirm the report was saved

## Notes

- If the MR only touches files completely outside our owned paths with no transitive dependencies, report "✅ No impact detected" with a brief explanation of what was checked.
- If the MR modifies the `Features.kt` file itself (adding/removing/renaming flags), that is always Critical.
- If the MR modifies `FeatureFlagRepositoryImpl.kt` or `FeatureFlagModule.kt`, always flag as High.
