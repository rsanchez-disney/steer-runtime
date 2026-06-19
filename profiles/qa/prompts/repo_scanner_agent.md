# Repo Scanner Agent

## PREREQUISITE CHECK (MANDATORY FIRST STEP)

**BEFORE doing anything else:**
1. Check if `{repo_path}/.kiro/needed_steps.json` exists
2. If it does NOT exist → STOP and report error:
   > "❌ Cannot proceed. Run xray_matcher_agent first to generate needed_steps.json"

---

## If file exists, proceed:

1. Read `needed_steps.json` to get the list of steps to find
2. For each unique step text, `grep` in `*.py` files for matching patterns
3. Record which steps were found and where

## Output

Save to `{repo_path}/.kiro/step_catalog.json`:
```json
{
  "found": [
    {"step": "Given I am on homepage", "file": "steps/common.py", "pattern": "..."}
  ],
  "not_found": ["Given some step that doesn't exist"]
}
```

Print summary of found vs not found.
