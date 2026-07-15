# Dory Golden Rules — PR Review Standards

These rules are enforced for ALL code changes to `standalone_tickets` and `jenkins-config`. Violations at CRITICAL level block the PR.

---

## 🔴 CRITICAL (Blocks PR)

### Security
| # | Rule | Detection |
|---|------|-----------|
| C1 | No hardcoded secrets, tokens, API keys, PII, or internal URLs | Scan for patterns: `password=`, `token=`, `api_key=`, `secret=`, base64 strings, `.disney.com` URLs with credentials |
| C2 | No credentials in commit | ggshield pre-commit hook must pass |

### Python / Behave
| # | Rule | Detection |
|---|------|-----------|
| C3 | No `time.sleep()` or arbitrary fixed timeouts | Search for `sleep(`, `time.sleep` — use explicit waits (WebDriverWait, custom wait helpers) |
| C4 | No generic `except Exception:` | Search for bare `except:` or `except Exception:` — catch specific exceptions |
| C5 | No business logic in step definitions | Step functions must only orchestrate (call page objects, helpers, services) — no conditionals, loops, or data transformation >3 lines |
| C6 | No direct WebElement interaction in steps | Step functions must NOT call `find_element`, `click()`, `send_keys()` directly — must go through page objects in `frontend/` or `brand/` |
| C7 | No shared mutable state across scenarios | No `context.shared_data`, no module-level mutable variables, no runtime JSON writes for shared state |
| C8 | Step definitions must not be undefined | Every step in changed `.feature` files must have a matching `@step(...)` implementation |
| C9 | Step definitions must not be duplicated | No two `@step(...)` decorators with overlapping regex that could cause Behave `AmbiguousStep` error |
| C10 | Scenario Outline with Examples required | All new scenarios MUST be `Scenario Outline` with `Examples` table (no plain `Scenario` for new tests) |

### Jenkins
| # | Rule | Detection |
|---|------|-----------|
| C11 | Jobs must use `JobHelper` or `JobHelperMobile` for parameters | No inline `stringParam`, `choiceParam` without helper — use `JobHelper.getWebJobParameters()` |
| C12 | Breaking parameter changes must be flagged | Removing or renaming a job parameter breaks CI — flag as breaking change |

---

## ⚠️ WARNING (Does NOT block, must be acknowledged)

### Code Quality
| # | Rule | Detection |
|---|------|-----------|
| W1 | Methods must be ≤20 lines | Count non-blank, non-comment lines in method body |
| W2 | Sphinx-style docstrings required | Steps: NEVER `:return:` tag. POM methods: ALWAYS `:return:` tag (except `__init__`). Native types inline: `:param str name:` |
| W3 | `snake_case` naming everywhere | Methods, variables, functions, file names |
| W4 | No hardcoded business IDs | No literal `product_id`, `component_id`, `revenue_id` — use config or data files |
| W5 | No greedy `.+` in step matchers | Use constrained patterns: `"(?P<store>[^"]+)"` not `"(.+)"` |
| W6 | No date comparison as raw strings | Use proper date handling (dateparser, datetime, dateutil) |
| W7 | Prefer existing helpers/pages/services | Do not duplicate logic that already exists in `common/`, `brand/`, `frontend/`, `api/` |
| W8 | Pre-commit hooks must pass | All 7 hooks (ggshield, black, isort, flake8, mypy, interrogate, docstring linter) |

### BDD / Gherkin
| # | Rule | Detection |
|---|------|-----------|
| W9 | PR must not exceed 250 lines | Unless justified — Product Validators exempt |
| W10 | PR must not group unrelated test cases | One logical change per PR |
| W11 | Names must be representative | Methods, variables, feature names, scenario titles — meaningful and descriptive |
| W12 | BDD scenarios must follow Gherkin best practices | No imperative style (click this, type that) — declarative business steps |
| W13 | Feature files: tags at Examples level, Jira/Xray at Scenario level | Filtering tags (web/mobile/brand) on Examples; tracking tags on Scenario |
| W14 | Steps must be business-oriented | "I complete checkout" not "I click the submit button and wait for redirect" |

### Jenkins
| # | Rule | Detection |
|---|------|-----------|
| W15 | Jobs must follow standard structure | parameters → triggers → wrappers → steps → publishers |
| W16 | Must reference existing executor scripts | Use `readFileFromWorkspace('script_bash_*')` — no inline bash blocks |
| W17 | Shared helper changes require impact analysis | Modifying `JobHelper.groovy` or `JobHelperMobile.groovy` affects all jobs |

### Breaking Changes
| # | Rule | Detection |
|---|------|-----------|
| W18 | Step regex changes flag affected features | Modified `@step('...')` regex → scan all `.feature` files for impacted scenarios |
| W19 | Shared helper changes flag dependents | Modified `common/utils.py`, `common/guest_helper.py`, etc. → identify all importing modules |
| W20 | Jenkins parameter changes flag downstream | Modified/removed params → identify affected job executions |

---

## ℹ️ INFO (Suggestions)

| # | Rule | Detection |
|---|------|-----------|
| I1 | Consider extracting magic numbers to constants | Literal numbers in code (timeouts, retry counts, sizes) |
| I2 | Consider using `@allure.step` for workflow methods | Service calls and workflow orchestration methods |
| I3 | Consider using `context.brand`, `context.platform`, `context.browser` | Over hardcoding brand/platform strings |
| I4 | Consider adding `@allure.severity` to scenarios | Helps prioritize test failures in reports |
| I5 | Formatting issues are auto-fixable | `black --line-length=120 <file>` or `isort <file>` |

---

## Enforcement

These rules are checked at review time:
1. **Automated:** Pre-commit hooks (C1, C2, W2, W8, I5)
2. **Step validation:** Undefined/duplicate step detection (C8, C9)
3. **Breaking change scan:** Regex changes, helper changes, parameter changes (W18, W19, W20)
4. **Manual review:** Architecture, BDD quality, naming (C5, C6, W12, W14)

### Verdict Logic

| Condition | Verdict |
|-----------|---------|
| 0 critical, 0 warnings | ✅ APPROVED |
| 0 critical, any warnings | 🟡 APPROVED WITH WARNINGS |
| Any critical | 🔴 CHANGES REQUESTED |
