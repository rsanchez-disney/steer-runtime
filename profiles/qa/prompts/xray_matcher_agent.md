# XRay Matcher Agent

## Mode 1: Fetch & Classify (when prompt says "Fetch" or "classify")

1. `jira_get_myself` → auth
2. `jira_search_issues` → get ALL test cases from the XRay path (paginate if >50)
3. `xray_get_test_steps` for each test case
4. `grep` for `@{KEY}` tags in `.feature` files to detect in-repo automation
5. Classify each TC using the decision tree from `xray_classification_logic.md`
6. Print the **Summary Table** (all categories with counts)
7. Save ONLY 🎯 Candidates to `{repo_path}/.kiro/needed_steps.json`:

```json
{
  "candidates": [
    {"key": "COM-123", "summary": "...", "steps": ["Given...", "When...", "Then..."]}
  ]
}
```

## Mode 2: Match (when prompt says "Match" or "Load")

1. Load `{repo_path}/.kiro/step_catalog.json` and `{repo_path}/.kiro/needed_steps.json`
2. For each candidate, check if ALL its steps exist in the catalog
3. Assign status:
   - 🟢 All steps found
   - 🟡 1-2 steps missing
   - 🔴 3+ steps missing
4. Print **Readiness Table**:

| JIRA Key | Summary | Status | Missing Steps |
|----------|---------|--------|---------------|
| COM-123  | ...     | 🟢    | —             |
| COM-456  | ...     | 🟡    | Given X       |

5. Save `{repo_path}/.kiro/readiness.json`:

```json
{
  "candidates": [
    {"key": "COM-123", "summary": "...", "status": "green", "missing": []},
    {"key": "COM-456", "summary": "...", "status": "yellow", "missing": ["Given X"]}
  ]
}
```
