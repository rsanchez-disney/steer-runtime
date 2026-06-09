# Skill: Coverage Ticket Mode

Use this skill when the user provides a single Story or Bug ticket for deep coverage analysis (AC ↔ OPP ↔ Code ↔ Test coherence).

---

## Ticket Step 1: Fetch Story/Bug Details

Call `jira_get_issue` for the ticket to get:
- `summary`, `description` (contains Acceptance Criteria), `status`, `issuetype`

Parse the ACs from the description (numbered lists, Given/When/Then, or bullet points).

---

## Ticket Step 2: Find Linked XRay Test Cases

```
issue in linkedIssues("{ticketKey}") AND issuetype = Test
```

For each OPP, call `jira_get_issue` with `customFields: ["customfield_20104"]` to get Test_Details.

**⚠️ NEVER use `xray_get_test_steps` or `xray_get_test_case_full`** — they return 404. ALWAYS use `jira_get_issue` with `customFields: ["customfield_20104"]`.

Response format: `{"steps": [{"index": 1, "fields": {"Action": "...", "Data": "...", "Expected Result": "..."}}]}`

---

## Ticket Step 3: AC ↔ OPP Coherence Validation

For each AC: ✅ Covered by OPP | ⚠️ Partially covered | ❌ No OPP
For each OPP: ✅ Maps to AC | ⚠️ Extra coverage | ❌ No matching AC

---

## Ticket Step 4: Code Implementation Validation

Search the project's source directory for files implementing the ticket's functionality. The source directory depends on the platform (e.g., `lib/src/features/` for Flutter, `src/app/` for Angular, `internal/` or `cmd/` for Go). Use the directory resolved from Team_Label or platform detection.

Per AC: ✅ Implemented | ⚠️ Partial | ❌ Not found

---

## Ticket Step 5: Test Coverage Validation

Search for OPP tag in test code (`group('OPP-XXXX:` / `describe('OPP-XXXX:` / `// OPP-XXXX`) or semantic match.
Per OPP: ✅ Test exists | ⚠️ Partial test | ❌ No test

---

## Ticket Step 6: Generate Analysis Table

```markdown
### Coverage Score
| Dimension          | Score | Detail |
|--------------------|-------|--------|
| AC → OPP Coverage  | {X}%  | {N}/{total} ACs have OPPs |
| OPP → AC Coherence | {X}%  | {N}/{total} OPPs map to ACs |
| Code Implementation| {X}%  | {N}/{total} ACs implemented |
| Test Automation    | {X}%  | {N}/{total} OPPs have tests |
| **Overall Health** | **{X}%** | Weighted average |

### Acceptance Criteria Coverage
| # | AC (summary) | OPP Coverage | Code | Test |

### OPP Test Cases Detail
| OPP Key | Summary | Maps to AC | Code | Test | Status |

### Gaps & Recommendations
| Priority | Gap | Action Needed |
```

**Scores:** Each dimension = (items with ✅) / total × 100. Overall = average of 4.

---

## Ticket Step 7: Offer Test Generation

If gaps exist: "Found {N} OPPs without tests. Invoke `coverage_test_generator_agent` to generate them."
