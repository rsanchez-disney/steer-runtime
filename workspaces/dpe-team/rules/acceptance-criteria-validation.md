# Acceptance Criteria Validation Rule

When reviewing or implementing code tied to a Jira ticket, validate that every Acceptance Criterion (AC) is properly reflected in the implementation.

## When This Rule Activates

- Any PR linked to a Jira ticket (branch name contains `PPODPE-*`)
- Any implementation request that references a ticket or story
- Any code review where the ticket's ACs are available

## Process

### 1. Retrieve Acceptance Criteria

Extract ACs from the Jira ticket (via MCP tools or provided by the developer). ACs may be found in:

1. **Jira ticket description** — inline ACs in the ticket body
2. **Linked wiki pages** — Confluence/MyWiki pages linked from the Jira ticket (use `@confluence/*` MCP tools to fetch linked page content)
3. **PR description or user input** — provided directly by the developer

If the ticket contains links to wiki pages (e.g., `disneyexperiences.atlassian.net/wiki/...`), fetch those pages and extract ACs from them. Wiki pages often contain detailed requirements, acceptance criteria tables, or BDD scenarios that are not duplicated in the ticket itself.

ACs typically follow the format:

```
Given <precondition>
When <action>
Then <expected result>
```

Or as a checklist:
- [ ] AC1: <description>
- [ ] AC2: <description>

### 2. Map Each AC to Code

For every AC, identify:

| AC | Implemented In | How It's Covered | Test Coverage |
|---|---|---|---|
| AC1 | `file.java` L20-45 | Method handles the scenario | `FileTest.java` test name |
| AC2 | `file.java` L50-70 | Validation added | `FileTest.java` test name |
| AC3 | ❌ Not found | — | — |

### 3. Validate Coverage

For each AC, check:

- [ ] **Functional coverage** — Code exists that implements the described behavior
- [ ] **Boundary handling** — Edge cases implied by the AC are handled (nulls, empty, max values)
- [ ] **Error scenarios** — If the AC implies a failure mode, it's handled with appropriate error response
- [ ] **Test coverage** — At least one unit test directly validates the AC's expected outcome
- [ ] **Naming alignment** — Test method names reference the AC or scenario (e.g., `should_returnDiscount_when_arrivalDateInPromoWindow`)

### 4. Common Gaps to Flag

| Gap | Example | Severity |
|---|---|---|
| AC not implemented at all | Story says "support bulk delete" but no bulk endpoint exists | 🔴 CRITICAL |
| AC partially implemented | "Return error when input invalid" but only one validation of three is coded | ⚠️ WARNING |
| AC implemented but untested | Logic exists but no test verifies the specific scenario | ⚠️ WARNING |
| AC ambiguous — implementation assumes one interpretation | "Handle large requests" — dev chose 100 limit but AC doesn't specify | ℹ️ INFO — flag for PO clarification |
| AC contradicts existing behavior | New AC conflicts with existing calculator logic or config | ⚠️ WARNING |

## Output Format

```
## Acceptance Criteria Validation: PPODPE-XXXX

### Summary

| AC | Status | Notes |
|---|---|---|
| AC1: <short description> | ✅ Covered | `File.java` L20, test: `should_...` |
| AC2: <short description> | ⚠️ Partial | Missing error case for null input |
| AC3: <short description> | ❌ Missing | No implementation found |

### Findings

⚠️ **AC2 — Partial implementation**
**Expected:** "When input is invalid, return 400 with error details"
**Found:** Validation exists for empty string but not for null or malformed JSON
**File:** `InputValidator.java` L35
**Suggested fix:** Add null check and JSON parse validation before processing

❌ **AC3 — Not implemented**
**Expected:** "Admin can export rate changes as CSV"
**Found:** No export endpoint or CSV generation logic in the diff
**Action:** Implement or confirm this AC is deferred to a follow-up ticket

### Verdict

- ✅ Fully covered: N ACs
- ⚠️ Partially covered: N ACs
- ❌ Not covered: N ACs
```

## Integration with Code Review

The code review agent should:

1. Check if the PR branch contains a ticket reference (`PPODPE-*`)
2. If ACs are available (from Jira MCP or provided in PR description), run this validation
3. Include the AC validation table in the review output, after the standard findings
4. If ACs are not available, prompt: "Provide the Acceptance Criteria from PPODPE-XXXX to validate implementation completeness"

## Language

Always write findings in English.
