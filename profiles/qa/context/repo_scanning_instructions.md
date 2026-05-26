# Repo Scanning Instructions

## What to Scan

Search `*.py` files for Behave step definition decorators:

- `@given("pattern")`
- `@when("pattern")`
- `@then("pattern")`
- `@step("pattern")`

## How to Scan

1. `grep` for `@given\|@when\|@then\|@step` in `*.py` files at repo path
2. Exclude: `__pycache__`, `.git`, `node_modules`, `datasources`
3. Extract the pattern string from each decorator

## Pattern Formats

```python
# Literal
@given("I am on the homepage")

# Parameterized with regex
@when('I enter "([^"]*)" in the search box')

# Parameterized with parse
@when("I click on {element}")

# Multi-line with docstring
@given("the following users exist")
```

## Matching Rules

When matching candidate steps against the catalog:

- Ignore keyword differences (Given/When/Then are interchangeable with @step)
- Parameterized patterns match any value in that position
- Quotes in step text may differ from quotes in decorator — match by content
