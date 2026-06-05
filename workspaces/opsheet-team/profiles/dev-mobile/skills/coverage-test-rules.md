# Skill: Coverage Test Generation Rules

Activate this skill when generating Flutter tests for OPP gaps or lcov improvement. Contains guardrails, mapping rules, and structural conventions. For concrete code patterns (mocking, fakes, pump, overrides), refer to `context/flutter_test_patterns.md` which is always loaded as a resource.

---

## Critical Rules

1. **NEVER delete existing tests.** All existing tests must be preserved.
2. **If a test matches an OPP scenario:** Add the OPP tag to the group name only. Do NOT rewrite the test.
3. **If a test doesn't match any OPP scenario:** Leave it as-is.
4. **Only modify a test if it is genuinely broken** (fails to compile).
5. **NEVER use XRay REST endpoints** (`xray_get_test_steps`, `xray_get_test_case_full`) — they return 404. ALWAYS use `jira_get_issue` with `customFields: ["customfield_20104"]`.

---

## File Naming

File naming must mirror source files:
- Source: `lib/src/features/{feature}/{layer}/{file_name}.dart`
- Test: `test/src/features/{feature}/{layer}/{file_name}_test.dart`

**When adding tests:**
1. Identify which SOURCE file implements the functionality.
2. Find or create the corresponding test file (`{source_file_name}_test.dart`).
3. If the test file exists: add missing test cases within existing group structure.
4. If the test file does NOT exist: create it.
5. If you can't identify the source file, ask the user.

---

## XRay → Dart Mapping

| XRay Element     | Dart Element                                |
|------------------|---------------------------------------------|
| Story_Summary    | Top-level `group()`                         |
| TestCase_Summary | Nested `group()` — **MUST include OPP key** |
| Step action      | Individual `test()` or `testWidgets()`      |
| Preconditions    | Code in `setUp()` of the group              |
| Sequential steps | Single `test()` with sequential assertions  |

**Every generated test group MUST include the OPP ticket key:**

```dart
group('OPP-4304: No Actual Schedule', () {
  testWidgets('should not display recommender button when no actual schedule', (tester) async {
    // Arrange
    // Act
    // Assert
  });
});
```

---

## test vs testWidgets Decision

- **UI interactions** (tap, navigate, display, screen, widget, render, scroll): use `testWidgets`
- **Business logic** (validate, calculate, return, check, verify data): use `test`
- When in doubt: use `testWidgets`

---

## Context Budget

To avoid running out of context window:
- Max **3 source files** per ticket (main widget + 2 dependencies)
- Max **2 existing test files** per ticket (target + 1 reference)
- If a source file is >300 lines: focus only on the relevant method/widget
