# Coverage Framework

Shared configuration and standards for coverage analysis and test generation across all platforms.

## Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Coverage_Threshold | 80% | Minimum acceptable coverage (OPP + code) |
| Max_MCP_Calls | 20 | Max sequential MCP calls before writing cache |
| Max_Test_Files | 30 | Max test files to scan per analysis |
| Large_Epic_Limit | 8 | Ticket count threshold for two-pass approach |
| Max_Files_Per_Feature | 5 | Max source files processed per feature in coverage loop |
| Max_Stall_Iterations | 3 | Stop if no >2% gain after this many iterations |
| Max_Fix_Attempts | 3 | Max attempts to fix a failing test before marking TODO |

## Coverage Metrics

### OPP Coverage (XRay Test Cases)

Measures whether each XRay test scenario has a corresponding automated test.

```
OPP Coverage % = (Covered + (Partially Covered × 0.5)) / Total XRay_Test_Cases × 100
```

| Status | Symbol | Criteria |
|--------|--------|----------|
| Covered | ✅ | OPP tag found in code OR exact semantic match |
| Partially Covered | ⚠️ | Related test exists but different scenario |
| Not Covered | ❌ | No corresponding test exists |

### Code Coverage (Line Coverage)

Measures actual source lines executed by tests, as reported by the platform's coverage tool.

| Status | Threshold | Symbol |
|--------|-----------|--------|
| Healthy | ≥80% | ✅ |
| Warning | 60-79% | ⚠️ |
| Critical | <60% | ❌ |

### Why Both Metrics Matter

| Metric | What it measures | Can be 100% while the other is low |
|--------|-----------------|-------------------------------------|
| OPP Coverage | "Do I have a test for each XRay scenario?" | Yes — tests may only cover happy paths |
| Code Coverage | "What % of source lines do my tests execute?" | Yes — tests may exist but not map to any OPP |

**Both must be ≥80% for healthy coverage.**

## Report Schema

Reports are written to: `.kiro/specs/qa-coverage-analyzer/reports/{Epic}_{Team}_{YYYY-MM-DD}.md`

Cache files are written to: `.kiro/specs/qa-coverage-analyzer/cache/{Epic}_{Team}_test-cases.md`

### Report Sections (Epic Mode)

1. Executive Summary table (stories, bugs, XRay TCs, covered/partial/not covered, global %)
2. Coverage by Ticket table
3. Coverage Gaps (all ❌ items per ticket)
4. Tickets Without QA Cases
5. Matching Code Tests Found (feature directory summary)
6. Code Coverage by Feature (line coverage from platform tool)

**Rules:** Reports must be under 200 lines. Truncate summaries to 60 characters in tables.

## Team Label → Platform Mapping

| Team_Label | Platform | Test Directory (default) |
|------------|----------|--------------------------|
| OpSheet_Mobile | Flutter | `test/src/features/` |
| OpSheet_Web | Angular | `src/app/` (spec files colocated) |
| OpSheet_Core | (ask user) | Configurable per project |
| VAS | Node | (ask user) |

## Platform Detection

Detect platform from project files when Team_Label is unavailable:

| Indicator | Platform | Coverage Skill Pattern |
|-----------|----------|-----------------------|
| `pubspec.yaml` in project root | Flutter | `coverage-lcov-flutter` |
| `angular.json` or `karma.conf.js` | Angular | `coverage-karma-angular` |
| `go.mod` in project root | Go | `coverage-go` (future) |
| `package.json` with `jest` or `nyc` | Node | `coverage-nyc-node` (future) |

If no platform detected: inform user "Coverage measurement for this platform is not yet configured."

## OPP Tag Format

Every test group covering an XRay test case MUST include the OPP ticket key:

```
group('OPP-4304: No Actual Schedule', () => { ... })      // Dart
describe('OPP-4304: No Actual Schedule', () => { ... })   // TypeScript/JavaScript
t.Run("OPP-4304: No Actual Schedule", func(t *testing.T) { ... })  // Go
```

## XRay Test Steps Retrieval

**ALWAYS** use `jira_get_issue` with `customFields: ["customfield_20104"]` to retrieve test steps.
**NEVER** use `xray_get_test_steps` or `xray_get_test_case_full` — these endpoints return 404.

Response format:
```json
{"steps": [{"index": 1, "fields": {"Action": "...", "Data": "...", "Expected Result": "..."}}]}
```
