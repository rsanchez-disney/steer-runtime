# Defect Triage Criteria

## Verdict Decision Tree

```
Can we find the defect's epic (via epic link, labels, or components)?
├── NO → Mark as NO PARENT STORY
└── YES → Search for stories in the epic using summary keywords
         │
         Did we find a matching story with acceptance criteria?
         ├── NO matching story → Mark as NO PARENT STORY
         ├── Story found but no AC defined → Check for linked test cases (OPP)
         │    ├── Test cases found → Use test cases to inform verdict
         │    └── No test cases → Mark as NEEDS CLARIFICATION
         └── Story found with AC →
              │
              Does the defect contradict an explicit acceptance criterion?
              ├── YES → VALID — In Scope
              └── NO → Does the defect match a linked test case scenario (OPP)?
                       ├── YES → VALID — In Scope (Test Case)
                       └── NO → Is the behavior a reasonable implicit expectation?
                                ├── YES → VALID — Implicit
                                └── NO → Is this a regression (worked before, broken now)?
                                         ├── YES → VALID — Regression
                                         └── NO → Is this a new feature request?
                                                  ├── YES → REJECT — Enhancement
                                                  └── NO → Are the acceptance criteria ambiguous?
                                                           ├── YES → NEEDS CLARIFICATION
                                                           └── NO → REJECT — Out of Scope
```

## What Counts as "Implicit"

These behaviors are considered implicitly expected even if not stated in AC:
- Basic input validation for any form/field mentioned in the story
- Error messages for failed operations described in the story
- Loading states for async operations described in the story
- Correct HTTP status codes for API endpoints described in the story
- Data persistence for save/create operations described in the story
- Undo/cancel for destructive operations described in the story (if UI has a confirm dialog pattern)

## What Does NOT Count as "Implicit"

These require explicit AC to be considered in-scope:
- Performance thresholds (response time, load time)
- Accessibility compliance (WCAG, screen reader support)
- Cross-browser compatibility beyond the project's stated baseline
- Mobile responsiveness (unless the story explicitly targets mobile)
- Internationalization / localization
- Security hardening beyond basic auth
- Analytics / tracking events
- Email / notification triggers

## Parent Story Discovery

Bugs in this project rarely have direct links to parent stories. Use this strategy:

```
1. Check epic link field on the defect
2. If no epic link → infer from labels (OpSheet_DataImport, OpSheet_Schedules, etc.) or components
3. Search for stories within the epic by keyword:
   "Epic Link" = {EPIC} AND issuetype = Story AND summary ~ "{keywords}"
4. If no match → broaden keywords or try fewer terms
5. If still no match → mark as NO PARENT STORY
```

## JQL Templates

### Find defects for a team + labels
```
project = OPS AND issuetype in (Bug, Defect) AND team = {TEAM} AND status = "Ready for Development" AND labels in ({LABELS}) ORDER BY priority ASC
```

### Find stories within an epic by keyword
```
"Epic Link" = {EPIC_KEY} AND issuetype = Story AND summary ~ "{keyword1} {keyword2}" AND summary !~ "VAS CORE GET POST PUT UPSERT UPDATE \"Reference Table\""
```

### Find stories within an epic (all, excluding technical)
```
"Epic Link" = {EPIC_KEY} AND issuetype = Story AND summary !~ "VAS CORE GET POST PUT UPSERT UPDATE \"Reference Table\"" ORDER BY created ASC
```

### Find linked test cases for a story (OPP project)
```
issue in linkedIssues("{STORY_KEY}") AND project = OPP AND issuetype = Test
```

## Test Case Discovery (OPP Project)

Test cases in this project are stored in the **OPP** Jira project and linked to OPS stories. They provide detailed test scenarios that can help determine if a defect is in-scope.

### How to Find Test Cases
1. Once you have the parent story (e.g., OPS-9584), search for linked OPP tickets:
   ```
   issue in linkedIssues("OPS-9584") AND project = OPP AND issuetype = Test
   ```
2. Fetch each OPP ticket to get the test case details

### How to Extract Test Steps
Test steps are stored in the custom field `customfield_20104`. This field contains detailed test scenarios including:
- Step-by-step actions
- Expected results for each step
- Test data and preconditions

### How Test Cases Affect Triage
| Scenario | Impact on Verdict |
|----------|-------------------|
| Defect matches a test case step | Strengthens **VALID — In Scope** verdict |
| Defect describes behavior explicitly tested | Likely **VALID** |
| Test case clarifies ambiguous AC | Helps resolve **NEEDS CLARIFICATION** |
| No matching test case, but AC is clear | Test case absence doesn't change verdict |
| No AC and no test cases | **NEEDS CLARIFICATION** |

### Source of Truth Hierarchy
1. **Primary:** Story Acceptance Criteria (signed-off by client)
2. **Secondary:** Global Acceptance Criteria (MyWiki)
3. **Tertiary:** Linked Test Cases (OPP project)

Test cases supplement but do not override the story's acceptance criteria.

## Technical Story Exclusion

Not all stories have signed-off acceptance criteria. Use this two-tier approach to determine which stories are valid for comparison:

### Tier 1 — Product Label (primary filter)
Stories with the label `Product` always have client-signed acceptance criteria. These are the preferred stories for comparison.

### Tier 2 — Technical Stories with Sign-Off (secondary filter)
Stories with the label `Technical` (or without the `Product` label) are usually backend/API tasks without business AC. However, some technical stories DO have signed-off AC. To check:
1. Fetch the story's sub-tasks
2. Look for a sub-task named **"Product Requirements Sign Off"**
3. If found → the story has signed-off AC and CAN be used for comparison
4. If not found → discard the story

### Summary Keyword Exclusion (additional filter)
Stories with these words in their summary are almost always technical tasks. Discard them unless they passed Tier 2:
- **VAS** — VAS layer endpoint stories
- **CORE** — Core service endpoint stories
- **GET** — API read endpoint stories
- **POST** — API create endpoint stories
- **PUT** — API update endpoint stories
- **UPSERT** — API upsert endpoint stories
- **UPDATE** — Database/API update stories
- **Reference Table** — Configuration/reference data stories

Only compare defects against **business-facing stories** that contain user stories with signed-off acceptance criteria.

**Important:** Jira's `!~` operator does not reliably exclude multi-word terms or multiple keywords. Always filter results programmatically after fetching — scan each story's summary and labels to apply the rules above.

## Triage Labels

| Label | Meaning |
|-------|---------|
| `triage-valid` | Defect is in-scope, should be fixed |
| `triage-valid-implicit` | Defect is implicitly expected, should be fixed |
| `triage-valid-testcase` | Defect matches a linked test case scenario |
| `triage-reject-oos` | Defect is out of scope for the original story |
| `triage-reject-enhancement` | Defect is actually a new feature request |
| `triage-needs-clarification` | Ambiguous — needs PO decision |
| `triage-no-parent` | No linked story found — needs manual linking |
| `triage-regression` | Regression — valid regardless of current AC |
| `triage-duplicate` | Duplicate of another defect |
