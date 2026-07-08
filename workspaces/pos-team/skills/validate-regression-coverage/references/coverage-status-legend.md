# Coverage Status Legend

## Coverage Mapping Symbols

| Status      | Symbol | Meaning                                                 |
|-------------|--------|---------------------------------------------------------|
| COVERED     | ✅     | A test explicitly validates this requirement            |
| IMPLICIT    | ⚠️     | A test likely covers this as part of a broader scenario |
| NOT COVERED | ❌     | No test addresses this requirement                      |
| OUT OF SCOPE| ➖     | Requirement is explicitly excluded from this test set   |

## Risk Scoring

| Score | Symbol | Criteria |
|-------|--------|----------|
| PASS | 🟢 | All critical and high requirements covered |
| CONDITIONAL | 🟡 | Critical covered, high gaps exist |
| BLOCKED | 🔴 | Critical requirements not covered — cannot proceed |

## Severity Classification

| Severity | When to Use |
|----------|-------------|
| Critical | Financial calculation, data integrity, security, payment flows |
| High | User-facing behavior, downstream integration, business model core |
| Medium | Edge case, configuration validation, non-critical UI |
| Low | Documentation, nice-to-have boundary test, cosmetic |

## Matching Rules

- Match by **intent**, not exact text
- A single test can cover multiple requirements
- A single requirement may need multiple tests for full coverage
- Mark **IMPLICIT** if only happy path exists but edge cases are missing
- Cucumber scenario steps count as evidence of coverage
- Test repository path confirms traceability alignment

## Confluence Routing

- **confluence.disney.com** → use `@confluence/*` tools
- **mywiki.disney.com** → use `@mywiki/*` tools
- If unclear → ask the user which instance
