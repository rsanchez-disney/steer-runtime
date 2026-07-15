# Pre-commit Validation Rule

Run pre-commit hooks against changed files as part of the review process. Map results to severity levels and include in findings.

## When This Rule Activates

- Every PR review for `standalone_tickets` that includes Python files
- Only for Python files (`.py`) — skip for `.feature`, `.json`, `.csv`, `.ini`, `.md` files

---

## Process

### Step 1: Get Changed Python Files

```bash
# From git diff
git diff main...HEAD --name-only -- '*.py'
```

If no Python files changed, skip this rule entirely and report: "Pre-commit: N/A — no Python files in diff"

### Step 2: Run Pre-commit

```bash
# Run pre-commit against only the changed files
cd <repo_root>
pre-commit run --files <space-separated list of changed .py files>
```

**Important:** Run from the repository root where `.pre-commit-config.yaml` exists.

### Step 3: Parse Results

Pre-commit outputs each hook's result. Parse and classify:

| Hook | On Failure → Severity | Auto-fixable? | Fix Command |
|------|----------------------|---------------|-------------|
| `ggshield` | 🔴 CRITICAL | No | Remove the secret, rotate credentials |
| `black` | ℹ️ INFO | Yes | `black --line-length=120 <file>` |
| `isort` | ℹ️ INFO | Yes | `isort <file>` |
| `flake8` | ⚠️ WARNING | No | Manual fix per violation |
| `mypy` | ⚠️ WARNING | No | Fix type errors |
| `interrogate` | ⚠️ WARNING | No | Add missing docstrings |
| `stui-docstring-lint` | ⚠️ WARNING | No | Fix docstring format per STUI standards |

### Step 4: Extract Specific Violations

For hooks that report file-level details, extract:

#### ggshield (secrets)
```
🔴 CRITICAL: Secret detected
File: common/authentication.py
Type: Generic High Entropy Secret
Line: 45
```

#### black (formatting)
```
ℹ️ INFO: Formatting issue (auto-fixable)
File: common/utils.py
Auto-fix: `black --line-length=120 common/utils.py`
```

#### isort (import order)
```
ℹ️ INFO: Import order issue (auto-fixable)
File: common/guest_helper.py
Auto-fix: `isort common/guest_helper.py`
```

#### flake8 (style)
```
⚠️ WARNING: Style violation
File: common/booking_tickets.py line 45
E501: line too long (125 > 120 characters)
```

**Note:** flake8 is configured to ignore E722 and E203 (per `.pre-commit-config.yaml`).

#### mypy (types)
```
⚠️ WARNING: Type error
File: common/date_formatter.py line 23
error: Incompatible return value type (got "str", expected "Optional[datetime]")
```

#### interrogate (docstring coverage)
```
⚠️ WARNING: Docstring coverage below threshold
Coverage: 72% (need ≥80%)
Files below threshold:
  - common/new_helper.py: 60%
  - brand/dlr_pages.py: 75%
```

#### stui-docstring-lint (custom rules)
```
⚠️ WARNING: Docstring standard violation
File: common/general_common_steps/login_steps.py line 34
Violation: Step definition has :return: tag (steps must NEVER have :return:)
```

### Step 5: Report Results

Include in the review output:

```markdown
### Pre-commit Results

| Hook | Status | Details |
|------|--------|---------|
| ggshield | ✅ Passed | No secrets detected |
| black | ℹ️ Fix available | 2 files need formatting |
| isort | ✅ Passed | Imports sorted correctly |
| flake8 | ⚠️ 3 violations | E501 (2), W291 (1) |
| mypy | ✅ Passed | No type errors |
| interrogate | ⚠️ Below threshold | 76% coverage (need ≥80%) |
| stui-docstring-lint | ✅ Passed | All docstrings valid |

**Auto-fix available:**
```bash
black --line-length=120 common/utils.py common/booking_tickets.py
```
```

---

## Error Handling

| Situation | Action |
|-----------|--------|
| `pre-commit` not installed | Report as ℹ️ INFO: "Pre-commit not available — install with `pip install pre-commit` then `pre-commit install`" |
| `.pre-commit-config.yaml` not found | Report as ℹ️ INFO: "No pre-commit config found — skipping automated checks" |
| Hook fails to run (not installed) | Report which hook failed, suggest `pre-commit install-hooks` |
| Timeout on large file set | Run hooks on first 20 files, note that partial results were obtained |
| Virtual environment not active | Try `uv run pre-commit run --files ...` as fallback |

---

## Integration with Review Verdict

Pre-commit results contribute to the overall verdict:

| Pre-commit Result | Impact on Verdict |
|-------------------|-------------------|
| ggshield FAILS | → 🔴 CHANGES REQUESTED (blocks PR) |
| Only black/isort failures | → Does NOT affect verdict (auto-fixable) |
| flake8 failures | → Adds to WARNING count |
| mypy failures | → Adds to WARNING count |
| interrogate below 80% | → Adds to WARNING count |
| stui-docstring-lint failures | → Adds to WARNING count |

---

## Important Notes

1. **Pre-commit runs on the LOCAL file state** — if files are not staged, results may differ from what CI would see
2. **ggshield requires a GitGuardian API key** — if not configured, it will fail (report as INFO, not CRITICAL)
3. **mypy may have false positives** for dynamically-typed Behave context objects — note this in findings
4. **stui-docstring-lint is a custom hook** (`uv run lint_docstrings.py`) — it validates Dory-specific Sphinx conventions

## Language

Always write pre-commit findings in English.
