# Repo Scanning Instructions

## Primary Source: step_catalog.json

Look for a pre-built step catalog at `{repo_path}/docs/ai/step_catalog.json`. If it exists, use it as your primary source.

### Structure

```json
{
  "version": "1.0",
  "modules": [
    {
      "file": "common/general_common_steps/example_steps.py",
      "steps": ["S|I access the page in \"{store}\" as \"{affiliation}\""],
      "domain": "tickets",
      "pages": ["example_page"]
    }
  ]
}
```

### Step Prefix Legend

- `G|` = Given
- `W|` = When
- `S|` = Step (matches any keyword)
- `T|` = Then

### How to Use

1. Read `{repo_path}/docs/ai/step_catalog.json`
2. Print: "📚 Step catalog found — {N} modules, {M} total steps"
3. Search modules by `domain` or `pages` relevant to the candidate's area
4. Match candidate steps against the `steps` arrays
5. The `file` field tells you where the step is implemented

## Fallback: grep (only if step_catalog.json is missing)

If the catalog doesn't exist, scan manually:

1. `grep` for `@given\|@when\|@then\|@step` in `*.py` files at repo path
2. Exclude: `__pycache__`, `.git`, `node_modules`, `datasources`
3. Extract the pattern string from each decorator

## Matching Rules

- Ignore keyword differences (G/W/S/T are interchangeable)
- Parameterized patterns (text in `"{}"`) match any value
- Match by intent: "I click on {element}" matches "I click on the add to cart button"
- Search related domains/pages for semantic matches
