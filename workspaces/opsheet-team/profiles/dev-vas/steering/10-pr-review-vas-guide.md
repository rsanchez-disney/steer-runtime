---
inclusion: manual
---

# PR Review Guide — OpSheet+ VAS

## Purpose

Codified review criteria derived from analysis of recent team PRs. Use this when reviewing any PR in this repository.

---

## 1. PR Metadata Checks

### Branch Naming

Expected format: `{type}/OPS-{number}` or `{type}/OPS-{number}-{short-description}`

Where `{type}` is: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`

Common violations to flag:
- `feature/` instead of `feat/` (DEV003 pattern)
- Missing ticket number
- Inconsistent separator (underscore vs dash)

### Commit / PR Title

Expected: `{type}: OPS-{number} - {description}` or `{type}({scope}): OPS-{number} - {description}`

Flag these:
- Brackets around ticket: `[OPS-XXXXX]` — should be `OPS-XXXXX` (DEV002 pattern)
- Title type doesn't match "Type of change" selection (e.g., title says `feat:` but type says "Bug fix")
- Missing ticket number without justification

### PR Description

Minimum expectations:
- "Describe your changes" section must have more than a copy of the title
- For features: explain what was added and why
- For fixes: explain what was broken and how it was fixed
- For refactors: explain the motivation and what changed structurally

Flag: descriptions that are just the title repeated (common across all contributors).

### Checklist Compliance

All boxes should be explicitly checked or unchecked — not left default. Flag:
- Entirely unchecked checklists (PEREM666 pattern on some PRs)
- "Type of change" with nothing selected
- Screenshots missing when UI-facing changes are involved

---

## 2. Code Quality Checks

### No Test Artifacts in Production Code

Flag immediately:
- Imports from `../tests/` in any file under `src/` (excluding `src/tests/`)
- `console.log`, `console.warn`, `console.debug` in production code — use `@opsheet/logger` instead
- Mock data returned from controller/service methods
- Hardcoded placeholder responses (e.g., `return mockResponse`)

Known existing violations (do not let new ones in):
- `cle.controller.ts` imports mock response and has `console.log`
- `definition-tables.controller.ts` imports mock data
- `gate-counts-dashboards.controller.ts` imports mock data

### Type Safety

Flag:
- New uses of `any` in production code (tests are more lenient)
- Missing return types on controller/service methods
- Type assertions (`as any`) to bypass type checking in production code

### Architecture Compliance

This is a BFF — no business logic. Flag:
- Business logic in controllers (calculations, conditional transformations based on business rules)
- Services doing anything beyond HTTP calls + header forwarding
- Transformers with side effects or service calls
- Controllers calling other controllers directly

### Dependency Flow

```
Routes → Controllers → Services → Core APIs
                    → Processors → Services
                    → Transformers
```

Flag violations:
- Services importing from controllers or transformers
- Transformers importing from services
- Circular dependencies

### File Size

Flag controllers exceeding 500 lines — suggest splitting into domain-specific sub-controllers or extracting logic to processors.

### TODOs

New TODOs must include:
- Owner (who will address it)
- Ticket number (OPS-XXXXX)
- Brief justification

Format: `// TODO(OPS-XXXXX): description`

---

## 3. Per-Contributor Review Focus

### DEV001

- **Domains**: data-import, query utilities, test infrastructure, architecture
- **PR style**: large structural changes, cross-cutting refactors
- **Review focus**:
  - Verify PR scope is not too broad — suggest splitting if touching 10+ files across unrelated domains
  - Check that architectural changes (DI, middleware) maintain backward compatibility
  - Ensure branch type matches actual change (has used `feat/` for fixes)
  - Verify new test infrastructure patterns are documented

### DEV002

- **Domains**: shows, schedules, home-links, system-configuration, lanes
- **PR style**: small surgical fixes, 1-2 files, minimal descriptions
- **Review focus**:
  - Request more context in PR descriptions — "what was broken?" and "how does this fix it?"
  - Flag bracket format in titles: `[OPS-XXXXX]` → should be `OPS-XXXXX`
  - Verify model/interface changes propagate correctly (adding fields to responses)
  - Check that endpoint version changes (v1→v2) don't break existing clients

### DEV003

- **Domains**: lanes/wait-times, permissions, tipboard
- **PR style**: incremental features across multiple small PRs for same ticket
- **Review focus**:
  - Verify checklist is filled out (has skipped entirely on some PRs)
  - Check title/type consistency (titles say `feat:` but type selected is "Bug fix")
  - Flag `feature/` branch prefix → should be `feat/`
  - When multiple PRs target same ticket, verify each PR is independently deployable
  - Check permission changes are covered by tests

### DEV004

- **Domains**: CLE, merge points
- **PR style**: mock-first then integration, medium-sized PRs
- **Review focus**:
  - On mock PRs: verify mock data is NOT imported in production code paths — use feature flags or conditional logic instead
  - On integration PRs: verify all mock artifacts are removed (imports, console.log, hardcoded responses)
  - Check history integration follows existing pattern (HistoryTransformer.toItemsWithHistory)
  - Verify new CLE service methods follow RestAPIService patterns

---

## 4. Testing Expectations

- New controller methods: must have corresponding test in `src/tests/domains/{domain}/`
- New service methods: must have corresponding test
- New transformer methods: must have corresponding test
- Test pattern: use `Mock.create<T>()` from `tests/helpers/generic-mock`
- Tests must call `.clear()` on mocks in `afterEach`
- Avoid `any` in test type definitions when possible — prefer `Partial<Context>`

---

## 5. Quick Checklist for Reviewers

```
[ ] Branch name follows {type}/OPS-{number} format
[ ] Title follows {type}: OPS-{number} - {description} format
[ ] Title type matches "Type of change" selection
[ ] Description explains what and why (not just repeats title)
[ ] Checklist is filled out (not left default)
[ ] No imports from src/tests/ in production code
[ ] No console.log/warn/debug in production code
[ ] No new `any` types in production code without justification
[ ] No mock data returned from production methods
[ ] Architecture layers respected (no business logic in BFF)
[ ] Tests added/updated for new code
[ ] File sizes reasonable (<500 lines for controllers)
[ ] New TODOs have owner + ticket
```
