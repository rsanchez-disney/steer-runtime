# Skill: Coverage Karma Angular (Code Coverage)

Use this skill when you need to measure or improve actual line/branch coverage for Angular projects using Karma + Istanbul. This skill covers:
- **Baseline measurement** (analyzer — Epic Mode Phase 7)
- **Feature Mode** (analyzer — standalone coverage analysis)
- **Improvement loop** (generator — code coverage phase)

---

## Section A: Measuring Coverage (Baseline + Feature Mode)

### A.1: Run Coverage

```bash
ng test --project {project} --code-coverage --watch=false --browsers=ChromeHeadless
```

**If `ng` is not available:** fall back to `npx ng test ...`
**If the command fails:** log the module as "coverage unavailable" and continue.

**Note:** Angular CLI generates `coverage/lcov.info` (or `coverage/{project}/lcov.info` for multi-project workspaces).

### A.2: Extract and Filter

If coverage is generated per-project in a monorepo:
```bash
lcov --extract coverage/lcov.info '*/src/app/{feature}/*' -o coverage/{feature}.info --ignore-errors unused --quiet
lcov --remove coverage/{feature}.info '*.mock.ts' '*environments/*' '*index.ts' -o coverage/{feature}.info --ignore-errors unused --quiet
```

**Exclusions:**
- `*.mock.ts` — mock files
- `environments/` — environment configs
- `index.ts` — barrel files (re-exports only)
- `node_modules/` — dependencies
- `*.module.ts` — Angular module declarations (boilerplate)

If `lcov` not installed: inform user "Install lcov (`brew install lcov`)" and skip.

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
- Filter out excluded patterns

### A.5: Report Format

```markdown
## Code Coverage by Feature (Angular — line coverage)

| Feature/Module             | Lines Found | Lines Hit | Coverage | Status |
|----------------------------|-------------|-----------|----------|--------|
| wait-times/                | {LF}        | {LH}      | {X}%     | ⚠️     |
| entity-management/         | {LF}        | {LH}      | {X}%     | ❌     |
| **Total (scope)**          | {LF}        | {LH}      | **{X}%** | —      |

**Threshold:** ≥80% = ✅ | 60-79% = ⚠️ | <60% = ❌
```

### A.6: Feature Mode — Standalone Entry Point

When user provides a feature/module name instead of a ticket:
1. Validate `src/app/{feature}/` exists
2. Run steps A.1 → A.4 (scoped to that feature path)
3. Present report with per-file breakdown directly to user
4. If <80%: offer `coverage_test_generator_agent` in feature mode
5. Optional: open HTML report if generated at `coverage/`

---

## Section B: Improving Coverage (Generator Loop)

### B.1: Identify Low-Coverage Files

From the `.info` file, identify source files with coverage below 80%:
1. Parse `SF:` entries
2. Calculate per-file: `lines hit / lines found × 100`
3. Sort ascending (worst first)
4. Filter out `*.mock.ts`, `environments/`, `index.ts`, `*.module.ts`

Present to user:
> "Code coverage for `{feature}/`: {X}%
> Files below 80%:
> 1. `{file_name}.ts` — {X}%
> 2. `{file_name}.ts` — {X}%
>
> Ready to start?"

### B.2: Generate Coverage-Driven Tests

For each low-coverage source file (worst first):

1. **Read source** → identify uncovered branches (if/else, switch, ternary, catch blocks)
2. **Read existing spec file** → learn patterns (imports, TestBed config, mocks)
3. **Generate tests** targeting uncovered lines:
   - Focus on branches not yet exercised
   - Same patterns as existing tests
   - Descriptive names: `'should handle {scenario} when {condition}'`
4. **Run tests:** `ng test --project {project} --watch=false --browsers=ChromeHeadless`
   - Fix failures (max 3 attempts)
5. **Re-measure:**
   ```bash
   ng test --project {project} --code-coverage --watch=false --browsers=ChromeHeadless
   lcov --extract coverage/lcov.info '*/src/app/{feature}/*' -o coverage/{feature}.info --ignore-errors unused --quiet
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
| 2 | Error/exception paths (`catch`, `.subscribe(error)`) | Critical but untested |
| 3 | Null/undefined guards | Guards that never fire |
| 4 | Edge cases in service logic | Boundaries, empty arrays |
| 5 | Unused public methods | Dead code or missing integration |

**Do NOT test:**
- Angular module declarations (`*.module.ts`)
- Barrel files (`index.ts`)
- Environment files
- Simple getters/setters without logic

---

## Section C: Error Handling

| Scenario | Action |
|----------|--------|
| `ng` not found | Fall back to `npx ng test` |
| Chrome not available | Suggest `--browsers=ChromeHeadless` or skip |
| `lcov` not installed | Skip lcov phase, note "install lcov" |
| No spec files for feature | Report 0% |
| Tests fail during coverage run | Report partial, note failures |
| Coverage file empty after filtering | Report "0% (all excluded files)" |
| Feature directory not found | Skip, note in report |
