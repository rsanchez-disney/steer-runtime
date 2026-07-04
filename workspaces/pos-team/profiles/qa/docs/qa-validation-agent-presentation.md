# QA Validation Agent

## AI-Powered Regression Test Validation

---

## The problem

Manual validation of regression test coverage against epic requirements is:

- **Time-consuming** — each epic has multiple acceptance criteria, business rules, and edge cases
- **Error-prone** — reviewers may miss coverage gaps, especially in complex tax/financial scenarios
- **Inconsistent** — different reviewers apply different rigor to coverage analysis
- **Unscalable** — as release scope grows (GLB 2.1.3 has 20+ epics), manual QA validation becomes a bottleneck

---

## The solution: QA Validation Agent

An AI agent that **automatically validates regression test sets against epic requirements**, identifying coverage gaps, traceability issues, and risk areas before test execution begins.

---

## How it works

```text
┌─────────────────────────────────────────────────────────┐
│                    User Request                          │
│  "Validate POS-19406 regression tests against POS-1429" │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              QA Validation Agent                         │
│                                                         │
│  1. Fetch Epic (Jira MCP)                               │
│     - Requirements, ACs, business rules                 │
│     - Child stories, linked issues                      │
│                                                         │
│  2. Fetch Test Set (Jira + XRay MCP)                    │
│     - All tests in the set                              │
│     - Test descriptions, Cucumber scenarios             │
│     - Execution status, environments                    │
│                                                         │
│  3. Fetch Context (Confluence/MyWiki + GitLab)          │
│     - Wiki documentation referenced in epic             │
│     - Design docs, math examples                        │
│     - Source code changes (MR diffs)                    │
│                                                         │
│  4. Analyze Coverage                                    │
│     - Map tests → requirements                          │
│     - Identify gaps, risks, boundaries                  │
│     - Score coverage confidence                         │
│                                                         │
│  5. Generate Report                                     │
│     - Coverage matrix                                   │
│     - Gap analysis with recommendations                 │
│     - Risk assessment                                   │
└─────────────────────────────────────────────────────────┘
```

---

## MCP integrations

| MCP Server | Purpose                                           | Key Tools Used                                                            |
|------------|---------------------------------------------------|---------------------------------------------------------------------------|
| Jira       | Epic requirements, test sets, XRay test cases     | `jira_get_issue`, `xray_get_test_set_tests`, `xray_get_test_case_full`    |
| GitLab     | Source code changes, MR diffs for impact analysis | `gitlab_get_mr`, `gitlab_get_file`, `gitlab_search_mrs`                   |
| MyWiki     | Design documents, business rules, math examples   | `get_confluence_page`, `search_confluence_pages`                          |

---

## User perspective and reach

### Who uses it

| Persona          | Use Case                                                    | Value                                            |
|------------------|-------------------------------------------------------------|--------------------------------------------------|
| **QA Lead**      | Validate test plan completeness before sprint execution     | Catch gaps early, reduce defect escape rate      |
| **QA Engineer**  | Verify their test set covers all ACs for a specific epic    | Confidence before marking test set as "ready"    |
| **Scrum Master** | Assess QA readiness for release sign-off                    | Data-driven release go/no-go decisions           |
| **BA/PO**        | Confirm requirements are traceable to test cases            | Requirements traceability without manual mapping |
| **Dev Lead**     | Understand what is tested before merging high-risk changes  | Reduced risk of untested code reaching production|

### Reach

- **Per sprint:** 5–15 test sets validated per regression cycle
- **Per release (GLB 2.1.3):** 20+ epics × multiple test sets = 60+ validations
- **Time savings:** ~30 min manual review → ~2 min automated analysis per test set
- **Projected impact:** 15–20 hours saved per regression cycle

---

## Output example

The agent produces a structured validation report:

```markdown
## Validation: POS-19406 vs POS-1429 (Inclusive Gratuities)

### Coverage Matrix
| Requirement                            | Covered | Test      | Status |
|----------------------------------------|---------|-----------|--------|
| Taxable inclusive grat + Exclusive tax  | ✅      | POS-18429 | PASS   |
| Taxable inclusive grat + Inclusive tax  | ✅      | POS-18430 | PASS   |
| Non-taxable inclusive grat + Excl. tax | ✅      | POS-18431 | PASS   |
| Non-taxable inclusive grat + Incl. tax | ✅      | POS-18432 | PASS   |
| Revenue Report disaggregation          | ❌      | —         | —      |
| CAP downstream payload separation      | ❌      | —         | —      |

### Risk Assessment: 🟡 CONDITIONAL
- Core scenarios covered (4/4 valid combinations)
- Downstream/reporting gaps identified
- Recommendations: Add Revenue Report + CAP tests

### Confidence Score: 65% (FoH covered, BoH/downstream gaps)
```

---

## Complete prompt model

Below is the full prompt template used by the agent to validate each test case against a specific epic and its related issues.

---

### System prompt (agent configuration)

```text
You are the QA Validation Agent. Your purpose is to validate that regression
test sets provide adequate coverage for epic requirements.

You have access to:
- Jira MCP: fetch epics, stories, test sets, XRay test cases
- GitLab MCP: fetch merge requests, code diffs, file contents
- MyWiki/Confluence MCP: fetch design docs, business rules, wiki pages

Your output must be structured, actionable, and risk-scored.
```

---

### Validation prompt template

```text
## Task: Validate Regression Test Coverage

### Inputs
- Test Set: {TEST_SET_KEY} (e.g., POS-19406)
- Epic: {EPIC_KEY} (e.g., POS-1429)

### Execution Steps

**Step 1: Gather Epic Context**

Fetch the epic using Jira MCP:
- Get issue {EPIC_KEY} with fields: summary, description, labels, components
- Extract: user story, acceptance criteria, business rules, scope exclusions
- Get child issues of {EPIC_KEY} for sub-stories and sub-tasks
- Get linked issues for related bugs, dependencies, design tickets
- If the description references wiki pages, fetch them via Confluence MCP
- If the description references design docs or spreadsheets, note them as
  external context

**Step 2: Gather Test Set Context**

Fetch the test set using XRay/Jira MCP:
- Get test set {TEST_SET_KEY} details (summary, status, labels)
- Get all tests in the test set via xray_get_test_set_tests
- For each test, fetch full details via xray_get_test_case_full:
  - Summary (what it validates)
  - Description (detailed scenario)
  - Cucumber feature/scenario text (customfield_20102)
  - XRay repository path (customfield_20111) — confirms traceability
  - Test environment (customfield_20125)
  - Platform (customfield_11500: Android, iOS, Web)
  - Last execution status
  - Test type (Manual, Cucumber, Generic)

**Step 3: Gather Code Context (if applicable)**

If the epic has associated merge requests in GitLab:
- Search for MRs with the epic key in title/description
- Review changed files to understand implementation scope
- Identify modules affected (helps assess test boundary coverage)

**Step 4: Requirement Decomposition**

Break the epic into discrete, testable requirements:
1. Parse the description for numbered requirements, bullet points, ACs
2. Identify business rules (explicit and implicit)
3. Note scope exclusions (what is explicitly NOT covered)
4. Identify boundary conditions and edge cases
5. Note downstream/integration touchpoints (CAP, Revenue Report, receipts)
6. Identify UI/UX requirements (PAX display, receipt format)
7. Identify configuration requirements (Connect/Back Office setup)

Produce a numbered list of requirements:
- R1: {requirement description}
- R2: {requirement description}
- ...

**Step 5: Coverage Mapping**

For each requirement Rn, determine if a test in the set covers it:
- COVERED (✅): A test explicitly validates this requirement
- IMPLICIT (⚠️): A test likely covers this as part of a broader scenario,
  but it is not the primary focus — confirm in Cucumber steps
- NOT COVERED (❌): No test addresses this requirement
- OUT OF SCOPE (➖): Requirement is explicitly excluded from this test set

**Step 6: Gap Analysis**

For each NOT COVERED requirement, assess:
- Severity: Critical / High / Medium / Low
  - Critical: financial calculation, data integrity, security
  - High: user-facing behavior, downstream integration
  - Medium: edge case, configuration validation
  - Low: documentation, nice-to-have boundary test
- Risk: What could go wrong if this is not tested?
- Recommendation: Specific test to add or confirm in existing scenarios

**Step 7: Cross-Cutting Checks**

Evaluate non-functional coverage:
- Platform coverage: Are all target platforms tested (Android, iOS, Web)?
- Environment coverage: Are tests run on appropriate environments?
- Data setup: Do tests require manual data setup? Is that documented?
- Negative scenarios: Are failure/error paths tested?
- Regression safety: Could this change break adjacent features?

**Step 8: Produce Report**

Generate the final validation report with:

1. **Context Summary** — one-paragraph overview of epic and test set
2. **Tests in Set** — table with key, summary, status, relevance to epic
3. **Coverage Matrix** — requirement × test mapping with status
4. **Gap Analysis** — prioritized list of uncovered requirements
5. **Risk Assessment** — overall score:
   - 🟢 PASS: All critical and high requirements covered
   - 🟡 CONDITIONAL: Critical covered, high gaps exist
   - 🔴 BLOCKED: Critical requirements not covered
6. **Recommendations** — specific, actionable next steps

### Output Format

Use markdown tables with aligned columns. Be concise but thorough.
Cite specific test keys (POS-XXXXX) when referencing coverage.
Note when a finding requires confirmation in Cucumber step definitions
that could not be fully inspected.
```

---

### Example invocation

```text
User: Validate regression testing tickets linked to POS-19406 against POS-1429

Agent executes:
1. jira_get_issue("POS-1429") → extracts 4 valid scenarios, downstream rules
2. jira_get_issue("POS-19406") → confirms Test Set, "Tips & Gratuities"
3. xray_get_test_set_tests("POS-19406") → 4 tests found
4. xray_get_test_case_full("POS-18429") → Taxable + Exclusive Tax
5. xray_get_test_case_full("POS-18430") → Taxable + Inclusive Tax
6. xray_get_test_case_full("POS-18431") → Non-Taxable + Exclusive Tax
7. xray_get_test_case_full("POS-18432") → Non-Taxable + Inclusive Tax
8. Decomposes POS-1429 into requirements R1–R11
9. Maps 4 tests → R1–R4 (core scenarios) = COVERED
10. Identifies R5–R11 (downstream, UI, config) = NOT COVERED or IMPLICIT
11. Scores: 🟡 CONDITIONAL (core covered, downstream gaps)
12. Recommends: Add Revenue Report test, confirm CAP payload in scenarios
```

---

## Agent configuration

```json
{
  "name": "qa_validation_agent",
  "description": "Validates regression test sets against epic requirements",
  "tools": ["thinking", "knowledge"],
  "mcpServers": ["jira", "confluence", "mywiki", "gitlab"],
  "resources": [
    "qa_guidelines.md",
    "test_templates.md",
    "coverage_matrix_template.md"
  ],
  "hooks": {
    "agentSpawn": "git-context.sh"
  }
}
```

---

## Integration with existing workflow

```text
Sprint Planning          Development           QA Phase              Release
     │                       │                     │                    │
     │                       │                     │                    │
     ▼                       ▼                     ▼                    ▼
┌─────────┐           ┌──────────┐          ┌──────────┐        ┌──────────┐
│ BA writes│           │ Dev codes │          │ QA writes │        │ Release  │
│ stories  │           │ & merges  │          │ test sets │        │ sign-off │
└─────────┘           └──────────┘          └─────┬────┘        └─────▲────┘
                                                   │                    │
                                                   ▼                    │
                                          ┌────────────────┐           │
                                          │ QA Validation  │           │
                                          │ Agent runs     │───────────┘
                                          │                │
                                          │ • Coverage ✅  │
                                          │ • Gaps ⚠️     │
                                          │ • Risks 🔴    │
                                          └────────────────┘
```

The agent can be triggered:
- **Manually:** QA engineer asks for validation of a specific test set
- **On demand:** Scrum Master requests release-wide coverage report
- **Automated:** Hook on test set status change to "Ready for Review"

---

## Metrics and success criteria

| Metric                      | Target           | Measurement                                       |
|-----------------------------|------------------|---------------------------------------------------|
| Coverage gaps caught        | 80%+ before exec | Gaps found by agent vs. gaps found during testing |
| Time to validate            | < 3 min per TS   | Agent response time                               |
| False positive rate         | < 15%            | Gaps flagged that are actually covered            |
| Defect escape reduction     | 30% fewer in prod| Post-release defects in validated vs. unvalidated |
| QA confidence score accuracy| 85%+ correlation | Agent score vs. actual test execution outcome     |

---

## Next steps

1. **Pilot:** Run agent on all GLB 2.1.3 test sets (20+ validations)
2. **Iterate:** Refine prompt based on false positives/negatives
3. **Automate:** Add hook to trigger validation when test set is linked to an epic
4. **Scale:** Extend to validate test plans (not just test sets) and E2E coverage
5. **Integrate:** Feed gap recommendations directly into Jira as sub-tasks

---

## Appendix: supported validation patterns

| Pattern                       | Description                                          | Example                         |
|-------------------------------|------------------------------------------------------|---------------------------------|
| Test Set vs. Epic             | Validate one TS covers one epic's requirements       | POS-19406 vs. POS-1429         |
| Test Plan vs. Release         | Validate a TP covers all epics in a release          | POS-19385 vs. GLB 2.1.3 scope  |
| Test Set vs. Multiple Stories | Validate a TS covers several related child stories   | POS-19405 vs. POS-1936 children |
| Cross-set gap detection       | Find requirements not covered by ANY test set        | Release-wide gap report         |
| Regression impact analysis    | Given a code change, identify which tests should run | GitLab MR → impacted tests      |
