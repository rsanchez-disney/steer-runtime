## Validation: {TEST_SET_KEY} vs {EPIC_KEY} ({Epic Title})

### Context Summary

{One paragraph describing the epic scope and the test set purpose}

### Tests in Set

| Test Key   | Summary                          | Type     | Platform | Last Status |
|------------|----------------------------------|----------|----------|-------------|
| PROJ-XXXXX | Description of test              | Cucumber | iOS      | PASS        |

### Requirement Decomposition

| #   | Requirement                                | Source         |
|-----|-------------------------------------------|----------------|
| R1  | {requirement}                             | AC-1 / desc    |
| R2  | {requirement}                             | Business rule  |

### Coverage Matrix

| Requirement | Covered | Test Key(s) | Notes                    |
|-------------|---------|-------------|--------------------------|
| R1          | ✅      | PROJ-XXXXX  | Explicitly validated     |
| R2          | ⚠️      | PROJ-YYYYY  | Implicit — confirm steps |
| R3          | ❌      | —           | No test found            |

### Gap Analysis

| # | Requirement | Severity | Risk                          | Recommendation             |
|---|-------------|----------|-------------------------------|----------------------------|
| 1 | R3          | High     | Untested downstream payload   | Add integration test       |

### Risk Assessment: {🟢 PASS | 🟡 CONDITIONAL | 🔴 BLOCKED}

{Explanation of the score}

### Confidence Score: {N}%

{Breakdown: what is well-covered vs. where gaps exist}

### Recommendations

1. {Actionable recommendation with specific test keys or scenarios}
2. {Next recommendation}

---

_Generated: YYYY-MM-DD HH:MM UTC_
