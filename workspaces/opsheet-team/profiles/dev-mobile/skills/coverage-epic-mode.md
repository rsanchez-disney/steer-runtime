# Skill: Coverage Epic Mode

Use this skill when the user provides an Epic ticket ID for bulk coverage analysis (OPP + lcov).

---

## Phase 2: JIRA/XRay Search

### Step 2.1: Find Tickets (Stories and Bugs)

Execute a JQL search to find all product tickets (both Stories and Bugs) for the team within the epic:

```
"Epic Link" = {Epic_Ticket} AND labels = Product AND labels = {Team_Label} AND issuetype in (Story, Bug)
```

**MCP Tool:** `jira_search_issues`

For each ticket returned, collect from the search results (no additional API calls):
- `key` (e.g., OPS-26191)
- `summary`
- `issuetype` (Story or Bug)
- `status` (e.g., In Progress, Done, In Analysis)

**Grouping:** Separate the results into two groups:
- **Stories**: tickets where `issuetype` = Story
- **Bugs**: tickets where `issuetype` = Bug

**Status filtering:** Only include tickets that have code implemented. Exclude tickets with status:
- "In Analysis", "To Do", "Backlog", "Open"

Include tickets with status:
- "In Progress", "Peer Review", "QA Review", "Done", "Closed", "In Review"

If a ticket is excluded by status, note it in the report as: `"{Key}: {Summary} — Excluded (status: {status}, no code to test)"`

### Step 2.2: Find Linked XRay Test Cases

For each ticket (Story or Bug), search for linked Test issues:

```
issue in linkedIssues("{ticketKey}") AND issuetype = Test
```

**MCP Tool:** `jira_search_issues`

Collect only `key` and `summary` from results. Do NOT call `jira_get_issue` for individual test cases.

**Filtering by Platform:** After retrieving linked test cases, filter them by the Team_Label platform:
- `OpSheet_Mobile`: only include test cases whose summary starts with "Mobile" or contains "Mobile" as a prefix segment.
- `OpSheet_Web`: only include test cases whose summary starts with "Web" or contains "Web" as a prefix segment.
- `VAS`: only include test cases whose summary starts with "VAS" or contains "VAS" as a prefix segment.
- `OpSheet_Core`: include all test cases (core is shared).

If a test case summary does NOT match the platform prefix, exclude it from the analysis.

**Pagination:** If the search returns `total > maxResults` (typically 50), use the first page only. Note the truncation in the report.

---

## Phase 3: Local Cache

### Step 3.1: Check for Existing Cache

Before fetching from JIRA, check if a cache file exists at:
`.kiro/specs/qa-coverage-analyzer/cache/{Epic}_{Team}_test-cases.md`

### Step 3.2: Ask User About Cache

If cache exists, ask:
> "I found cached data for this Epic + Team from a previous run. Would you like to use the cached data or re-fetch from JIRA?"

- If user chooses **cache**: read the local file and skip Phase 2 JIRA calls.
- If user chooses **re-fetch**: proceed with Phase 2 and overwrite the cache.

### Step 3.3: Write Cache File

After fetching from JIRA, write the cache file in a **single `fsWrite` call**.

Cache format:

```markdown
# {Epic_Key}: {Epic_Summary}
> Generated: {YYYY-MM-DD} | Team: {Team_Label}

---

## Stories

### {Story_Key}: {Story_Summary}
**Status:** {status}

#### Test Cases:
- **{TestCase_Key}:** {TestCase_Summary}

---

## Bugs

### {Bug_Key}: {Bug_Summary}
**Status:** {status}

#### Test Cases:
- **{TestCase_Key}:** {TestCase_Summary}

---

## Excluded Tickets
- {Key}: {Summary} — status: {status}
```

**Format Rules:**
- H1: Epic key + summary
- Metadata line: generation date and Team_Label
- H2: Type group header (`## Stories`, `## Bugs`, `## Excluded Tickets`)
- Each ticket is H3 with key + summary
- Status on a single line
- Test Cases as bullet list with bold key + summary (no step details)
- If a type group has no tickets, include the H2 header with: `> None found.`

---

## Phase 4: Repository Test Scanning

### Step 4.1: Find Test Files

Search for all `*_test.dart` files within the configured Test_Directory.

### Step 4.2: Extract Test Names

**Limit:** If more than 30 test files are found, warn the user:
> "⚠️ Found {N} test files (limit is 30). I'll read the first 30 sorted alphabetically."

For each test file (up to 30), read the file and extract:
- `group('...')` — test group names (can be nested)
- `test('...')` — individual test names
- `testWidgets('...')` — widget test names

### Step 4.3: Organize by Feature

Organize by directory structure: `test/src/features/{feature_name}/`

### Step 4.4: Handle Empty Results

If no test files found: "No automated test files found in `{Test_Directory}`." Continue (all marked "Not Covered").

---

## Phase 5: Cross-Coverage Analysis

### Step 5.1: OPP Tag Matching (Primary — Deterministic)

Search for explicit OPP ticket references in test code:
- `group('OPP-XXXX:` or `// OPP-XXXX` or test names containing `OPP-XXXX`
- If found → ✅ **Covered**

### Step 5.2: Semantic Matching (Secondary)

For remaining XRay test cases, search for semantic matches:
- Exact scenario match without OPP tag → ✅ **Covered** (note "tagging pending")
- Related but different scenario → ⚠️ **Partially Covered**
- No match → ❌ **Not Covered**

**Valid matches:** XRay "No Actual Schedule" → code "should not display button when no actual schedule"
**Invalid:** XRay "Bypass Permission" → code "should display entity name"

### Step 5.3: Classification

| Status | Symbol | Criteria |
|--------|--------|----------|
| Covered | ✅ | OPP tag found OR exact semantic match |
| Partially Covered | ⚠️ | Related test exists, different scenario |
| Not Covered | ❌ | No corresponding test |

### Step 5.4: Calculate Coverage

```
Coverage % = (Covered + (Partially × 0.5)) / Total × 100
```

---

## Phase 6: Report Generation

### Output Path

`.kiro/specs/qa-coverage-analyzer/reports/{Epic}_{Team}_{YYYY-MM-DD}.md`

**Write in ONE `fsWrite` call. Must be under 200 lines.**

Report includes:
- Executive Summary table (stories, bugs, XRay TCs, covered/partial/not covered, global %)
- Coverage by Ticket table
- Coverage Gaps section (all ❌ items per ticket)
- Tickets Without QA Cases
- Matching Code Tests Found (feature directory summary)

**Rules:**
- Truncate summaries to 60 characters in tables
- Do NOT include Full Traceability or per-story detail tables

---

## Error Handling

| Scenario | Action |
|----------|--------|
| JQL returns no tickets | Inform user, stop |
| JQL fails | Inform user, suggest checking MCP permissions |
| Timeout on JQL | Retry once, then offer cache |
| Linked tests > 50 | Use first page, note truncation |
| All tests filtered by platform | Mark as "0 test cases for {platform}" |
