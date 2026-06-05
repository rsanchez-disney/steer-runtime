# Skill: Coverage lcov (Code Coverage)

Use this skill when you need to measure or improve actual line/branch coverage using `lcov`. This skill covers:
- **Baseline measurement** (analyzer — Epic Mode Phase 7)
- **Feature Mode** (analyzer — standalone lcov analysis)
- **Improvement loop** (generator — Phase 7)

---

## Section A: Measuring Coverage (Baseline + Feature Mode)

### A.1: Run Coverage Per Feature

```bash
fvm flutter test test/src/features/{feature}/ --coverage
```

**If `fvm` is not available:** fall back to `flutter test test/src/features/{feature}/ --coverage`
**If the command fails:**
- **Environment error** (fvm not found, lcov not installed, directory doesn't exist): inform the user with the error and **stop execution**. "⚠️ {error}. Please fix the environment and retry."
- **Compilation error** in test file(s): inform the user, then attempt to fix (max 2 attempts). Read the failing file, fix the compilation issue (broken import, missing mock, etc.), and re-run. If still failing after 2 attempts: stop and report the error.
- **Test assertion failure** (tests run but some fail): coverage data is still collected from passing tests. Inform the user which tests failed but continue with coverage analysis.

### A.2: Extract and Filter

```bash
lcov --extract coverage/lcov.info '*/{feature}/*' -o coverage/{feature}.info --ignore-errors unused --quiet
lcov --remove coverage/{feature}.info '**/*.g.dart' '**/*.freezed.dart' -o coverage/{feature}.info --ignore-errors unused --quiet
```

**Rules:**
- Always exclude generated files (`*.g.dart`, `*.freezed.dart`)
- If `lcov` not installed: inform user "Install lcov (`brew install lcov`)" and skip.

### A.3: Parse Coverage Percentage

```bash
lcov --summary coverage/{feature}.info --quiet 2>&1 | grep -i "lines"
```

Or parse `DA:` lines in the `.info` file:
- `DA:{line},{hits}` where `hits > 0` = covered
- `Coverage % = covered lines / total lines × 100`

### A.4: Per-File Breakdown

For each `SF:` entry in the `.info` file:
- Count `DA:` lines with hits > 0 (covered) vs total (found)
- Calculate per-file percentage
- Sort by coverage ascending (worst first)
- Filter out `*.g.dart` and `*.freezed.dart`

### A.5: Report Format

```markdown
## Code Coverage by Feature (lcov — line coverage)

| Feature Directory          | Lines Found | Lines Hit | Coverage | Status |
|----------------------------|-------------|-----------|----------|--------|
| wait_time_recommender/     | {LF}        | {LH}      | {X}%     | ⚠️     |
| entity_data_management/    | {LF}        | {LH}      | {X}%     | ❌     |
| **Total (scope)**          | {LF}        | {LH}      | **{X}%** | —      |

**Threshold:** ≥80% = ✅ | 60-79% = ⚠️ | <60% = ❌
```

### A.6: Feature Mode — Standalone Entry Point

When user provides a feature name instead of a ticket:
1. Validate `test/src/features/{feature}/` and `lib/src/features/{feature}/` exist
2. Run steps A.1 → A.4
3. Present report with per-file breakdown directly to user
4. If <80%: offer `coverage_test_generator_agent` in feature mode
5. Optional: `genhtml coverage/{feature}.info -o coverage/html_{feature} --quiet && open coverage/html_{feature}/index.html`

---

## Section B: Improving Coverage (Generator Loop)

### B.1: Identify Low-Coverage Files

From the `.info` file, identify source files with coverage below Coverage_Threshold (80%):
1. Parse `SF:` entries
2. Calculate per-file: `lines hit / lines found × 100`
3. Sort ascending (worst first)
4. Filter out `*.g.dart`, `*.freezed.dart`

Present to user:
> "Code coverage for `{feature}/`: {X}%
> Files below 80%:
> 1. `{file_name}.dart` — {X}%
> 2. `{file_name}.dart` — {X}%
>
> Ready to start?"

### B.2: Generate Coverage-Driven Tests

For each low-coverage source file (worst first):

1. **Read source** → identify uncovered branches (if/else, switch, try/catch)
2. **Read existing test file** → learn patterns (imports, mocks, setUp)
3. **Generate tests** targeting uncovered lines:
   - Focus on branches not yet exercised
   - Same patterns as existing tests
   - Descriptive names: `'should handle {scenario} when {condition}'`
4. **Run tests:** `fvm flutter test {test_file} --reporter=compact`
   - Fix failures (max 3 attempts)
5. **Re-measure:**
   ```bash
   fvm flutter test test/src/features/{feature}/ --coverage
   lcov --extract coverage/lcov.info '*/{feature}/*' -o coverage/{feature}.info --ignore-errors unused --quiet
   lcov --remove coverage/{feature}.info '**/*.g.dart' '**/*.freezed.dart' -o coverage/{feature}.info --ignore-errors unused --quiet
   ```
6. **Report:** `"{file}: {old}% → {new}% (+{delta}%)"`

### B.3: Loop Guards

- Feature reaches ≥80% → move to next feature
- 3 iterations without >2% gain → inform user, move on
- Max 5 source files per feature (context budget)
- User says "stop" or "skip" → stop/skip

### B.4: What to Test (Priority)

| Priority | Target | Why |
|----------|--------|-----|
| 1 | Uncovered `else` branches | Most common gap |
| 2 | Error/exception paths (`catch`, `onError`) | Critical but untested |
| 3 | Null/empty state handling | Guards that never fire |
| 4 | Edge cases in business logic | Boundaries, empty lists |
| 5 | Unused public methods | Dead code or missing integration |

**Do NOT test:**
- Generated code (`*.g.dart`, `*.freezed.dart`)
- Simple getters/setters without logic
- Framework boilerplate (`createState()`, `build()` without conditionals)

---

## Section C: Error Handling

| Scenario | Action |
|----------|--------|
| `fvm` not found | Fall back to `flutter test` |
| `flutter test` not available | Skip lcov phase, note in report |
| `lcov` not installed | Skip entirely, note "install lcov" |
| No test files for feature | Report 0% |
| Tests fail during coverage run | Report partial, note failures |
| Coverage file empty after filtering | Report "0% (all generated code)" |
| Feature directory not found | Skip, note in report |
