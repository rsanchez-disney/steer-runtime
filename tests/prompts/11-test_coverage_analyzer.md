# Test Coverage Analyzer with Reuse Discovery

Analyze test coverage for epic {{EPIC_KEY}} against the Jira/Xray test repository, and identify reusable existing tests that could fill gaps.

## Steps

1. **Fetch the epic** using Jira MCP tools. Extract all linked user stories.

2. **For each user story**, extract:
   - Story key and title
   - All acceptance criteria (identify each AC individually, even if not numbered)

3. **Search the Xray test repository** in Jira for existing test cases linked to each story. For each test case found, extract:
   - Test key, title, and status
   - Which AC(s) it covers (match by content/intent, not just links)
   - Test type (manual, automated, etc.)

4. **Search for reusable unlinked tests** — For each AC that has no coverage or partial coverage:
   - Search the Xray test repository broadly (same project and related projects) for existing test cases that match the AC's intent, keywords, or functional area — even if they are not linked to this epic or its stories
   - Use multiple search strategies: by functional area keywords (e.g., "cart", "checkout", "calendar", "add-ons"), by offer type patterns (e.g., "special offer", "STD_GST"), and by UI component (e.g., "modal", "Terms & Conditions", "delivery options")
   - For each candidate found, extract: test key, title, status, what it originally covers, and how it could be adapted or reused for the uncovered AC

5. **Build a coverage matrix**:

```
# Test Coverage Analysis: {{EPIC_KEY}}

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
| AC-3 | Given/When/Then… | TC-ZZZ | ⚠️ Partial | Missing edge case | TC-CCC (covers similar edge case for different offer) |

(repeat per story)

## Reusable Test Candidates — Detail

For each candidate identified above:

| Candidate Test | Original Context | Target AC | Reuse Strategy | Effort |
|---------------|-----------------|-----------|---------------|--------|
| TC-AAA — "Validate cart recalculation on quantity change" | Linked to [OTHER-EPIC], covers cart math for Florida Resident offer | STORY-KEY AC-2 | Adapt: change offer type to After 2 PM, same validation steps | Low — parameter change only |
| TC-BBB — "Verify no add-ons displayed for restricted offer" | Linked to [OTHER-STORY], generic add-on suppression test | STORY-KEY AC-2 | Reuse as-is: test is offer-agnostic | None — link directly |
| TC-CCC — "Calendar boundary date validation" | Unlinked orphan test in COM project | STORY-KEY AC-3 | Adapt: update date range to usage window 5/26–8/2 | Low — date config change |

## Uncovered ACs — Action Required

| Story | AC # | Acceptance Criteria | Reusable Candidates | Recommended Action |
|-------|------|-------------------|--------------------|--------------------|
| STORY-KEY | AC-2 | Given/When/Then… | TC-AAA, TC-BBB | Link TC-BBB directly; clone & adapt TC-AAA |
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

6. **Flag risks**:
   - Stories with zero test coverage
   - ACs covered only by manual tests (no automation)
   - Test cases that don't map to any current AC (orphan tests)
   - Reusable candidates that are in a failed or deprecated state

## Matching Rules

When determining if a test case covers an AC:
- Match by **intent**, not just exact text — a test case titled "Verify user can submit payment" covers an AC about payment submission
- A single test case can cover multiple ACs
- A single AC may need multiple test cases (happy path, negative, edge case)
- Mark coverage as **Partial** if only happy path exists but negative/edge cases are missing

When searching for reusable candidates:
- Search across **all projects** in the Xray repository, not just the epic's project
- Match by **functional area** (e.g., a "cart recalculation" test from any offer type is a candidate for a cart AC)
- Match by **UI component** (e.g., a "Terms & Conditions modal" test from any flow is a candidate)
- Match by **validation pattern** (e.g., a "sales window enforcement" test from a different offer is a candidate)
- Classify reuse effort as: **None** (link as-is), **Low** (parameter/config change), **Medium** (clone & modify steps), **High** (significant rewrite — may be faster to write new)
