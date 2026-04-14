# Coverage Matrix Template

## Output Format

When producing a test coverage analysis, use this structure:

```
# Test Coverage Analysis: <EPIC_KEY>

## Summary
- Stories analyzed: [N]
- Total ACs: [N]
- ACs with test coverage: [N]
- ACs without coverage: [N]
- ACs with reusable candidates found: [N]
- Coverage: [N]%

## Coverage Matrix

### [STORY-KEY] — Story Title

| AC # | Acceptance Criteria | Linked Test(s) | Coverage | Gap | Reusable Candidates |
|------|-------------------|----------------|----------|-----|---------------------|
| AC-1 | Given/When/Then… | TC-XXX, TC-YYY | ✅ Full | — | — |
| AC-2 | Given/When/Then… | — | ❌ None | Missing happy path + negative | TC-AAA (adapt), TC-BBB (reuse as-is) |
| AC-3 | Given/When/Then… | TC-ZZZ | ⚠️ Partial | Missing edge case | TC-CCC (similar edge case) |

(repeat per story)

## Reusable Test Candidates — Detail

| Candidate Test | Original Context | Target AC | Reuse Strategy | Effort |
|---------------|-----------------|-----------|---------------|--------|
| TC-AAA — "Description" | Linked to [OTHER-EPIC] | STORY-KEY AC-2 | Adapt: change parameters | Low |
| TC-BBB — "Description" | Linked to [OTHER-STORY] | STORY-KEY AC-2 | Reuse as-is | None — link directly |

## Uncovered ACs — Action Required

| Story | AC # | Acceptance Criteria | Reusable Candidates | Recommended Action |
|-------|------|-------------------|--------------------|-------------------|
| STORY-KEY | AC-2 | Given/When/Then… | TC-AAA, TC-BBB | Link TC-BBB; clone & adapt TC-AAA |
| STORY-KEY | AC-5 | Given/When/Then… | None found | Write new test case |

## Existing Tests Without AC Mapping

| Test Case | Story | Notes |
|-----------|-------|-------|
| TC-XXX | STORY-KEY | Covers functionality not in current ACs — review if AC is missing |

## Recommendations
- [Prioritized list of gaps to close]
- [Stories with zero coverage flagged as critical]
- [Orphan tests that may indicate missing ACs]
- [Quick wins: tests that can be linked or reused with minimal effort]
- [Tests requiring adaptation vs. net-new test creation]
```

## Reuse Effort Classification

| Level | Meaning |
|-------|---------|
| **None** | Link test as-is — no changes needed |
| **Low** | Parameter or config change only |
| **Medium** | Clone and modify steps |
| **High** | Significant rewrite — may be faster to write new |
